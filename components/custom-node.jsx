"use client" 
import Image from "next/image"
import styles from "./custom-node.module.css"
import { useState } from "react"

export default function CustomNode({ node, onClick }) {
    return (
        <div 
            onClick={onClick}
            className={styles.container}
        >
            
            {!node.image ? (
                <p className={`${styles.title} text-gray-600`}>{node.title}</p>
            ) : (
                <>
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
