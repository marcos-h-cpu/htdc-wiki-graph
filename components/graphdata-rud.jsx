import { useState } from "react";
import styles from "./graphdata-rud.module.css";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";


export default function GraphDataRud({ graphData, setGraphDataMenuOpen, setGraphData }) {
    // Create a local copy of graphData for modifications
    const [tempData, setTempData] = useState(graphData);

    const handleSaveChanges = () => {
        // Save the modified tempData back to the parent component
        setGraphData(tempData);
        setGraphDataMenuOpen(false);
    };

    const handleDiscardChanges = () => {
        setTempData(graphData);
        setGraphDataMenuOpen(false);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-gray-100 bg-opacity-50 backdrop-blur-md z-40"
                onClick={() => setGraphDataMenuOpen(false)}
            ></div>
            <div className={`!bg-gray-100 !rounded-md border !bg-opacity-10 w-[93vw] h-[90vh] overflow-y-auto !p-0 z-50 ${styles.scroll}`}>
                <div className="sticky top-0 bg-gray-100 bg-opacity-50 backdrop-blur-xl z-10 px-2 py-1 border-b flex flex-col gap-0">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-row justify-start items-center gap-1">
                            <h2 className="text-gray-700 text-xs font-bold p-0">Graph Data</h2>
                            <span
                                onClick={handleDiscardChanges}
                                className="text-xs hover:text-red-600 cursor-pointer"
                            >
                                Discard Changes
                            </span>
                            <span
                                onClick={handleSaveChanges}
                                className="text-xs hover:text-green-600 cursor-pointer"
                            >
                                Save Changes
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setGraphDataMenuOpen(false)}   
                            className="h-[16px] !w-[16px] flex items-center justify-center !p-0"
                            aria-label="Close"
                            >
                            <XMarkIcon className="h-4 w-4 text-black-700" />
                        </Button>
                    </div>

                </div>
                <div className="flex flex-col gap-2 h-full">
                    {tempData.nodes && tempData.nodes.length > 0 ? (
                        tempData.nodes.map((node, index) => (
                            <CollapsibleNode
                                key={index}
                                node={node}
                                graphData={tempData}
                                setTempData={setTempData}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center items-center h-full text-gray-500">
                            <p className="text-xs">No graph data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

function CollapsibleNode({ node, graphData, setTempData }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isEditingImage, setIsEditingImage] = useState(false);

  const connectedEdges = graphData.links.filter(
    (link) => link.source === node.id || link.target === node.id
  );

  const handleNodeChange = (key, value) => {
    setTempData((prevData) => {
      const updatedNodes = prevData.nodes.map((n) =>
        n.id === node.id ? { ...n, [key]: value } : n
      );
      return { ...prevData, nodes: updatedNodes };
    });
  };

  return (
    <div className="border-t pt-2 px-4">
      <div
        className="cursor-pointer text-xs font-semibold text-gray-800"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex justify-between items-center">
          <pre className="whitespace-pre-wrap">
            <strong>ID:</strong> {node.id || "No ID available"}
          </pre>
          <span className="text-black-500">{isCollapsed ? "+" : "-"}</span>
        </div>
      </div>
      {!isCollapsed && (
        <div className="mt-2 pl-4 text-xs text-gray-700">
          <pre className="whitespace-pre-wrap">
            <strong>Summary:</strong>{" "}
            <span className="text-gray-700">{node.summary || "No summary available"}</span>
          </pre>
          <pre className="whitespace-pre-wrap">
            <strong>Image:</strong>{" "}
            {isEditingImage ? (
              <input
                type="text"
                value={node.image || ""}
                onChange={(e) => handleNodeChange("image", e.target.value)}
                onBlur={() => setIsEditingImage(false)} // Exit edit mode on blur
                className="border rounded px-1 py-0.5 text-xs w-1/2"
              />
            ) : (
              <span
                className="cursor-pointer text-red-400 hover:text-red-800"
                onClick={() => setIsEditingImage(true)} // Enter edit mode on click
              >
                {node.image || "No image available"}
              </span>
            )}
          </pre>
          <pre className="whitespace-pre-wrap">
            <strong>Links:</strong>{" "}
            {node.links && node.links.length > 0
              ? node.links.map((link, i) => (
                  <span key={i} className="text-blue-300 hover:text-blue-800 cursor-pointer">
                    {link.title} ({link.url})
                    {i < node.links.length - 1 ? ", " : ""}
                  </span>
                ))
              : "No links available"}
          </pre>
          <pre className="whitespace-pre-wrap">
            <strong>Edges:</strong>{" "}
            {connectedEdges.length > 0
              ? connectedEdges.map((edge, i) => (
                  <span key={i} className="text-green-400 hover:text-green-800 cursor-pointer">
                    {edge.source} → {edge.target}
                    {i < connectedEdges.length - 1 ? ", " : ""}
                  </span>
                ))
              : "No edges connected"}
          </pre>
        </div>
      )}
    </div>
  );
}