"use client";
import React, { ReactNode, useEffect, useState } from "react";
import SessionContext from "./sessionContext";
import toast from "react-hot-toast";

interface SessionStateProps {
  children: ReactNode;
  userInfo: any;
  token: string;
  socket: any;
}
const SessionState: React.FC<SessionStateProps> = ({
  children,
  userInfo,
  token,
  socket,
}) => {
  const [sessionTitle, setSessionTitle] = useState("");

  useEffect(() => {
    if (!socket) return;
    socket.on("joined_session", (data: any) => {
      toast.success(`${data.name} Joined session`);
    });
  }, [socket]);

  const createWhiteboardSession = async (
    title: string,
    whiteBoardId: string
  ): Promise<boolean> => {
    if (!token) {
      toast.error("token is not provided");
      return false;
    }

    console.log("Creating whiteboard session with title:", title);
    try {
      const response = await fetch("http://localhost:5000/whiteboards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, email: userInfo.email, whiteBoardId }),
      });

      const data = await response.json();
      setSessionTitle(data.title);
      toast.success(`${data.title} Created`);
      return true;
    } catch (error) {
      console.error("Error creating whiteboard session:", error);
      toast.error("Couldn't create session");
      return false;
    }
  };

  const joinWhiteboardSession = async (id: string) => {
    if (!token) {
      toast.error("Token is not provided");
      console.error("token is not provided");
      return;
    }

    const response = await fetch(`http://localhost:5000/whiteboards/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: userInfo.email }),
    });

    const data = await response.json();

    setSessionTitle(data.whiteboard.title);
    socket.emit("join_session", {
      id: data.whiteboard.id,
      name: userInfo.given_name,
    });
  };

  const deleteWhiteboardSession = async (id: string) => {
    if (!token) {
      toast.error("Token is not provided");
      console.error("token is not provided");
      return;
    }

    fetch(`http://localhost:5000/whiteboards/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    setSessionTitle("");
    toast.success("Session Deleted");
  };

  const getRole = async (id: string): Promise<any> => {
    let storageToken;
    let storageUserInfo;
    if (!token) {
      storageToken = localStorage.getItem("token");
      storageUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (!storageToken) {
        toast.error("Token is not provided");
        console.error("Token is not present in store");
        return;
      }
    }
    const authToken = token || storageToken;
    const email = userInfo?.email || storageUserInfo.email;
    // console.log("Getting role for whiteboard with id:", authToken, email, id);

    const response = await fetch(`http://localhost:5000/whiteboards/ishost`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email, whiteboardId: id }),
    });

    const data = await response.json();

    setSessionTitle(data.whiteboard.title);
    return data.isHost;
  };

  const generateUniqueId = (length: number = 5): string => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    const timestamp = Date.now().toString(36); // Convert timestamp to base-36 string
    return `${result}-${timestamp}`;
  };

  const leaveWhiteboardSession = async (id: string) => {
    if (!token) {
      toast.error("Token is not provided");
      console.error("token is not provided");
      return;
    }

    fetch(`http://localhost:5000/whiteboards/leave/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email: userInfo.email }),
    });
    setSessionTitle("");
    toast.success("Session left");
  };

  return (
    <SessionContext.Provider
      value={{
        createWhiteboardSession,
        joinWhiteboardSession,
        deleteWhiteboardSession,
        getRole,
        generateUniqueId,
        leaveWhiteboardSession,
        sessionTitle,
        userInfo,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default SessionState;
