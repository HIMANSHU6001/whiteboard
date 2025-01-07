import React, { useContext, useEffect, useState, useRef } from "react";
import CanvasContext from "../context/canvasContext";

const Settings: React.FC = () => {
  const canvasContext = useContext(CanvasContext);
  if (!canvasContext) {
    console.error("Canvas context is not provided");
    return <div>Error: Canvas context is not provided.</div>;
  }

  const { editor } = canvasContext;
  const selectedObject = useRef<fabric.Object | null>(null);
  const [radius, setRadius] = useState<number | null>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  const [strokeWidth, setStrokeWidth] = useState<number | null>(null);
  const [strokeColor, setStrokeColor] = useState<string>("#000000");
  const [fillColor, setFillColor] = useState<string>("#FFFFFF");
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [fontWeight, setFontWeight] = useState<string>("normal");
  const [fontStyle, setFontStyle] = useState<string>("normal");
  const [textDecoration, setTextDecoration] = useState<string>("");
  const [textAlign, setTextAlign] = useState<string>("left");
  const [globalStrokeWidth, setGlobalStrokeWidth] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!editor) return;

    const handleSelectionCreated = (e: fabric.IEvent) => {
      if (e.selected && e.selected.length > 0) {
        selectedObject.current = e.selected[0];
        updateProperties();
      }
    };

    const handleSelectionUpdated = (e: fabric.IEvent) => {
      if (e.selected && e.selected.length > 0) {
        selectedObject.current = e.selected[0];
        updateProperties();
      }
    };

    const handleSelectionCleared = () => {
      selectedObject.current = null;
      resetProperties();
    };

    editor.canvas.on("selection:created", handleSelectionCreated);
    editor.canvas.on("selection:updated", handleSelectionUpdated);
    editor.canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      editor.canvas.off("selection:created", handleSelectionCreated);
      editor.canvas.off("selection:updated", handleSelectionUpdated);
      editor.canvas.off("selection:cleared", handleSelectionCleared);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    if (globalStrokeWidth !== null) {
      editor.canvas.freeDrawingBrush.width = globalStrokeWidth;
    }
  }, [editor, globalStrokeWidth]);

  const updateProperties = () => {
    if (!selectedObject.current) return;
    setRadius((selectedObject.current as fabric.Circle).get("radius") || null);
    setHeight(selectedObject.current.get("height") || null);
    setWidth(selectedObject.current.get("width") || null);
    setStrokeWidth(selectedObject.current.get("strokeWidth") || null);
    setStrokeColor(selectedObject.current.get("stroke") || "#000000");
    const fill = selectedObject.current.get("fill");
    setFillColor(typeof fill === "string" ? fill : "#FFFFFF");
    if (selectedObject.current.type === "textbox") {
      const textObject = selectedObject.current as fabric.Textbox;
      setFontSize(textObject.fontSize || null);
      setFontWeight(textObject.fontWeight as string);
      setFontStyle(textObject.fontStyle || "normal");
      setTextDecoration(textObject.underline ? "underline" : "");
      setTextAlign(textObject.textAlign || "left");
    }
  };

  const resetProperties = () => {
    setRadius(null);
    setHeight(null);
    setWidth(null);
    setStrokeWidth(null);
    setStrokeColor("#000000");
    setFillColor("#FFFFFF");
    setFontSize(null);
    setFontWeight("normal");
    setFontStyle("normal");
    setTextDecoration("");
    setTextAlign("left");
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedObject.current) return;
    selectedObject.current.set(property as keyof fabric.Object, value);
    if (editor) {
      editor.canvas.renderAll();
    }
  };

  return (
    <div className="fixed top-1/2 -translate-y-1/2 right-5 bg-white p-6 rounded-lg shadow-2xl w-72 space-y-4">
      {selectedObject.current ? (
        <>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Object Settings
          </h3>
          {selectedObject.current.type === "circle" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">
                Radius:
              </label>
              <input
                className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                type="number"
                value={radius !== null ? radius.toFixed(2) : ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setRadius(value);
                  handlePropertyChange("radius", value);
                }}
              />
            </div>
          )}
          {selectedObject.current.type === "rect" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Height:
                </label>
                <input
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  type="number"
                  value={height !== null ? height.toFixed(2) : ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setHeight(value);
                    handlePropertyChange("height", value);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Width:
                </label>
                <input
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  type="number"
                  value={width !== null ? width.toFixed(2) : ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setWidth(value);
                    handlePropertyChange("width", value);
                  }}
                />
              </div>
            </div>
          )}
          {selectedObject.current.type === "textbox" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Font Size:
                </label>
                <input
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  type="number"
                  value={fontSize !== null ? fontSize.toFixed(2) : ""}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setFontSize(value);
                    handlePropertyChange("fontSize", value);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Font Weight:
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  value={fontWeight}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFontWeight(value);
                    handlePropertyChange("fontWeight", value);
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Font Style:
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  value={fontStyle}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFontStyle(value);
                    handlePropertyChange("fontStyle", value);
                  }}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Text Decoration:
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  value={textDecoration}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTextDecoration(value);
                    handlePropertyChange("underline", value === "underline");
                  }}
                >
                  <option value="">None</option>
                  <option value="underline">Underline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Text Align:
                </label>
                <select
                  className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                  value={textAlign}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTextAlign(value);
                    handlePropertyChange("textAlign", value);
                  }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
            </div>
          )}
          {selectedObject.current.type !== "textbox" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600">
                Stroke Width:
              </label>
              <input
                className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={strokeWidth !== null ? strokeWidth : 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setStrokeWidth(value);
                  handlePropertyChange("strokeWidth", value);
                }}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">
              Stroke Color:
            </label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
              type="color"
              value={strokeColor}
              onChange={(e) => {
                const value = e.target.value;
                setStrokeColor(value);
                handlePropertyChange("stroke", value);
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">
              Fill Color:
            </label>
            <input
              className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
              type="color"
              value={fillColor}
              onChange={(e) => {
                const value = e.target.value;
                setFillColor(value);
                handlePropertyChange("fill", value);
              }}
            />
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Stroke Width:
          </label>
          <input
            className="w-full mt-1 px-3 py-2 border rounded-lg shadow-sm focus:ring focus:ring-blue-200"
            type="range"
            min="1"
            max="12"
            step="0.1"
            value={globalStrokeWidth !== null ? globalStrokeWidth : 0}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setGlobalStrokeWidth(value);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Settings;
