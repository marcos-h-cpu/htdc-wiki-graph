import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function SelectedNode({ node, handleLinkClick, deselectNode }) {
  const [view, setView] = useState("summary");

  return (
    <>
      <div>
        {view === "summary" && (
          <div className="flex flex-col items-left max-h-[80vh] w-[30vw] gap-2 bg-gray-100 rounded-sm border py-[2vh] px-[1vw] backdrop-blur-md bg-opacity-50 z-20 fixed left-[1vw] top-[2vh]">
            <div className="mt-0 custom-scrollbar overflow-y-auto overflow-x-hidden">
              <a href={node.url}>
                <p className="text-gray-700 text-s">{node.title}</p>
              </a>
              <p className="text-xs">{node.summary}</p>
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
          <div className="flex flex-col items-left max-h-[80vh] w-[30vw] gap-1 bg-gray-100 rounded-sm border py-[2vh] px-[1vw] backdrop-blur-md bg-opacity-50 z-20 fixed left-[1vw] top-[2vh]">
            <p className="text-gray-700 text-s">{node.title}</p>
            <div className="border-t border-gray-300 my-2"></div>
            <p className="text-gray-700 text-s">Image Source</p>
            <p className="text-teal-600 text-[10px] max-h-[50px] overflow-hidden">
              {node.image}
            </p>
            <div className="border-t border-gray-300 my-2"></div>
            <p className="text-gray-700 text-s">Links</p>
            <div className="mt-0">
              {node.links && (
                <div className="flex flex-col items-left gap-2">
                  {(() => {
                    const sortedLinks = [...node.links].sort(
                      (a, b) => b.title.length - a.title.length
                    );

                    const rows = [
                      sortedLinks.slice(0, 2),
                      sortedLinks.slice(2, 5),
                      sortedLinks.slice(5, 8),
                      sortedLinks.slice(8, 11),
                      sortedLinks.slice(11, 13),
                      sortedLinks.slice(13, 15),
                    ];

                    return rows.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-2">
                        {row.map((link, linkIndex) => (
                          <p
                            key={linkIndex}
                            className="text-teal-600 text-[10px] cursor-pointer text-center hover:underline"
                            onClick={() => handleLinkClick(link)}
                          >
                            {link.title}
                          </p>
                        ))}
                      </div>
                    ));
                  })()}
                </div>
              )}
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