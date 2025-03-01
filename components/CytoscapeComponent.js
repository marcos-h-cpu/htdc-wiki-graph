import Cytoscape from "cytoscape";
import { useEffect, useRef, useState } from "react";
import NodeCard from "./NodeCard";

export default function CytoscapeComponent({ nodesData = [] }) {
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [nodeCardData, setNodeCardData] = useState({});
    const [zoom, setZoom] = useState(1); // Track zoom level

    useEffect(() => {
        if (!cyRef.current) {
            const cy = Cytoscape({
                container: containerRef.current,
                elements: [],
                style: [
                    { selector: "node", style: { width: 30, height: 30, shape: "rectangle", "background-opacity": "0" } },
                    { selector: "edge", style: { "curve-style": "unbundled-bezier", "line-color": "magenta", "width": 1 } }
                ],
                layout: { name: "cose" }
            });
            cyRef.current = cy;
        }

        const cy = cyRef.current;
        if (!cy) return;

        // Add nodes if they don’t already exist
        const updatedNodeCardData = { ...nodeCardData };
        nodesData.forEach((newNode) => {
            if (!cy.$(`#${newNode.data.id}`).length) {
                // Generate random position
                const randomX = Math.random() * cy.width();
                const randomY = Math.random() * cy.height();

                // Add new node
                cy.add({
                    ...newNode,
                    position: { x: randomX, y: randomY }
                });

                // Store node card data
                updatedNodeCardData[newNode.data.id] = {
                    left: randomX,
                    top: randomY,
                    width: 50,
                    height: 50,
                    title: newNode.data.title || "Untitled Node",
                    content: newNode.data.content || "No content available",
                    ogImage: newNode.data.ogImage || "/test.jpg",
                    imageRatio: newNode.data.imageRatio || 1,
                };

                // **Edge Creation Logic**
                newNode.data.links?.forEach((link) => {
                    cy.nodes().forEach((existing) => {
                        const existingLinks = existing.data("links") || [];
                        const hasMatchingLink = existingLinks.some((l) => l.id === link.id);

                        if (hasMatchingLink) {
                            const sourceId = newNode.data.id;
                            const targetId = existing.id();

                            if (
                                sourceId !== targetId &&
                                !cy.$(`edge[source="${sourceId}"][target="${targetId}"]`).length
                            ) {
                                cy.add({ data: { id: `${sourceId}-${targetId}`, source: sourceId, target: targetId } });
                            }
                        }
                    });
                });
            }
        });

        setNodeCardData(updatedNodeCardData);

        // Function to update NodeCard positions and sizes
        const updateNodeCardPositions = () => {
            setNodeCardData((prev) => {
                const updatedData = { ...prev };
                cy.nodes().forEach((node) => {
                    const pos = node.renderedPosition();
                    const size = 50 * cy.zoom(); // Scale dynamically with zoom

                    if (updatedData[node.id()]) {
                        updatedData[node.id()] = {
                            ...updatedData[node.id()],
                            left: pos.x,
                            top: pos.y,
                            width: size,
                            height: size
                        };
                    }
                });
                return updatedData;
            });

            setZoom(cy.zoom()); // Track zoom changes
        };

        // Listen for drag, zoom, and pan events
        cy.on("drag free zoom pan", updateNodeCardPositions);

        return () => {
            cy.off("drag free zoom pan", updateNodeCardPositions);
        };
    }, [nodesData]);

    return (
        <div ref={containerRef} style={{ width: "100%", height: "500px", position: "relative" }}>
            {Object.entries(nodeCardData).map(([id, data]) => (
                <NodeCard key={id} id={id} {...data} />
            ))}
        </div>
    );
}
