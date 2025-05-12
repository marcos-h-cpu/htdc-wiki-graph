"use client"

import { useState, useRef, useEffect } from "react"
import * as d3 from "d3"
import ReactDOM from "react-dom/client";
import CustomNode from "@/components/custom-node"
import styles from "./wikipedia-graph.module.css"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import SelectedNode from "@/components/selected-node"
import Toolbar from "@/components/toolbar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"


export default function WikipediaGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false)

  const filteredNodes = searchTerm
  ? graphData.nodes.filter((node) => node.title.toLowerCase().includes(searchTerm.toLowerCase()))
  : graphData.nodes

  const filteredLinks = searchTerm
    ? graphData.links.filter((link) => {
        const sourceNode = graphData.nodes.find((n) => n.id === link.source)
        const targetNode = graphData.nodes.find((n) => n.id === link.target)
        return sourceNode && filteredNodes.includes(sourceNode) && targetNode && filteredNodes.includes(targetNode)
      })
    : graphData.links

  const filteredData = {
    nodes: filteredNodes,
    links: filteredLinks,
  }

  // Force graph simulation
  const svgRef = useRef(null)
  const simulationRef = useRef(null); // Store the simulation instance

  const handleNodeClick = async (nodeId) => {
    const node = graphData.nodes.find((n) => n.id === nodeId)
    if (!node) return
    setSelectedNode(node)
    console.log(node)
  }

  useEffect(() => {
      if (!svgRef.current || graphData.nodes.length === 0) return
  
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
      const links = filteredData.links.map((d) => ({ ...d }))
      const nodes = filteredData.nodes.map((d) => ({ ...d }))
  
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
        .force("y", d3.forceY(height / 2).strength(0.5))
  
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
            <CustomNode node={node} onClick={() => handleNodeClick(node.id)} />
          );
        }
      });
  
  
      node.on("click", (event, d) => {
        handleNodeClick(d.id)
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
    }, [graphData])
  
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
  
  const updateGraph = (data, sourceUrl) => {
    // Extract the article ID from the URL
    const urlParts = sourceUrl.split("/wiki/");
    const sourceId = urlParts[urlParts.length - 1];
  
    // Create the source node if it doesn't exist
    const sourceExists = graphData.nodes.some((node) => node.id === sourceId);
  
    const newNodes = [...graphData.nodes];
    const newLinks = [...graphData.links];
  
    if (!sourceExists) {
      newNodes.push({
        id: sourceId,
        title: data.title,
        url: sourceUrl,
        summary: data.summary,
        image: data.image,
        links: data.links || [],
      });
    }
  
    // Add a link between the selected node and the new node
    if (
      selectedNode && // Ensure selectedNode.links exists
      selectedNode.links.some((link) => link.url === (sourceUrl)) && // Check if the new node's ID exists in selectedNode.links
      !newLinks.some((link) => link.source === selectedNode.id && link.target === sourceId) // Avoid duplicate links
    ) {
      newLinks.push({
        source: selectedNode.id,
        target: sourceId,
      });
    }
  
    setGraphData({
      nodes: newNodes,
      links: newLinks,
    });
  };

  const exportGraph = () => {
    const dataStr = JSON.stringify(graphData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "wikipedia-graph.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }


  const importGraph = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        setGraphData(data)
      } catch (error) {
        setError("Invalid file format. Please upload a valid JSON file.")
      }
    }
    reader.readAsText(file)
  }

  const handleFileChange = (event) => {
      const file = event.target.files[0]
      if (file) {
          importGraph(file)
      }
  }

  const handleFileUpload = () => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".json"
      input.onchange = handleFileChange
      input.click()
  }

  const handleFileImport = () => {
      handleFileUpload()
  }



  const handleCarouselNodeClick = async (nodeId) => {
    const node = graphData.nodes.find((n) => n.id === nodeId)
    setSearchTerm(node.title)

  }

  const deselectNode = () => {
    setSelectedNode(null)
  }

  const handleLinkClick = async (link) => {
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: link.url }),
      })
      const data = await response.json()

      updateGraph(data, link.url)

    } catch (error) {
      console.error("Error fetching article data:", error);
    }
  };


  return (
    <div>
      <div className="fixed top-4 left-4 z-10">
        {selectedNode && <SelectedNode node={selectedNode} handleLinkClick={handleLinkClick} deselectNode={deselectNode} graphData={graphData}/>}
      </div>
      <div className="fixed top-4 right-4 z-10">
        <div className="flex flex-row justify-end gap-1 w-[380px]">
          {isSettingsPopupOpen && (
            <ul className="flex flex-row gap-1 justify-center items-center bg-white border rounded-full z-20 h-[30px] px-4 py-2">
                <li className="cursor-pointer hover:text-teal-600 text-xs" onClick={handleFileImport}>Import</li>
                <li className="cursor-pointer hover:text-teal-600 text-xs" onClick={exportGraph}>Export</li>
            </ul>
            )}
          <Button onClick={() => setIsSettingsPopupOpen((prev) => !prev)} variant="outline" className="rounded-full h-[30px] px-4 py-2 text-xs">Settings</Button>
        </div>
      
      </div>
      <Toolbar setGraphData={setGraphData}>
        <Carousel className="w-[300px]" opts={{ slidesToScroll: 4, slidesToShow: 8 }}>
          <CarouselContent>
            {graphData.nodes.map((node) => (
              <CarouselItem key={node.id} className="w-[20px] h-[30px]">
                <CustomNode
                  node={node}
                  onClick={() => handleCarouselNodeClick(node.id)}
                  isCarouselNode={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="flex flex-row gap-3 p-1 text-xs w-[480px]">
          <label className="flex flex-col mb-1">
            <span className="mb-1">Repulsion</span>
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
          <label className="flex flex-col mb-1">
            <span className="mb-1">Reach</span>
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
          <label className="flex flex-col mb-1">
            <span className="mb-1">X-Force</span>
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
          <label className="flex flex-col mb-1">
            <span className="mb-1">Y-Force</span>
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

      </Toolbar>
      {graphData.nodes.length > 0 && (
                <div className="absolute bottom-[4.5vw] left-1/2 -translate-x-1/2 w-full md:w-64 z-40">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search nodes..."
                  className="pl-8 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
        )}

      <div className="fixed inset-0 w-full h-full border overflow-hidden">
        {graphData.nodes.length > 0 ? (
          <div className="relative w-full h-full">
            <svg ref={svgRef} width="100%" height="100%" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p>No graph data available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

