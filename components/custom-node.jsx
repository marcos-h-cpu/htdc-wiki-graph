"use client" 
import Image from "next/image"
import styles from "./custom-node.module.css"
import { useState } from "react"

export default function CustomNode({ node, onClick }) {
    const [isHovered, setIsHovered] = useState(false)
    return (
        <div 
            onClick={onClick}
            className={styles.container}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            
            {!node.image ? (
                <p className={`${styles.title} text-gray-600`}>{node.title}</p>
            ) : (
                <>
                    {/* <div className={isHovered ? styles.visible : styles.hidden}>
                        <p className={`${styles.title} text-xs mt-1 text-gray-600`}>{node.title}</p>
                    </div> */}
                    <Image className={styles.thumbnail}
                        src={node.image || "/placeholder.png"}
                        alt={node.title}
                        width={50}
                        height={50}
                        layout="intrinsic"
                    />
                </>
            )}

        </div>
    )
}
