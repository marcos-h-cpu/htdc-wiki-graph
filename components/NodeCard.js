import styles from './NodeCard.module.css';
import Image from 'next/image';
import { useState } from 'react';

export default function NodeCard({ id, left, top, width, height, title, content, ogImage, imageRatio, onClick }) {
    const [nodeInfoVisible, setNodeInfoVisible] = useState(false);

    const handleImageClick = () => {
        setNodeInfoVisible(!nodeInfoVisible);
    };

    return (
        <div 
        onDoubleClick={() => onClick({ title, content })} 
        style={{ 
            position: 'absolute', 
            left, 
            top, 
            width, 
            height, 
            transform: "translate(-50%, -50%)" 
        }}>
            <Image
                className={styles.thumbnail}
                src={ogImage}
                alt={title}
                width={width} 
                height={width}
                onDoubleClick={handleImageClick}
            />

            {/* {nodeInfoVisible && (
                <div className={styles.hidden}>
                    <div className={styles.container} style={{
                        "width": width *6, "minWidth": "300px", "maxWidth": "500px",
                        "height": width, "minHeight": "100px", "maxHeight": "300px",
                        }}>
                        <div className={`${styles.field} ${styles.bold}`}>Node: {title}</div>
                        <div className={`${styles.field} ${styles.abstract}`}>{content}</div>
                    </div>
                </div>
            )} */}
        </div>
    );
}
