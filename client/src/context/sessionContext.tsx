import { createContext } from "react";

interface SessionContextType {
  createWhiteboardSession: (
    title: string,
    whiteBoardId: string
  ) => Promise<boolean>;
  joinWhiteboardSession: (id: string) => void;
  deleteWhiteboardSession: (id: string) => void;
  getRole: (id: string) => Promise<any>;
  generateUniqueId: () => string;
  leaveWhiteboardSession: (id: string) => void;
  sessionTitle: string;
  userInfo: any;
}

const sessionContext = createContext<SessionContextType | undefined>(undefined);

export default sessionContext;
