import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import styles from "./selected-node.module.css";

export default function SelectedNode({ node, handleLinkClick, deselectNode, graphData }) {
  const [view, setView] = useState("summary");

  return (
    <>
      <div>
        {view === "summary" && (
          <div className="flex flex-col items-left max-h-[80vh] w-[30vw] gap-1 bg-gray-100 rounded-sm border py-[5px] px-[10px] backdrop-blur-md bg-opacity-50 z-20 fixed left-[1vw] top-[2vh]">
            <a href={node.url} className="text-gray-700 text-s p-1">{node.title}</a>
            <div className={`mt-0 max-h-[50vh] overflow-y-auto overflow-x-hidden !p-2 ${styles.scroll}`}>
              <p className="text-xs p-1">{node.summary}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setView("details")}
                className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white"
              >
                Details
              </Button>
              <Button
                variant="ghost"
                onClick={deselectNode}
                className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white"
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {view === "details" && (
          <div className="flex flex-col items-left max-h-[80vh] w-[30vw] gap-1 bg-gray-100 rounded-sm border py-[5px] px-[10px] backdrop-blur-md bg-opacity-50 z-20 fixed left-[1vw] top-[2vh]">
          <p className="text-gray-700 text-s p-1">{node.title}</p>
          <div className={`mt-0 max-h-[50vh] overflow-y-auto overflow-x-hidden !p-2 ${styles.scroll}`}>
            <p className="text-gray-700 text-s">Image Source</p>
            <p className="text-teal-600 text-xs w-full overflow-ellipsis nowrap">
              {node.image}
            </p>
            <div className="border-t border-gray-300 my-2"></div>
            <p className="text-gray-700 text-s">Links</p>
            <div className="mt-0">
              {node.links && (
                <div className="grid grid-cols-2 gap-2">
                  {node.links.map((link, index) => {
                    const linkedNode = graphData.nodes.find((n) => n.url === link.url);

                    return (
                      <div
                        key={index}
                        className="border p-1 flex flex-row justify-between items-center relative group cursor-pointer"
                      >
                        <p className="h-[18px] max-h-[18px] w-[full] text-gray-700 text-xs text-left overflow-ellipsis overflow-hidden">
                          {link.title}
                        </p>
                        {linkedNode ? (
                          <span>
                            
                          </span>
                        ) : (
                          <span
                            className="cursor-pointer"
                            onClick={() => handleLinkClick(link)}
                          >
                            +
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setView("summary")}
                className="h-[24px] w-[70px] rounded-full px-4 py-2 text-xs border bg-white"
              >
                Summary
              </Button>
              <Button
                variant="ghost"
                onClick={deselectNode}
                className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white"
              >
                Close
              </Button>
          </div>
          </div>
        )}
      </div>
    </>
  );
}