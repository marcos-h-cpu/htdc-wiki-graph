"use client" 
import Image from "next/image"
import styles from "./custom-node.module.css"
import { useState } from "react"

export default function CustomNode({ node, onClick, isCarouselNode }) {
    if (isCarouselNode) {
        return (
            <div 
                onClick={onClick}
                className={`${styles.container_carousel} ${styles.carouselNode}`}
            >
                <Image
                    className={styles.thumbnail_carousel}
                    src={node.image || "/placeholder.png"}
                    alt={node.title}
                    width={20}
                    height={20}
                    layout="intrinsic"
                />
            </div>
        )
    } else 

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
