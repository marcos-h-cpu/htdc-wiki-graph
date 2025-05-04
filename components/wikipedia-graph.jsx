"use client"

import { useState } from "react"
import { ForceGraph } from "@/components/force-graph"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import SelectedNode from "@/components/selected-node"
import Toolbar from "@/components/toolbar"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import CustomNode from "@/components/custom-node"


export default function WikipediaGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNode, setSelectedNode] = useState(null)

 
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

  const handleNodeClick = async (nodeId) => {
    const node = graphData.nodes.find((n) => n.id === nodeId)
    if (!node) return
    setSelectedNode(node)
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

  return (
    <div>
      <Toolbar updateGraph={updateGraph} setGraphData={setGraphData}>
        <Carousel opts={{ slidesToScroll: 4, slidesToShow: 8 }}>
          <CarouselContent>
            {graphData.nodes.map((node) => (
              <CarouselItem key={node.id} className="w-[20px] h-[30px]">
                <CustomNode
                  node={node}
                  onClick={() => handleNodeClick(node.id)}
                  isCarouselNode={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </Toolbar>
      <div className="fixed top-4 left-4 z-10">
      {selectedNode && <SelectedNode node={selectedNode} handleLinkClick={handleLinkClick} deselectNode={deselectNode}/>}
      </div>
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
          <ForceGraph data={filteredData} onNodeClick={handleNodeClick} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p>No graph data available.</p>
          </div>
        )}
      </div>
    </div>
  )
}

