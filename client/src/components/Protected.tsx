import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import CanvasState from "../context/CanvasState";
import SessionState from "../context/SessionState";
import Navbar from "./Navbar";
import WhiteBoard from "./Whiteboard";
import { Toaster } from "react-hot-toast";
import Chat from "./Chat";

const connectionOptions = {
  "force new connection": true,
  reconnectionAttempts: Infinity,
  timeout: 10000,
  transports: ["websocket"],
};

const socket = io("http://localhost:5000", connectionOptions);

interface ProtectedProps {
  userInfo: any;
  token: string;
}

const Protected: React.FC<ProtectedProps> = ({ userInfo, token }) => {
  const [isHost, setIsHost] = useState(false);

  return (
    <CanvasState>
      <SessionState userInfo={userInfo} token={token} socket={socket}>
        <Router>
          <Routes>
            <Route
              path="/:id?"
              element={
                <>
                  <Navbar isHost={isHost} socket={socket} />
                  <WhiteBoard
                    isHost={isHost}
                    setIsHost={setIsHost}
                    socket={socket}
                  />
                  <Chat socket={socket} userInfo={userInfo} />
                  <Toaster position="top-right" />
                </>
              }
            />
          </Routes>
        </Router>
      </SessionState>
    </CanvasState>
  );
};

export default Protected;
