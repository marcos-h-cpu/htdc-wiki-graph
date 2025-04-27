import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"



export default function SelectedNode({ node, handleLinkClick, deselectNode }) {
    const [isNodeDataVisible, setIsNodeDataVisible] = useState(true)

    const toggleIsNodeDataVisible = () => {
        setIsNodeDataVisible(!isNodeDataVisible)
    }

    return (
        <>
        <div className="flex flex-col items-left max-h-[80vh] w-[460px] gap-2 bg-gray-100 rounded-sm border py-[10px] px-[14px] backdrop-blur-md bg-opacity-50 z-20">
            <div className="mt-0 custom-scrollbar overflow-y-auto overflow-x-hidden">
                <a href={node.url}><p className="text-gray-700 text-s">{node.title}</p></a>
                <p className="text-xs">{node.summary}</p>
            </div>
            <Button variant="ghost" onClick={deselectNode} className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white">
                Close
            </Button>
        </div>
        {isNodeDataVisible && <>
            <div className="flex flex-col items-left max-h-[80vh] w-[20vw] gap-2 bg-gray-100 rounded-sm border py-[10px] px-[14px] backdrop-blur-md bg-opacity-50 z-20 fixed right-4 top-4">
            <p className="text-gray-700 text-s">Image Source</p>
            <p className="text-purple-500 text-[10px] max-h-[50px] overflow-hidden">{node.image}</p>
            <div className="border-t border-gray-300 my-2"></div>
            <p className="text-gray-700 text-s">Links</p>
            <div className="mt-0">
                    {node.links && (
                        <div className="flex flex-col items-center gap-2">
                            {(() => {
                                const sortedLinks = [...node.links].sort((a, b) => b.title.length - a.title.length);

                                const rows = [
                                    sortedLinks.slice(0, 1),
                                    sortedLinks.slice(1, 3),
                                    sortedLinks.slice(3, 5),
                                    sortedLinks.slice(5, 7),
                                    sortedLinks.slice(7, 9),
                                    sortedLinks.slice(9, 11),
                                    sortedLinks.slice(11, 14),
                                    sortedLinks.slice(14, 15)
                                ];

                                return rows.map((row, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="flex gap-2"
                                    >
                                        {row.map((link, linkIndex) => (
                                            <p
                                                key={linkIndex}
                                                className="text-purple-500 text-[10px] cursor-pointer text-center hover:underline"
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
                <Button variant="ghost" onClick={toggleIsNodeDataVisible} className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white">
                Close
                </Button>
        </div>
        </>}
        {/* <div className="flex flex-col items-left max-h-[80vh] w-[20vw] gap-2 bg-gray-100 rounded-sm border py-[10px] px-[14px] backdrop-blur-md bg-opacity-50 z-20 fixed right-4 top-4">
            <p className="text-gray-700 text-s">Image Source</p>
            <p className="text-purple-500 text-[10px] max-h-[50px] overflow-hidden">{node.image}</p>
            <div className="border-t border-gray-300 my-2"></div>
            <p className="text-gray-700 text-s">Links</p>
            <div className="mt-0">
                    {node.links && (
                        <div className="flex flex-col items-center gap-2">
                            {(() => {
                                const sortedLinks = [...node.links].sort((a, b) => b.title.length - a.title.length);

                                const rows = [
                                    sortedLinks.slice(0, 1),
                                    sortedLinks.slice(1, 3),
                                    sortedLinks.slice(3, 5),
                                    sortedLinks.slice(5, 7),
                                    sortedLinks.slice(7, 9),
                                    sortedLinks.slice(9, 11),
                                    sortedLinks.slice(11, 14),
                                    sortedLinks.slice(14, 15)
                                ];

                                return rows.map((row, rowIndex) => (
                                    <div
                                        key={rowIndex}
                                        className="flex gap-2"
                                    >
                                        {row.map((link, linkIndex) => (
                                            <p
                                                key={linkIndex}
                                                className="text-purple-500 text-[10px] cursor-pointer text-center hover:underline"
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
                <Button variant="ghost" onClick={deselectNode} className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white">
                Close
                </Button>
        </div> */}
        </>
    )
}