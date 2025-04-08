import Image from "next/image"

export default function SelectedNode({ node }) {
    return (
        <div className="flex flex-col items-left p-4 w-[600px] backdrop-blur-2xl bg-white/10">
            <h2 className="text-md font-bold">{node.title}</h2>
            {/* {node.image && (
                <Image src={node.image} alt={node.title} width={200} height={200} layout="intrinsic" />
            )} */}
            <p className="text-gray-700 text-sm mt-2">{node.summary}</p>
        </div>
    )
}