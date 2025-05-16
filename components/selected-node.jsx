import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline"; // Import the X icon
import styles from "./selected-node.module.css";

export default function SelectedNode({ node, handleLinkClick, deselectNode, graphData }) {
  const [view, setView] = useState("summary");

  return (
    <>
      <div className="flex flex-col items-left w-[30vw] gap-1 z-20 fixed left-[1vw] top-[2vh]">
        <div className="flex flex-row justify-between items-center">
        <a href={node.url} className="text-gray-700 text-md p-0">{node.title}</a>
        
        <div className="flex gap-1 items-center">
          <select
            onChange={(e) => setView(e.target.value)}
            value={view}
            className="py-2 text-xs cursor-pointer flex items-center px-1"
          >
            <option value="summary">Summary</option>
            <option value="details">Links</option>
            <option value="image details">Image</option>
          </select>

          <Button
            variant="ghost"
            onClick={deselectNode}
            className="h-[24px] w-[24px] flex items-center justify-center"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        </div>

        {view === "summary" && (
          <div className="flex flex-col items-left">
            <div className={`mt-0 max-h-[450px] overflow-y-auto overflow-x-hidden !p-0 ${styles.scroll}`}>
              {node.summary.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-xs p-0">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        )}

        {view === "details" && (
          <div>
            <div className={`mt-0 max-h-[50vh] overflow-y-auto overflow-x-hidden !p-0 ${styles.scroll}`}>

              <div>
                {node.links && (
                  <div className="flex flex-col gap-0">
                    {(() => {
                      // Sort links by title length
                      const sortedLinks = [...node.links].sort((a, b) => b.title.length - a.title.length);

                      // Define the number of items per row for each row
                      const itemsPerRowConfig = [2, 2, 3, 3, 2, 2, 1];
                      // Group links into rows based on the configuration
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

        {view === "image details" && (
          <div>
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
      </div>
    </>
  );
}