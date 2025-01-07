"use client";
import React, { ReactNode, useEffect, useState } from "react";
import CanvasContext from "./canvasContext";
import { FabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";

interface CanvasStateProps {
  children: ReactNode;
}

const CanvasState: React.FC<CanvasStateProps> = ({ children }) => {
  const [editor, setEditor] = useState<FabricJSEditor | null>(null);
  const history: any[] = [];
  const [color, setColor] = useState("#35363a");

  useEffect(() => {
    if (editor && editor.canvas.freeDrawingBrush) {
      editor.canvas.freeDrawingBrush.color = color;
    }
  }, [color, editor]);

  const zoomIn = () => {
    if (!editor) return;
    const canvas = editor.canvas;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom * 1.1);
  };

  const zoomOut = () => {
    if (!editor) return;
    const canvas = editor.canvas;
    const zoom = canvas.getZoom();
    canvas.setZoom(zoom / 1.1);
  };

  const undo = () => {
    if (!editor) return;
    if (editor.canvas._objects.length > 0) {
      history.push(editor.canvas._objects.pop());
    }
    editor.canvas.renderAll();
  };
  const redo = () => {
    if (!editor) return;
    if (history.length > 0) {
      editor.canvas.add(history.pop());
    }
  };
  const clear = () => {
    if (!editor) return;
    editor.canvas._objects.splice(0, editor.canvas._objects.length);
    history.splice(0, history.length);
    editor.canvas.renderAll();
  };

  const removeSelectedObject = () => {
    if (!editor) return;
    const activeObject = editor.canvas.getActiveObject();
    if (!activeObject) return;
    editor.canvas.remove(activeObject);
  };

  const addText = () => {
    if (!editor) return;
    const text = new fabric.Textbox("insert text", {
      left: 100,
      top: 100,
      width: 200,
      fontSize: 20,
      fill: color,
      strokeWidth: 0,
    });

    editor.canvas.add(text);
    editor.canvas.setActiveObject(text);
    editor.canvas.renderAll();
  };

  const saveCanvasAsImage = () => {
    if (!editor) return;
    const dataURL = editor.canvas.toDataURL({
      format: "png",
      quality: 1.0,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";
    link.click();
  };

  return (
    <CanvasContext.Provider
      value={{
        editor,
        setEditor,
        undo,
        redo,
        clear,
        removeSelectedObject,
        addText,
        saveCanvasAsImage,
        color,
        setColor,
        zoomIn,
        zoomOut,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

export default CanvasState;
