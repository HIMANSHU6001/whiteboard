import express, { Request, Response } from "express";
import jwksRsa from "jwks-rsa";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

interface CustomRequest extends Request {
  user?: any;
}
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 5000;
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const server = http.createServer(app);

// Set up socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // user Join a session
  socket.on("join_session", (data) => {
    socket.join(data.id);
    console.log(`${data.name} joined session: ${data.id}`);

    socket.to(data.id).emit("joined_session", data);
  });

  // Listen for canvas updates
  socket.on("canvas_update", (data) => {
    if (!data.flag) return;
    socket.to(data.whiteboardId).emit("canvas_updated", data);
  });

  //Listen for user messages
  socket.on("message_send", (data) => {
    console.log("datasent by", data.sender, "in room", data.whiteboardId);

    socket.broadcast.emit("message_recive", data);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Middleware to validate JWT Token
const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: Function
): void => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const client = jwksRsa({
    jwksUri: `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/certs`,
  });

  const getKey = (header: any, callback: any) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (!key) {
        callback(new Error("Signing key not found"), null);
        return;
      }
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  };

  jwt.verify(token, getKey, {}, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Token is not valid" });
      return;
    }
    req.user = user;
    next();
  });
};

// API to create a new user
app.post(
  "/users",

  async (req: CustomRequest, res: Response): Promise<void> => {
    const { name, email, userId } = req.body;

    if (!email || !name || !userId) {
      res.status(400).json({ message: "User info required" });
      return;
    }

    const userExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      res.status(200).json({ message: "User already exists" });
      return;
    }

    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          id: userId,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error creating user", error });
    }
  }
);

// API to create a new whiteboard session
app.post(
  "/whiteboards",
  authenticateToken,
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { title, email, whiteBoardId } = req.body;
    if (!title || !email || !whiteBoardId) {
      res.status(400).json({ message: "Whiteboard info required" });
      return;
    }

    try {
      const whiteboard = await prisma.whiteboard.create({
        data: {
          id: whiteBoardId,
          title,
          userEmail: email,
        },
      });

      res.status(201).json(whiteboard);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating whiteboard session", error });
    }
  }
);

//API to delete a whiteboard session
app.delete(
  "/whiteboards/:id",
  authenticateToken,
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ message: "Whiteboard ID required" });
      return;
    }

    try {
      await prisma.whiteboard.delete({
        where: {
          id: id,
        },
      });

      res.status(200).json({ message: "Whiteboard deleted" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error deleting whiteboard session", error });
    }
  }
);

//API to join a whiteboard session
app.put(
  "/whiteboards/:id",
  authenticateToken,
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email } = req.body;

    if (!id) {
      res.status(400).json({ message: "Whiteboard ID required" });
      return;
    }

    try {
      const whiteboard = await prisma.whiteboard.update({
        where: {
          id: id,
        },
        data: {
          members: {
            connect: { email },
          },
        },
      });

      res.status(200).json({ message: "User added to whiteboard", whiteboard });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding user to whiteboard", error });
    }
  }
);

// API to check for the host of a whiteboard session
app.post(
  "/whiteboards/ishost",
  authenticateToken,
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { whiteboardId, email } = req.body;

    // Validate required fields
    if (!whiteboardId || !email) {
      res.status(400).json({ message: "Whiteboard ID and email are required" });
      return;
    }

    try {
      // Check if the whiteboard exists and fetch its host's ID
      const whiteboard = await prisma.whiteboard.findUnique({
        where: {
          id: whiteboardId,
        },
      });

      // If whiteboard not found
      if (!whiteboard) {
        res.status(404).json({ message: "Whiteboard not found" });
        return;
      }

      // Compare userId and respond with the result
      const isHost = whiteboard.userEmail === email;
      res.status(200).json({ isHost, whiteboard });
      return;
    } catch (error: any) {
      console.error("Error checking whiteboard host:", error);
      res.status(500).json({
        message: "Error checking whiteboard host",
        error: error.message || error,
      });
      return;
    }
  }
);

// API to leave a session
app.put(
  "/whiteboards/leave/:id",
  authenticateToken,
  async (req: CustomRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { email } = req.body;

    if (!id) {
      res.status(400).json({ message: "Whiteboard ID required" });
      return;
    }

    try {
      const whiteboard = await prisma.whiteboard.update({
        where: {
          id: id,
        },
        data: {
          members: {
            disconnect: { email },
          },
        },
      });

      res
        .status(200)
        .json({ message: "User removed from whiteboard", whiteboard });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error removing user from whiteboard", error });
    }
  }
);

// Start the server
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
