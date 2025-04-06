"use client"

import { useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import ReactDOM from "react-dom/client";
import CustomNode from "@/components/custom-node"

export function ForceGraph({ data, onNodeClick }) {
  const svgRef = useRef(null)
  const tooltipRef = useRef(null)
  const [hoveredNode, setHoveredNode] = useState(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!svgRef.current || data.nodes.length === 0) return

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height])

    // Create a group for the graph elements
    const g = svg.append("g")

    // Add zoom functionality
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
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
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))

    // Create the links
    const link = g
      .append("g")
      .attr("stroke", "#f745b9")
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
    
      // node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      node
        .attr("x", (d) => d.x - 50) // Update x position
        .attr("y", (d) => d.y - 50); // Update y position
    }

    const node = g
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .join("foreignObject")
      .attr("class", "node")
      .attr("width", 80) // Adjust width for your CustomNode
      .attr("height", 80) // Adjust height for your CustomNode
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



    // // Create the nodes
    // const node = g
    //   .append("g")
    //   .selectAll(".node")
    //   .data(nodes)
    //   .join("g")
    //   .attr("class", "node")
    //   .call(drag(simulation))

    // // Add circles to nodes
    // node.append("circle").attr("r", 8).attr("fill", "#000")

    // // Add labels to nodes
    // node
    //   .append("text")
    //   .attr("dx", 12)
    //   .attr("dy", ".35em")
    //   .text((d) => (d.title.length > 20 ? d.title.substring(0, 20) + "..." : d.title))
    //   .attr("font-size", "10px")
    //   .attr("pointer-events", "none")

    // Handle node click
    node.on("dblclick", (event, d) => {
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

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  )
}

