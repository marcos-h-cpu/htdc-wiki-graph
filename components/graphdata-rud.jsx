import { useState } from "react";
import styles from "./graphdata-rud.module.css";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@heroicons/react/24/solid";



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
                <div className="sticky top-0 bg-gray-100 bg-opacity-80 backdrop-blur-xl z-10 px-2 py-1 border-b flex flex-col gap-0">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-row justify-start items-center gap-1">
                            <h2 className="text-gray-700 text-xs font-bold p-0">Graph Data</h2>
                              <button
                                className="text-red-500 rounded-full hover:bg-red-500 hover:text-white border p-1 flex items-center"
                                onClick={handleDiscardChanges}
                              >
                                <TrashIcon className="h-3 w-3 inline-block" />
                              </button>
                            <button
                                className="text-blue-600 rounded-full hover:bg-blue-500 hover:text-white border p-1 flex items-center text-[9px]"
                                onClick={handleSaveChanges}
                              >
                                Save Changes
                              </button>
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
                <div className="flex flex-col gap-0 h-full">
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
  const [popupLink, setPopupLink] = useState(null); // State to track the clicked link
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const connectedEdges = graphData.links.filter(
    (link) => link.source === node.id || link.target === node.id
  );

  const handleLinkClick = (link, event) => {
    const rect = event.target.getBoundingClientRect(); // Get the position of the clicked link
    setPopupLink(link); // Set the clicked link in state
    setPopupPosition({ top: rect.top + window.scrollY, left: rect.left + window.scrollX }); // Adjust for scroll position
  };

  const handleNodeChange = (key, value) => {
    setTempData((prevData) => {
      const updatedNodes = prevData.nodes.map((n) =>
        n.id === node.id ? { ...n, [key]: value } : n
      );
      return { ...prevData, nodes: updatedNodes };
    });
  };

  const handleDeleteLink = (linkToDelete) => {
    setTempData((prevData) => {
      const updatedNodes = prevData.nodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              links: n.links.filter(
                (link) => link.title !== linkToDelete.title || link.url !== linkToDelete.url
              ),
            }
          : n
      );
  
      const updatedEdges = prevData.links.filter(
        (edge) =>
          edge.source !== node.id || edge.target !== linkToDelete.title.replace(/ /g, "_")
      );
  
      return { ...prevData, nodes: updatedNodes, links: updatedEdges };
    });
  
    setPopupLink(null);
  };

  return (
    <div className="border-t p-2 px-4 hover:bg-blue-100 hover:bg-opacity-30">
      <div
        className="cursor-pointer text-xs font-semibold text-gray-800"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex justify-between items-center">
          <span className="font-bold">{node.id || "No ID available"}</span>
          <span className="text-black-500">{isCollapsed ? "+" : "-"}</span>
        </div>
      </div>
      {!isCollapsed && (
        <div className="pl-4 text-xs text-gray-700 flex flex-col">
          <span>
            <span className="text-gray-700">{node.summary || "No summary available"}</span>
          </span>
          <span>
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
          </span>
          <span>
            <strong>Links:</strong>{" "}
            {node.links && node.links.length > 0
              ? node.links.map((link, i) => (
                <span
                key={i}
                className="text-blue-300 hover:text-blue-800 cursor-pointer"
                onClick={(event) => handleLinkClick(link, event)} // Pass the event object
              >
                {link.title} ({link.url})
                {i < node.links.length - 1 ? ", " : ""}
              </span>
                ))
              : "No links available"}
          </span>
          <span className="whitespace-pre-wrap">
            <strong>Edges:</strong>{" "}
            {connectedEdges.length > 0
              ? connectedEdges.map((edge, i) => (
                  <span key={i} className="text-green-400 hover:text-green-800 cursor-pointer">
                    {edge.source} → {edge.target}
                    {i < connectedEdges.length - 1 ? ", " : ""}
                  </span>
                ))
              : "No edges connected"}
          </span>
        </div>
      )}

      {/* Popup for deleting a link */}
      {popupLink && (
        <div
          className="absolute bg-gray-200 bg-opacity-20 backdrop-blur-md border rounded-md text-xs shadow-lg z-50"
          style={{
            top: popupPosition.top + 20, // Add offset for better visibility
            left: popupPosition.left + 20, // Add offset for better visibility
          }}
        >
          <div className="sticky top-0 bg-gray-100 bg-opacity-50 backdrop-blur-md z-10 pt-1 px-1 border-b flex flex-row justify-between items-center">
            <p><strong>Delete Link</strong></p>
            <Button
              variant="ghost"
              onClick={() => setPopupLink(null)}   
              className="h-[16px] !w-[16px] flex items-center justify-center !p-0 hover:bg-gray-200"
              aria-label="Close"
            >
              <XMarkIcon className="h-4 w-4 text-black-700" />
            </Button>
          </div>
          <div className="p-1 flex flex-row items-center gap-1">
            <p>
              {popupLink.title} from node: {node.title || node.id}
            </p>
            <div>
              <button
                className="text-red-500 rounded-full hover:bg-red-500 hover:text-white border p-1 flex items-center"
                onClick={() => handleDeleteLink(popupLink)}
              >
                <TrashIcon className="h-3 w-3 inline-block" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}