import Cytoscape from "cytoscape";
import { useEffect, useRef, useState } from "react";
import NodeCard from "./NodeCard";

export default function CytoscapeComponent({ nodesData = [], setFocusedNode }) {
    const cyRef = useRef(null);
    const containerRef = useRef(null);
    const [nodeCardData, setNodeCardData] = useState({});
    const [zoom, setZoom] = useState(1);

    // HashMap for quick link lookup
    const linkToNodes = useRef(new Map());

    useEffect(() => {
        if (!cyRef.current) {
            cyRef.current = Cytoscape({
                container: containerRef.current,
                elements: [],
                style: [
                    { selector: "node", style: { width: 30, height: 30, shape: "rectangle", "background-opacity": "0" } },
                    { selector: "edge", style: { "curve-style": "unbundled-bezier", "line-color": "magenta", "width": 1 } }
                ],
                layout: { name: "cose" }
            });
        }

        const cy = cyRef.current;
        if (!cy) return;

        const updatedNodeCardData = { ...nodeCardData };

        nodesData.forEach((newNode) => {
            if (!cy.$(`#${newNode.data.id}`).length) {
                addNodeToGraph(cy, newNode, updatedNodeCardData);
                createEdges(cy, newNode);
            }
        });

        setNodeCardData(updatedNodeCardData);

        const updateNodeCardPositions = () => {
            setNodeCardData((prev) => {
                const updatedData = { ...prev };
                cy.nodes().forEach((node) => {
                    const pos = node.renderedPosition();
                    const size = 50 * cy.zoom();
                    if (updatedData[node.id()]) {
                        updatedData[node.id()] = { ...updatedData[node.id()], left: pos.x, top: pos.y, width: size, height: size };
                    }
                });
                return updatedData;
            });
            setZoom(cy.zoom());
        };

        cy.on("drag free zoom pan", updateNodeCardPositions);

        return () => {
            cy.off("drag free zoom pan", updateNodeCardPositions);
        };
    }, [nodesData]);

    function addNodeToGraph(cy, newNode, updatedNodeCardData) {
        const randomX = Math.random() * cy.width();
        const randomY = Math.random() * cy.height();

        cy.add({
            ...newNode,
            position: { x: randomX, y: randomY }
        });

        updatedNodeCardData[newNode.data.id] = {
            left: randomX,
            top: randomY,
            width: 50,
            height: 50,
            title: newNode.data.title || "Untitled Node",
            content: newNode.data.content || "No content available",
            ogImage: newNode.data.ogImage || "/logo.svg",
            imageRatio: newNode.data.imageRatio || 1,
        };
    }

    function createEdges(cy, newNode) {
        const nodeId = newNode.data.id;

        newNode.data.links?.forEach((link) => {
            const linkId = link.linkId;

            if (!linkToNodes.current.has(linkId)) {
                linkToNodes.current.set(linkId, new Set());
            }

            const matchingNodes = linkToNodes.current.get(linkId);

            matchingNodes.forEach((existingNodeId) => {
                if (nodeId !== existingNodeId && !cy.$(`edge[source="${nodeId}"][target="${existingNodeId}"]`).length) {
                    cy.add({ data: { id: `${nodeId}-${existingNodeId}`, source: nodeId, target: existingNodeId } });
                }
            });

            // Add the new node to the set for future lookups
            matchingNodes.add(nodeId);
        });
    }

    return (
        <div ref={containerRef} style={{ width: "100%", height: "600px", position: "relative" }}>
            {Object.entries(nodeCardData).map(([id, data]) => (
                <NodeCard key={id} id={id} {...data} onClick={() => setFocusedNode({ id, data })} />
            ))}
        </div>
    );
}
