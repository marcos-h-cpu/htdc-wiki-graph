import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import styles from "./selected-node.module.css";

export default function SelectedNode({ node, handleLinkClick, deselectNode, graphData }) {
  const [showSummary, setShowSummary] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showImageDetails, setShowImageDetails] = useState(false);
  const [showEdges, setShowEdges] = useState(false);

  return (
    <>
      <div className={`flex flex-col items-left z-20 fixed left-[1vw] top-[2vh] min-w-[30vw] max-h-[80vh] overflow-y-auto overflow-x-hidden !bg-gray-100 !rounded-md border backdrop-blur-md !bg-opacity-50 ${styles.scroll}`}>
        <div className="flex flex-row justify-between items-center px-2 py-1 border-b sticky top-0 bg-gray-100 bg-opacity-80 backdrop-blur-xl">
          <div className="flex flex-col gap-0 p-0">
            <div className="flex flex-row items-end gap-1 pr-4">
                <a href={node.url} className="text-gray-700 text-xs font-bold">{node.title}</a>
                <div
                  onClick={() => setShowSummary(!showSummary)}
                  className={`text-xs hover:text-blue-800 cursor-pointer ${showSummary ? "text-blue-500" : "text-gray-700"}`}
                >
                  Summary
                </div>
                <div
                  onClick={() => setShowDetails(!showDetails)}
                  className={`text-xs hover:text-blue-800 cursor-pointer ${showDetails ? "text-blue-500" : "text-gray-700"}`}
                >
                  Links
                </div>
                <div
                  onClick={() => setShowImageDetails(!showImageDetails)}
                  className={`text-xs hover:text-blue-800 cursor-pointer ${showImageDetails ? "text-blue-500" : "text-gray-700"}`}
                >
                  Image
                </div>
                <div
                  onClick={() => setShowEdges(!showEdges)}
                  className={`text-xs hover:text-blue-800 cursor-pointer ${showEdges ? "text-blue-500" : "text-gray-700"}`}
                >
                  Edges
                </div>
              </div>
          </div>
          <Button
              variant="ghost"
              onClick={deselectNode}
              className="h-[16px] !w-[16px] flex items-center justify-center !p-0"
              aria-label="Close"
            >
              <XMarkIcon className="h-4 w-4 text-black-700" />
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {showSummary && (
            <div className="flex flex-col items-left border-t px-3 mb-2 max-w-[30vw]">
              <h3 className="text-xs mt-2">Summary</h3>
              <div>
                {node.summary.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-xs p-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {showDetails && (
            <div className="border-t px-3 mb-2 max-w-[30vw]">
                <div className="flex flex-wrap gap-1 mt-2 ">
                  {node.links &&
                    [...node.links]
                      .sort((a, b) => b.title.length - a.title.length)
                      .map((link, index) => {
                        const linkedNode = graphData.nodes.find((n) => n.url === link.url);

                        return (
                          <div
                            key={index}
                            className="flex-shrink-0"
                            style={{ maxWidth: "fit-content" }}
                          >
                            <p
                              className={`text-xs text-left overflow-ellipsis overflow-hidden ${
                                linkedNode ? "text-blue-400" : "text-gray-700 cursor-pointer  hover:text-blue-800"
                              }`}
                              onClick={!linkedNode ? () => handleLinkClick(link) : undefined}
                            >
                              {link.title}
                            </p>
                          </div>
                        );
                      })}
                </div>
            </div>
          )}

          {showImageDetails && (
            <div className="border-t px-3 mb-2 max-w-[30vw]">
              <div className="flex flex-col items-center mt-2">
                {node.image ? (
                  <Image
                    src={node.image}
                    alt={node.title}
                    layout="responsive"
                    width={100}
                    height={75}
                  />
                ) : (
                  <p className="text-gray-500 text-xs">No image available</p>
                )}
              </div>
            </div>
          )}

          {showEdges && (
            <div className="border-t mb-2 px-2  max-w-[30vw]">
              <table
                className="table-auto border-collapse border border-gray-300 text-xs w-full mt-2"
                style={{ tableLayout: "fixed" }}
              >
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-2 py-1 text-left text-xs">Source</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-xs">Target</th>
                    <th className="border border-gray-300 px-2 py-1 text-left text-xs">Connection</th>
                  </tr>
                </thead>
                <tbody>
                  {graphData.links
                    .filter((link) => link.source === node.id || link.target === node.id)
                    .map((link, index) => (
                      <tr key={index} className="hover:bg-blue-100 !bg-opacity-25">
                        <td
                          className="border border-gray-300 px-2 py-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap"
                          title={link.source}
                        >
                          {link.source}
                        </td>
                        <td
                          className="border border-gray-300 px-2 py-1 text-xs  overflow-hidden text-ellipsis whitespace-nowrap"
                          title={link.target}
                        >
                          {link.target}
                        </td>
                        <td
                          className="border border-gray-300 px-2 py-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap"
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