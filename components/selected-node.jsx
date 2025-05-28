import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Import the X icon
import styles from "./selected-node.module.css";

export default function SelectedNode({ node, handleLinkClick, deselectNode, graphData }) {
  const [showSummary, setShowSummary] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [showEdges, setShowEdges] = useState(false);

  return (
    <>
      <div className={`flex flex-col items-left w-[30vw] gap-1 z-20 fixed left-[1vw] top-[2vh] max-h-[80vh] overflow-y-auto overflow-x-hidden !bg-gray-100 !rounded-md border backdrop-blur-md !bg-opacity-50 ${styles.scroll}`}>
        <div className="flex flex-row justify-between items-center">
          <a href={node.url} className="text-gray-700 text-md font-bold p-0">{node.title}</a>
        
          <div className="flex gap-1 items-center">
            <Button
              variant="ghost"
              onClick={deselectNode}
              className="h-[24px] w-[24px] flex items-center justify-center"
              aria-label="Close"
            >
              <XMarkIcon className="h-4 w-4 text-black-700" />
            </Button>
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <div
            onClick={() => setShowSummary(!showSummary)}
            className={`text-xs cursor-pointer ${showSummary ? "text-blue-500" : "text-gray-700"}`}
          >
            Summary
          </div>
          <div
            onClick={() => setShowDetails(!showDetails)}
            className={`text-xs cursor-pointer ${showDetails ? "text-blue-500" : "text-gray-700"}`}
          >
            Links
          </div>
          <div
            onClick={() => setShowImageDetails(!showImageDetails)}
            className={`text-xs cursor-pointer ${showImageDetails ? "text-blue-500" : "text-gray-700"}`}
          >
            Image
          </div>
          <div
            onClick={() => setShowEdges(!showEdges)}
            className={`text-xs cursor-pointer ${showEdges ? "text-blue-500" : "text-gray-700"}`}
          >
            Edges
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {showSummary && (
            <div className="flex flex-col items-left border-t">
              <h3 className="text-sm mt-2">Summary</h3>
              <div className="mt-0 !p-0">
                {node.summary.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-xs p-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {showDetails && (
            <div className="border-t">
              <h3 className="text-sm mt-2">Links</h3>
              <div className="mt-0 max-h-[50vh] overflow-y-auto overflow-x-hidden !p-0">
                <div>
                  {node.links && (
                    <div className="flex flex-col gap-0">
                      {(() => {
                        const sortedLinks = [...node.links].sort((a, b) => b.title.length - a.title.length);
                        const itemsPerRowConfig = [2, 2, 3, 3, 2, 2, 1];
                        const rows = [];
                        let index = 0;

                        itemsPerRowConfig.forEach((itemsPerRow) => {
                          if (index < sortedLinks.length) {
                            rows.push(sortedLinks.slice(index, index + itemsPerRow));
                            index += itemsPerRow;
                          }
                        });

                        return rows.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex flex-row gap-0">
                            {row.map((link, index) => {
                              const linkedNode = graphData.nodes.find((n) => n.url === link.url);

                              return (
                                <div
                                  key={index}
                                  className="p-1 flex flex-row justify-between items-center"
                                >
                                  <p
                                    className={`max-h-[18px] text-xs text-left overflow-ellipsis overflow-hidden ${
                                      linkedNode ? "text-teal-600" : "text-gray-700 cursor-pointer"
                                    }`}
                                    onClick={!linkedNode ? () => handleLinkClick(link) : undefined}
                                  >
                                    {link.title}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {showImageDetails && (
            <div className="border-t">
              <h3 className="text-sm mt-2">Image</h3>
              <div className="flex flex-col items-center">
                {node.image ? (
                  <Image
                    src={node.image}
                    alt={node.title}
                    width={250}
                    height={200}
                  />
                ) : (
                  <p className="text-gray-500 text-xs">No image available</p>
                )}
              </div>
            </div>
          )}

          {showEdges && (
            <div className="border-t">
              <h3 className="text-sm mt-2">Edges</h3>
              <table className="table-auto border-collapse border border-gray-300 text-xs max-w-full">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left">Source</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Target</th>
                    <th className="border border-gray-300 px-2 py-1 text-left">Connection</th>
                  </tr>
                </thead>
                <tbody>
                  {graphData.links
                    .filter((link) => link.source === node.id || link.target === node.id)
                    .map((link, index) => (
                      <tr key={index} className="hover:bg-blue-100 !bg-opacity-25">
                        <td
                          className="border border-gray-300 px-2 py-1 text-[9px] overflow-hidden text-ellipsis whitespace-nowrap"
                          title={link.source}
                        >
                          {link.source}
                        </td>
                        <td
                          className="border border-gray-300 px-2 py-1 text-[9px]  overflow-hidden text-ellipsis whitespace-nowrap"
                          title={link.target}
                        >
                          {link.target}
                        </td>
                        <td
                          className="border border-gray-300 px-2 py-1 text-[9px] overflow-hidden text-ellipsis whitespace-nowrap"
                          title={link.connectionType}
                        >
                          {link.connectionType === "Child" ? (
                            <span className="text-gray-700">{link.connectionType}</span>
                          ) : (
                            <a
                              href={link.connectionType}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              {link.connectionType.split("https://en.wikipedia.org/wiki/")[1] || link.connectionType}
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}