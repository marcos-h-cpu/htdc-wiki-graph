"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import ReactDOM from "react-dom/client";
import CustomNode from "@/components/custom-node"
import styles from "./force-graph.module.css"

export function ForceGraph({ data, onNodeClick }) {
  const svgRef = useRef(null)
  const simulationRef = useRef(null); // Store the simulation instance

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height])

    const g = svg.append("g")

    // Add zoom functionality
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 10])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    // Prepare the data for D3
    const links = data.links.map((d) => ({ ...d }))
    const nodes = data.nodes.map((d) => ({ ...d }))

    // Create the force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(200),
      )
      .force("charge", d3.forceManyBody().strength(-250))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))

    simulationRef.current = simulation; // Store the simulation in the ref

    // Create the links
    const link = g
      .append("g")
      .attr("stroke", "#00897b")
      .attr("stroke-opacity", .9)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke-width", 1)

    function ticked() {
      link.attr("d", (d) => {
        const dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy) * .9;
    
        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });
    
      node
        .attr("x", (d) => d.x - 50)
        .attr("y", (d) => d.y - 50)
    }

    const node = g
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .join("foreignObject")
      .attr("class", "node")
      .attr("width", 80) // Adjust width for CustomNode
      .attr("height", 80) // Adjust height for CustomNode
      .attr("x", (d) => d.x - 40) // Center the node horizontally
      .attr("y", (d) => d.y - 40) // Center the node vertically
      .html((d) => {
        // Create a placeholder div for React to render into
        return `<div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
                  <div id="node-${d.id}"></div>
                </div>`;
      })
      .call(drag(simulation))

    nodes.forEach((node) => {
      const container = document.getElementById(`node-${node.id}`);
      if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(
          <CustomNode node={node} onClick={() => onNodeClick(node.id)} />
        );
      }
    });


    node.on("click", (event, d) => {
      onNodeClick(d.id)
    })

    simulation.on("tick", ticked)

    // Drag functionality
    function drag(simulation) {
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }

      function dragged(event, d) {
        d.fx = event.x
        d.fy = event.y
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }

      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
    }

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [data, onNodeClick])

  // Function to update forces dynamically
  const updateForce = (forceName, value) => {
    if (simulationRef.current) {
      if (forceName === "charge") {
        simulationRef.current.force("charge").strength(value);
      } else if (forceName === "linkDistance") {
        simulationRef.current.force("link").distance(value);
      } else if (forceName === "x") {
        simulationRef.current.force("x", d3.forceX().strength(value));
      } else if (forceName === "y") {
        simulationRef.current.force("y", d3.forceY().strength(value));
      }
      simulationRef.current.alpha(1).restart(); // Restart the simulation to apply changes
    }
  };

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
      <div className="absolute top-[2vh] right-[1vw] flex flex-row gap-2 bg-gray-100 p-2 rounded-sm border backdrop-blur-md bg-opacity-50 text-xs">
        <label className="flex flex-col mb-2">
          <span className="mb-2">Repulsion</span>
          <input
            type="range"
            min="0"
            max="500"
            step="50"
            defaultValue="250"
            onChange={(e) => updateForce("charge", -(+e.target.value))}
            className={styles.rangeInput}
          />
        </label>
        <label className="flex flex-col mb-2">
          <span className="mb-2">Reach</span>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            defaultValue="200"
            onChange={(e) => updateForce("linkDistance", +e.target.value)}
            className={styles.rangeInput}
          />
        </label>
        <label className="flex flex-col mb-2">
          <span className="mb-2">X-Force</span>
          <input
            type="range"
            min="0"
            max="1"
            step=".1"
            defaultValue=".1"
            onChange={(e) => updateForce("x", +e.target.value)}
            className={styles.rangeInput}
          />
        </label>
        <label className="flex flex-col mb-2">
          <span className="mb-2">Y-Force</span>
          <input
            type="range"
            min="0"
            max="1"
            step=".1"
            defaultValue=".1"
            onChange={(e) => updateForce("y", +e.target.value)}
            className={styles.rangeInput}
          />
        </label>
      </div>
    </div>
  )
}

