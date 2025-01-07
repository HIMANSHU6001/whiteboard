import { useContext, useState } from "react";
import SessionContext from "../context/sessionContext";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CanvasContext from "../context/canvasContext";

interface NavbarProps {
  isHost: boolean;
  socket: any;
}

const Navbar = ({ isHost }: NavbarProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) {
    console.log("Session context is not provided", sessionContext);

    console.error("Session context is not provided");
    return <div>Error: Session context is not provided.</div>;
  }

  const {
    createWhiteboardSession,
    generateUniqueId,
    deleteWhiteboardSession,
    joinWhiteboardSession,
    leaveWhiteboardSession,
    sessionTitle,
    userInfo,
  } = sessionContext;

  const canvasContext = useContext(CanvasContext);
  if (!canvasContext) {
    console.log("Canvas context is not provided", canvasContext);

    console.error("Canvas context is not provided");
    return <div>Error: Canvas context is not provided.</div>;
  }

  const { saveCanvasAsImage } = canvasContext;

  const [isOpen, setIsOpen] = useState(false);

  const handleCreateSession = async () => {
    const title = window.prompt("Enter the title for the new session:");
    if (!title) {
      toast.error("Title is required");
      return;
    }
    const whiteboardId = generateUniqueId();
    const isCreated = await createWhiteboardSession(title, whiteboardId);
    if (isCreated) navigate(`/${whiteboardId}`);
  };

  const handleDeleteSession = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the session?"
    );
    if (!confirmDelete || !id) return;
    console.log("Deleting session with id:", id);
    deleteWhiteboardSession(id);
    navigate("/");
  };

  const handleJoinSession = () => {
    const whiteboardId = window.prompt("Enter the session ID:");
    if (!whiteboardId) {
      toast.error("Session ID is required");
      return;
    }
    joinWhiteboardSession(whiteboardId);
    navigate(`/${whiteboardId}`);
  };

  const handleLeaveSession = () => {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave the session?"
    );
    if (!confirmLeave || !id) return;
    console.log("Leaving session with id:", id);
    leaveWhiteboardSession(id);
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container mx-auto flex items-center py-2.5 justify-between md:justify-normal">
        <div className="text-xl md:text-2xl font-semibold">
          <h1>{sessionTitle ? sessionTitle : "WhiteBoard"}</h1>
        </div>

        <div className="hidden md:flex space-x-6 ml-10">
          <button
            type="button"
            onClick={() => {
              if (!isHost) {
                handleCreateSession();
              } else {
                handleDeleteSession();
              }
            }}
            className="btn btn-light"
          >
            {`${isHost ? "Delete" : "Create"}`} Session
          </button>
          <button
            type="button"
            onClick={() => {
              if (id) {
                handleLeaveSession();
              } else {
                handleJoinSession();
              }
            }}
            className="btn btn-light"
          >
            {`${id ? "Leave" : "Join"}`} Session
          </button>
          {id && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(id);
                toast.success("session ID copied to clip board");
              }}
            >
              <img src="/icons/link.svg" />
            </button>
          )}

          <button>
            <img src="/icons/save.svg" onClick={() => saveCanvasAsImage()} />
          </button>
        </div>

        <div className="ml-auto hidden md:flex text-lg">
          {userInfo?.name}
          <img src="/icons/user.svg" alt="User Icon" className="h-6 w-6 ml-2" />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            className="focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700 text-white flex flex-col space-y-2 px-4 py-2">
          <button
            onClick={() => {
              handleCreateSession();
            }}
            className="hover:text-gray-300"
          >
            Create Session
          </button>
          <button
            onClick={() => console.log("Join session")}
            className="hover:text-gray-300"
          >
            Join Session
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
