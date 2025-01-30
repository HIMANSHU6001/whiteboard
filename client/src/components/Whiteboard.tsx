import { useContext, useEffect, useRef } from "react";
import Toolbar from "./Toolbar";
import CanvasContext from "../context/canvasContext";
import Settings from "./Settings";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { fabric } from "fabric";
import { useParams } from "react-router-dom";
import SessionContext from "../context/sessionContext";
import toast from "react-hot-toast";

interface WhiteboardProps {
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  socket: any;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ setIsHost, socket }) => {
  const sessionContext = useContext(SessionContext);
  if (!sessionContext) {
    console.log("session Context is not provided", sessionContext);

    console.error("session Context is not provided");
    return <div>Error: session Context is not provided.</div>;
  }

  const { getRole } = sessionContext;

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const getHost = async () => {
      var isHostbool = false;

      if (id) {
        isHostbool = await getRole(id);
      }

      if (isHostbool) {
        setIsHost(true);
        toast.success("You are the host");
      } else {
        setIsHost(false);
      }
    };
    getHost();
  }, [id]);

  const { editor, onReady } = useFabricJSEditor();

  const flag = useRef(true);

  useEffect(() => {
    if (!id) return;
    socket.on("canvas_updated", (data: any) => {
      flag.current = false;
      if (!editor) return;
      editor.canvas.loadFromJSON(data.canvas, () => {
        editor.canvas.renderAll();
      });
      setTimeout(() => {
        flag.current = true;
      }, 500);
    });
  }, [editor, id, socket]);

  const canvasContext = useContext(CanvasContext);
  if (!canvasContext) {
    console.log("Canvas context is not provided", canvasContext);

    console.error("Canvas context is not provided");
    return <div>Error: Canvas context is not provided.</div>;
  }

  const { setEditor } = canvasContext;

  useEffect(() => {
    if (!editor) {
      return;
    }
    setEditor(editor);
    if (!editor.canvas.freeDrawingBrush) {
      editor.canvas.freeDrawingBrush = new fabric.PencilBrush(editor.canvas);
    }
    // @ts-ignore
    if (!editor.canvas.__eventListeners["mouse:wheel"]) {
      editor.canvas.on("mouse:wheel", function (opt: any) {
        var delta = opt.e.deltaY;
        var zoom = editor.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        editor.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
      });
    }
    // @ts-ignore
    if (!editor.canvas.__eventListeners["mouse:down"]) {
      editor.canvas.on("mouse:down", function (this: any, opt: any) {
        var evt = opt.e;
        if (evt.ctrlKey === true) {
          this.isDragging = true;
          this.selection = false;
          this.lastPosX = evt.clientX;
          this.lastPosY = evt.clientY;
        }
      });
    }
    // @ts-ignore
    if (!editor.canvas.__eventListeners["mouse:move"]) {
      editor.canvas.on("mouse:move", function (this: any, opt: any) {
        if (this.isDragging) {
          var e = opt.e;
          var vpt = this.viewportTransform;
          vpt[4] += e.clientX - this.lastPosX;
          vpt[5] += e.clientY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.clientX;
          this.lastPosY = e.clientY;
        }
      });
    }
    // @ts-ignore
    if (!editor.canvas.__eventListeners["mouse:up"]) {
      editor.canvas.on("mouse:up", function (this: any) {
        this.setViewportTransform(this.viewportTransform);
        this.isDragging = false;
        this.selection = true;
      });
    }

    const emitCanvasUpdate = () => {
      const canvasData = editor.canvas.toJSON();

      socket.emit("canvas_update", {
        whiteboardId: id,
        canvas: canvasData,
        flag: flag.current,
      });
    };

    editor.canvas.on("object:added", emitCanvasUpdate);
    editor.canvas.on("object:removed", emitCanvasUpdate);
    editor.canvas.on("object:modified", emitCanvasUpdate);
    editor.canvas.on("object:moving", emitCanvasUpdate);
    editor.canvas.on("object:scaling", emitCanvasUpdate);
    editor.canvas.on("object:rotating", emitCanvasUpdate);

    editor.canvas.renderAll();

    return () => {
      editor.canvas.off("object:added", emitCanvasUpdate);
      editor.canvas.off("object:removed", emitCanvasUpdate);
      editor.canvas.off("object:modified", emitCanvasUpdate);
      editor.canvas.off("object:moving", emitCanvasUpdate);
      editor.canvas.off("object:scaling", emitCanvasUpdate);
      editor.canvas.off("object:rotating", emitCanvasUpdate);
    };
  }, [editor, id]);

  useEffect(() => {
    if (!socket) return;
    socket.off("joined_session");
    socket.on("joined_session", (data: any) => {
      console.info("User joined session", data);
      toast.success(`${data.name} Joined session`);
    });
  }, [socket]);

  return (
    <>
      <Toolbar />
      <FabricJSCanvas className="h-screen w-full" onReady={onReady} />
      <Settings />
    </>
  );
};

export default Whiteboard;
