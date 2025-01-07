import { FabricJSEditor } from "fabricjs-react";
import { createContext } from "react";

interface CanvasContextType {
  editor: FabricJSEditor | null;
  setEditor: (editor: any) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  removeSelectedObject: () => void;
  addText: () => void;
  color: string;
  setColor: (color: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  saveCanvasAsImage: () => void;
}

const canvasContext = createContext<CanvasContextType | undefined>(undefined);

export default canvasContext;
