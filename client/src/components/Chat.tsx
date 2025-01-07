import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface ChatProps {
  userInfo: {
    name: string;
  };
  socket: any;
}

const Chat: React.FC<ChatProps> = ({ socket, userInfo }) => {
  const { id } = useParams<{ id: string }>();
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string }[]
  >([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    console.log("Messages = ", messages);
  }, [messages]);

  useEffect(() => {
    console.log("Socket = ", socket);
    socket.off("message_recive");
    socket.on("message_recive", (data: any) => {
      console.log("Message recived = ", data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: data.sender, message: data.message },
      ]);
    });
  }, [socket]);

  const handleSendMessage = () => {
    if (currentMessage.trim() === "") return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: userInfo.name, message: currentMessage },
    ]);

    socket.emit("message_send", {
      sender: userInfo.name,
      message: currentMessage,
      whiteboardId: id,
    });
    setCurrentMessage("");
  };

  return (
    <>
      <button
        hidden={showChat}
        onClick={() => setShowChat(true)}
        className="btn btn-light fixed md:top-20 bottom-2 md:bottom-auto right-1/2 translate-x-1/2 md:right-10 z-30"
      >
        <img src="/icons/chat.svg" alt="chat" />
      </button>

      {showChat && (
        <div className="fixed z-30 bottom-0 md:top-1/2 md:-translate-y-1/2 md:right-5 bg-white p-4 rounded shadow-lg w-full md:w-fit h-[80%] flex flex-col">
          <div className="chat-messages flex-grow overflow-y-auto mb-4 relative">
            <button
              className="top-0 right-0"
              onClick={() => setShowChat(false)}
            >
              <img src="/icons/close.svg" alt="close" />
            </button>
            {messages.map((item, index) => (
              <div
                key={index}
                className={`chat-message p-2 rounded mb-2 ${
                  item.sender === userInfo.name ? "bg-blue-100" : "bg-gray-200"
                }`}
              >
                <strong>{item.sender}: </strong>
                <br />
                {item.message}
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              className="border-l-2 border-t-2 border-b-2 w-80 px-2 rounded-l-lg"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white p-1 rounded-r-lg border-r-2 border-t-2 border-b-2"
            >
              <img src="/icons/send.svg" alt="send" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
