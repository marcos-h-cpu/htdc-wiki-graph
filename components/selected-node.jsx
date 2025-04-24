import Image from "next/image"
import { Button } from "@/components/ui/button"


export default function SelectedNode({ node, handleLinkClick, deselectNode }) {
    return (
        <>
        <div className="flex flex-col items-left w-[460px] gap-2 bg-gray-100 rounded-sm border py-[10px] px-[10px] backdrop-blur-md bg-opacity-50">
            <p className="mt-0">
                <a href={node.url}><p className="text-gray-700 text-s">{node.title}</p></a>
                <p className="text-xs">{node.summary}</p>
            </p>
            <Button variant="ghost" onClick={deselectNode} className="h-[24px] w-[50px] rounded-full px-4 py-2 text-xs border bg-white">
                Close
              </Button>
        </div>
        <div className="mt-4 fixed top-2 right-4 z-10">
            {node.links && (
                <div className="flex flex-col items-end gap-2">
                    {(() => {
                        // Sort links by character length
                        const sortedLinks = [...node.links].sort((a, b) => b.title.length - a.title.length);

                        // Distribute links into rows (5, 4, 3, 2, 1)
                        const rows = [
                            sortedLinks.slice(0, 3),
                            sortedLinks.slice(3, 6),
                            sortedLinks.slice(6, 9),
                            sortedLinks.slice(9, 11),
                            sortedLinks.slice(11, 13),
                            sortedLinks.slice(13, 14),
                            sortedLinks.slice(14, 15)
                        ];

                        return rows.map((row, rowIndex) => (
                            <div
                                key={rowIndex}
                                className="flex justify-end gap-2"
                                style={{ width: `${150 - rowIndex * 10}%` }}
                            >
                                {row.map((link, linkIndex) => (
                                    <p
                                        key={linkIndex}
                                        className="text-blue-500 text-xs cursor-pointer text-right hover:underline"
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
        </>
    )
}