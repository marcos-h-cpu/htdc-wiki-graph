import Image from "next/image"

export default function SelectedNode({ node }) {
    return (
        <>
        <div className="flex flex-col items-left w-[500px] gap-0">
            <a href={node.url}><p className="text-gray-700 text-s">{node.title}</p></a>
            <p className="text-gray-700 text-xs mt-2">{node.summary}</p>
        </div>
        <div className="mt-4 fixed top-2 right-4 z-10">
            {node.links && (
                <div className="flex flex-col items-end gap-2">
                    {(() => {
                        // Sort links by character length
                        const sortedLinks = [...node.links].sort((a, b) => b.title.length - a.title.length);

                        // Distribute links into rows (5, 4, 3, 2, 1)
                        const rows = [
                            sortedLinks.slice(0, 5),
                            sortedLinks.slice(5, 9),
                            sortedLinks.slice(9, 12),
                            sortedLinks.slice(12, 14),
                            sortedLinks.slice(14, 15),
                        ];

                        return rows.map((row, rowIndex) => (
                            <div
                                key={rowIndex}
                                className="flex justify-end gap-2"
                                style={{ width: `${200 - rowIndex * 20}%` }} // Decrease width for each row
                            >
                                {row.map((link, linkIndex) => (
                                    <p
                                        key={linkIndex}
                                        className="text-blue-500 text-xs cursor-pointer text-right hover:underline"
                                        onClick={() => console.log(link)}
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