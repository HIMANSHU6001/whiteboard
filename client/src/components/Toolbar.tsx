import { useContext, useEffect, useState } from "react";
import CanvasContext from "../context/canvasContext";
import { fabric } from "fabric";

const Toolbar = () => {
  const canvasContext = useContext(CanvasContext);
  if (!canvasContext) {
    console.error("Canvas context is not provided");
    return <div>Error: Canvas context is not provided.</div>;
  }

  const {
    editor,
    undo,
    redo,
    clear,
    removeSelectedObject,
    addText,
    color,
    setColor,
    zoomIn,
    zoomOut,
  } = canvasContext;

  const [active, setActive] = useState("cursor");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentShape, setCurrentShape] = useState<fabric.Object | null>(null);
  const [shapeType, setShapeType] = useState<
    "rectangle" | "circle" | "line" | null
  >(null);

  useEffect(() => {
    if (editor) {
      editor.canvas.isDrawingMode = isDrawingMode;
    }
  }, [isDrawingMode]);

  useEffect(() => {
    if (!editor) return;

    const canvas = editor.canvas;

    const handleMouseDown = (opt: fabric.IEvent) => {
      const pointer = canvas.getPointer(opt.e);

      if (
        !isDrawing &&
        shapeType &&
        (active === "circle" || active === "rectangle" || active === "line")
      ) {
        // Start drawing on first click
        let shape: fabric.Object | null = null;

        if (shapeType === "rectangle") {
          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: color,
            strokeWidth: 2,
            selectable: false,
          });
        } else if (shapeType === "circle") {
          shape = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            stroke: color,
            fill: "transparent",
            strokeWidth: 2,
            selectable: false,
            originX: "center",
            originY: "center",
          });
        } else if (shapeType === "line") {
          shape = new fabric.Line(
            [pointer.x, pointer.y, pointer.x, pointer.y],
            {
              stroke: color,
              strokeWidth: 2,
              selectable: false,
            }
          );
        }

        if (shape) {
          canvas.add(shape);
          setCurrentShape(shape);
          setIsDrawing(true);
        }
      } else if (isDrawing) {
        // Stop drawing on second click
        setIsDrawing(false);
        if (currentShape) {
          currentShape.set({ selectable: true });
          setCurrentShape(null);
        }
      }
    };

    const handleMouseMove = (opt: fabric.IEvent) => {
      if (!isDrawing || !currentShape) return;

      const pointer = canvas.getPointer(opt.e);
      const startX = currentShape.left ?? 0;
      const startY = currentShape.top ?? 0;

      if (shapeType === "rectangle") {
        const width = pointer.x - startX;
        const height = pointer.y - startY;
        currentShape.set({ width: Math.abs(width), height: Math.abs(height) });
        if (width < 0) currentShape.set({ left: pointer.x });
        if (height < 0) currentShape.set({ top: pointer.y });
      } else if (shapeType === "circle") {
        const radius = Math.sqrt(
          Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
        );
        (currentShape as fabric.Circle).set({ radius });
      } else if (shapeType === "line") {
        (currentShape as fabric.Line).set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      canvas.renderAll();
    };

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);

    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
    };
  }, [editor, isDrawing, currentShape, shapeType, color, active]);

  return (
    <>
      <div className="shadow-md md:mt-3 px-4 w-full md:w-fit md:rounded-full absolute flex justify-between z-10 left-1/2 -translate-x-1/2 py-2 space-x-1 ">
        <div
          className={`p-2 rounded-full ${
            active === "rectangle" ? "" : "hover:bg-gray-100"
          } ${active === "rectangle" ? "bg-blue-600" : ""}`}
          onClick={() => {
            setShapeType("rectangle");
            setActive("rectangle");
            setIsDrawingMode(false);
          }}
        >
          <img
            src={`/icons/square${active === "rectangle" ? "_white" : ""}.svg`}
            alt="rectangle"
          />
        </div>
        <div
          className={`p-2 rounded-full ${
            active === "circle" ? "" : "hover:bg-gray-100"
          } ${active === "circle" ? "bg-blue-600" : ""}`}
          onClick={() => {
            setShapeType("circle");
            setActive("circle");
            setIsDrawingMode(false);
          }}
        >
          <img
            src={`/icons/circle${active === "circle" ? "_white" : ""}.svg`}
            alt="circle"
          />
        </div>
        <div
          className={`p-2 rounded-full ${
            active === "line" ? "" : "hover:bg-gray-100"
          } ${active === "line" ? "bg-blue-600" : ""}`}
          onClick={() => {
            setShapeType("line");
            setActive("line");
            setIsDrawingMode(false);
          }}
        >
          <img
            src={`/icons/line${active === "line" ? "_white" : ""}.svg`}
            alt="line"
          />
        </div>
        <div
          className={`p-2 rounded-full ${
            active === "text" ? "" : "hover:bg-gray-100"
          } ${active === "text" ? "bg-blue-600" : ""}`}
          onClick={() => {
            addText();
            setActive("text");
            setIsDrawingMode(false);
          }}
        >
          <img
            src={`/icons/text${active === "text" ? "_white" : ""}.svg`}
            alt="text"
          />
        </div>
        <div
          className={`p-2 rounded-full ${
            active === "cursor" ? "" : "hover:bg-gray-100"
          } ${active === "cursor" ? "bg-blue-600" : ""}`}
          onClick={() => {
            setShapeType(null);
            setIsDrawingMode(!isDrawingMode);
            setActive("cursor");
          }}
        >
          <img
            src={`/icons/${isDrawingMode ? "pencil" : "cursor"}${
              active === "cursor" ? "_white" : ""
            }.svg`}
            alt="mode"
          />
        </div>
        <span className="border mx-3"></span>
        <div
          className="p-2 rounded-full hover:bg-gray-100"
          onClick={removeSelectedObject}
        >
          <img src="/icons/remove.svg" alt="remove" />
        </div>
        <div className="p-2 rounded-full hover:bg-gray-100" onClick={clear}>
          <img src="/icons/clear.svg" alt="clear" />
        </div>
        <input
          className="w-6 h-6 my-auto mx-2"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      <div className="fixed bottom-2 left-2 md:bottom-5 md:left-5 space-x-3 z-20">
        <button className="btn btn-light" onClick={undo}>
          <img src="/icons/undo.svg" alt="undo" />
        </button>
        <button className="btn btn-light" onClick={redo}>
          <img src="/icons/redo.svg" alt="redo" />
        </button>
      </div>
      <div className="fixed bottom-2 right-2 md:bottom-5 md:right-5 space-x-3 z-20">
        <button className="btn btn-light" onClick={zoomIn}>
          <img src="/icons/zoom_in.svg" alt="zoomIn" />
        </button>
        <button className="btn btn-light" onClick={zoomOut}>
          <img src="/icons/zoom_out.svg" alt="ZoomOut" />
        </button>
      </div>
    </>
  );
};

export default Toolbar;
