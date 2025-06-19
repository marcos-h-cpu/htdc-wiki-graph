"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import * as d3 from "d3"
import ReactDOM from "react-dom/client";
import CustomNode from "@/components/custom-node"
import styles from "./wikipedia-graph.module.css"
import { Input } from "@/components/ui/input"
import SelectedNode from "@/components/selected-node"
import Toolbar from "@/components/toolbar"
import HoverHighlight from "@/components/hover-highlight"
import GraphDataRud from "@/components/graphdata-rud"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";



export default function WikipediaGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNode, setSelectedNode] = useState(null)
  const [isOptionsOpen, setIsOptionsOpen] = useState(false)
  const [graphDataMenuOpen, setGraphDataMenuOpen] = useState(false)
  const [highlightNode, setHighlightNode] = useState(null)
  const [linkHashMap, setLinkHashMap] = useState(new Map())
  const [linkOpacity, setLinkOpacity] = useState(0.5)
  const [colorHue, setColorHue] = useState(0)
  const [linkColor, setLinkColor] = useState("hsl(0 100% 50%)")
  const [repulsion, setRepulsion] = useState(500)
  const [linkDistance, setLinkDistance] = useState(20)
  const [linkCurve, setLinkCurve] = useState(.9)
  const [xForce, setXForce] = useState(0)
  const [yForce, setYForce] = useState(0)
  const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity)

  const filteredData = useMemo(() => {
    const filteredNodes = searchTerm
      ? graphData.nodes.filter((node) =>
          node.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : graphData.nodes;

    const filteredLinks = searchTerm
      ? graphData.links.filter((link) => {
          const sourceNode = graphData.nodes.find((n) => n.id === link.source);
          const targetNode = graphData.nodes.find((n) => n.id === link.target);
          return (
            sourceNode &&
            filteredNodes.includes(sourceNode) &&
            targetNode &&
            filteredNodes.includes(targetNode)
          );
        })
      : graphData.links;

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchTerm]);

  // Force graph simulation
  const svgRef = useRef(null)
  const simulationRef = useRef(null); // Store the simulation instance

  const handleNodeClick = async (nodeId) => {
    const node = graphData.nodes.find((n) => n.id === nodeId)
    if (!node) return
    setSelectedNode(node)
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
        .scaleExtent([0.01, 5])
        .on("zoom", (event) => {
          g.attr("transform", event.transform)
          setZoomTransform(event.transform);
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
            .distance(10),
        )
        .force("charge", d3.forceManyBody().strength(-500))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX(width / 2).strength(0))
        .force("y", d3.forceY(height / 2).strength(0))
  
      simulationRef.current = simulation; // Store the simulation in the ref
  
      // Create the links
      const link = g
        .append("g")
        .attr("stroke", "#006FFF")
        .attr("stroke-opacity", .5)
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
        .attr("x", (d) => d.x - 20) // Center the node horizontally
        .attr("y", (d) => d.y - 20) // Center the node vertically
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
            <CustomNode node={node} onClick={() => handleNodeClick(node.id)} setHighlightNode={setHighlightNode} />
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
    }, [filteredData])
  
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
      } else if (forceName === "linkOpacity") {
        const svg = d3.select(svgRef.current);
        svg.selectAll("path").attr("stroke-opacity", value);
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
        connectionType: "Child"
      });
    }

    for (const link of data.links) {
      if (!linkHashMap.has(link.title)) {
        linkHashMap.set(link.title, [sourceId])
      } else {
        if (linkHashMap.has(link.title)) {
          const existingLinks = linkHashMap.get(link.title)
          for (const existingLink of existingLinks) {
            if (!newLinks.some((l) => l.source === existingLink && l.target === sourceId)) {
              newLinks.push({
                source: existingLink,
                target: sourceId,
                connectionType: link.url
              })
              console.log("Link added:", existingLink, sourceId, link.url)
            }
          }
        }
      }
}
  
    setGraphData({
      nodes: newNodes,
      links: newLinks,
    });
  };

  const exportGraph = () => {
    const fileName = prompt("Enter a name for the export file:", "wikipedia-graph.json");
    if (!fileName) return; // Exit if the user cancels or doesn't provide a name

    const dataToExport = {
      graphData,
      linkHashMap: Array.from(linkHashMap.entries()), // Convert Map to array for JSON serialization
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = fileName.endsWith(".json") ? fileName : `${fileName}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  }


  const importGraph = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);

        // Validate and set graph data
        if (importedData.graphData) {
          setGraphData(importedData.graphData);
        }

        // Validate and set linkHashMap
        if (importedData.linkHashMap) {
          setLinkHashMap(new Map(importedData.linkHashMap)); // Convert array back to Map
        }
      } catch (error) {
        setError("Invalid file format. Please upload a valid JSON file.");
      }
    };
    reader.readAsText(file);
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
      rerenderGraph();

    } catch (error) {
      console.error("Error fetching article data:", error);
    }
  };

  useEffect(() => {
    if (graphData.nodes.length > 0 || graphData.links.length > 0) {
      rerenderGraph();
    }
  }, [graphData, linkCurve]);

  const rerenderGraph = () => {
    if (!svgRef.current || graphData.nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current).attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g");

    // Add zoom functionality
    const zoom = d3
      .zoom()
      .scaleExtent([0.01, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomTransform(event.transform);
      });

    svg.call(zoom);

    svg.call(zoom.transform, zoomTransform);

    const links = filteredData.links.map((d) => ({ ...d }));
    const nodes = filteredData.nodes.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(linkDistance)
      )
      .force("charge", d3.forceManyBody().strength(-repulsion))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX(width / 2).strength(xForce))
      .force("y", d3.forceY(height / 2).strength(yForce));

    simulationRef.current = simulation;

    const link = g
      .append("g")
      .attr("stroke", linkColor)
      .attr("stroke-opacity", linkOpacity)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke-width", 1);

    const node = g
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .join("foreignObject")
      .attr("class", "node")
      .attr("width", 80)
      .attr("height", 80)
      .attr("x", (d) => d.x - 20)
      .attr("y", (d) => d.y - 20)
      .html((d) => {
        return `<div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
                  <div id="node-${d.id}"></div>
                </div>`;
      })
      .call(drag(simulation)); // Apply drag functionality

    nodes.forEach((node) => {
      const container = document.getElementById(`node-${node.id}`);
      if (container) {
        const root = ReactDOM.createRoot(container);
        root.render(
          <CustomNode node={node} onClick={() => handleNodeClick(node.id)} setHighlightNode={setHighlightNode} />
        );
      }
    });

    simulation.on("tick", () => {
      
      link.attr("d", (d) => {
        const dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy) * linkCurve;

        return `M${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node
        .attr("x", (d) => d.x - 50)
        .attr("y", (d) => d.y - 50);
    });

    
  };

  // Drag functionality
  function drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  }

  return (
    <div>
      <div className="fixed top-4 left-4 z-10">
        {selectedNode && <SelectedNode node={selectedNode} handleLinkClick={handleLinkClick} deselectNode={deselectNode} graphData={graphData}/>}
      </div>
      <div className="fixed top-4 right-4 z-20 flex flex-col items-end">
          {isOptionsOpen && (
            <div className="bg-gray-100 bg-opacity-50 backdrop-blur-md rounded-md border w-[20vw]">
              <div className="flex flex-row justify-between items-center py-1 px-2">
                <span className="text-xs text-gray-900">Options</span>
                <Button
                    variant="ghost"
                    onClick={() => setIsOptionsOpen(false)}
                    className="h-[16px] !w-[16px] flex items-center justify-center !p-0"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-4 w-4 text-black-700" />
                </Button>
              </div>
              <ul className="flex flex-col gap-1 p-2 border-t text-gray-600">
                <li
                  className="cursor-pointer text-xs hover:text-gray-900"
                  onClick={handleFileImport}
                >
                  Import Graph
                </li>
                <li
                  className="cursor-pointer text-xs hover:text-gray-900"
                  onClick={exportGraph}
                >
                  Save
                </li>
                <li
                  className="cursor-pointer text-xs hover:text-gray-900"
                  onClick={rerenderGraph}
                >
                  Rerender Graph
                </li>
                <li
                  className="cursor-pointer text-xs hover:text-gray-900"
                  onClick={() => {
                    setGraphData({ nodes: [], links: [] })
                    setLinkHashMap(new Map())
                    setSelectedNode(null)
                    setSearchTerm("")
                  }}
                >
                  New Graph
                </li>
              </ul>
              <ul className="flex flex-col gap-1 p-2 border-t text-gray-600 text-xs">
                <li className="cursor-pointer hover:text-gray-900">
                  <label className="flex flex-row justify-start gap-1">
                    <span className="mb-0">Link Opacity</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step=".10"
                      defaultValue=".5"
                      onChange={(e) => {updateForce("linkOpacity", +e.target.value); setLinkOpacity(+e.target.value)}}
                      className={styles.rangeInput}
                    />
                  </label>
                </li>
                <li className="cursor-pointer hover:text-gray-900">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      rerenderGraph();
                    }}
                    className="flex flex-row justify-start gap-2 items-center"
                  >
                    <label className="flex flex-row items-center gap-1">
                      <span className="mb-0">Link Color</span>
                      <div style={{ backgroundColor: linkColor }}></div>
                      <input
                        type="range"
                        min="0"
                        max="275"
                        step="1"
                        value={colorHue}
                        onChange={(e) => {
                          const hue = e.target.value;
                          const newColor = `hsl(${hue}, 100%, 50%)`;
                          setColorHue(hue);
                          setLinkColor(newColor);
                        }}
                        className={styles.rainbowSlider}
                      />
                    </label>
                    <button
                      type="submit"
                      className="p-1 text-xs rounded-full bg-white hover:bg-gray-100 border"
                      aria-label="Apply"
                      style={{ backgroundColor: linkColor }}
                    >
                      <CheckIcon className={`h-2 w-2 text-white ${styles.blendIcon}`} />
                    </button>
                  </form>
                </li>
                <li>
                  <label className="flex flex-row justify-start gap-1 items-center">
                    <span className="mb-0">Link Curve:</span>
                    <div className="flex gap-1">
                      <button
                        className={`px-1 text-xs ${linkCurve === 100 ? "text-blue-500" : "hover:text-blue-900"}`}
                        onClick={() => setLinkCurve(100)}
                      >
                        Straight
                      </button>
                      <button
                        className={`px-1 text-xs ${linkCurve === 0.9 ? "text-blue-500" : "hover:text-blue-900"}`}
                        onClick={() => setLinkCurve(0.9)}
                      >
                        Curved
                      </button>
                      <button
                        className={`px-1 text-xs ${linkCurve === 0.1 ? "text-blue-500" : "hover:text-blue-900"}`}
                        onClick={() => setLinkCurve(0.1)}
                      >
                        Half Moon
                      </button>
                    </div>
                  </label>
                </li>
                <li className="cursor-pointer hover:text-gray-900">
                <label className="flex flex-row justify-start gap-1">
                  <span className="mb-0">Repulsion</span>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    defaultValue="500"
                    onChange={(e) => {updateForce("charge", -(+e.target.value)); setRepulsion(+e.target.value)}}
                    className={styles.rangeInput}
                  />
                </label>
                </li>
                <li className="cursor-pointer hover:text-gray-900">
                  <label className="flex flex-row justify-start gap-1">
                    <span className="mb-0">Reach</span>
                    <input
                      type="range"
                      min="0"
                      max="750"
                      step="50"
                      defaultValue="25"
                      onChange={(e) => {updateForce("linkDistance", +e.target.value); setLinkDistance(+e.target.value)}}
                      className={styles.rangeInput}
                    />
                  </label>
                </li>
                <li className="cursor-pointer hover:text-gray-900">
                  <label className="flex flex-row justify-start gap-1">
                    <span className="mb-0">X-Force</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step=".2"
                      defaultValue="0"
                      onChange={(e) => {updateForce("x", +e.target.value); setXForce(+e.target.value)}}
                      className={styles.rangeInput}
                    />
                  </label>
                </li>
                <li>
                <label className="flex flex-row justify-start gap-1">
                  <span className="mb-0">Y-Force</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step=".2"
                    defaultValue="0"
                    onChange={(e) => {updateForce("y", +e.target.value); setYForce(+e.target.value)}}
                    className={styles.rangeInput}
                  />
                </label>
                </li>
              </ul>
              <ul className="flex flex-col gap-1 p-2 border-t text-gray-600">
                <li
                  className="cursor-pointer text-xs hover:text-gray-900"
                  onClick={() => setGraphDataMenuOpen((prev) => !prev)}
                >
                  Edit Data
                </li>
              </ul>
            </div>
          )}
      </div>
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-10">
          <HoverHighlight node={highlightNode} />
      </div>

      {graphDataMenuOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <GraphDataRud graphData={graphData} setGraphDataMenuOpen={setGraphDataMenuOpen} setGraphData={setGraphData} />
        </div>
      )}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col gap-2 justify-between items-center w-[99vw] z-30 z-40">
      {graphData.nodes.length > 0 && (
                <Input
                  type="text"
                  placeholder="Search"
                  className="px-5 w-[200px] rounded-full !text-xs h-[24px] text-left"
                  value={searchTerm}
                  onChange={(e) => 
                    setSearchTerm(e.target.value)
                  }
                />
      )}
      <Toolbar setGraphData={setGraphData} updateGraph={updateGraph}>
        <Carousel opts={{ slidesToScroll: 4, slidesToShow: 8 }}>
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

        <div className="flex flex-row justify-end items-center gap-2 p-1 text-xs">
          <Button onClick={() => setIsOptionsOpen((prev) => !prev)} className="h-[24px] rounded-full px-2 py-1 text-xs text-gray-700 border bg-gray-0 hover:bg-gray-300">
            Options
          </Button>
        </div>

      </Toolbar>
      </div>


      <div className="fixed inset-0 w-full h-full border overflow-hidden">
        {graphData.nodes.length > 0 ? (
          <div className="relative w-full h-full">
            <svg ref={svgRef} width="100%" height="100%" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p className="text-xs">No graph data available.</p>
          </div>
        )}
      </div>

    </div>
  )
}

