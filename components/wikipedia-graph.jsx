"use client"

import { useState } from "react"
import { ForceGraph } from "@/components/force-graph"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import CustomNode from "@/components/custom-node"
import SelectedNode from "@/components/selected-node"

export default function WikipediaGraph() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false)

  const isValidWikipediaUrl = (url) => {
    return url.startsWith("https://en.wikipedia.org/wiki/") || url.startsWith("https://wikipedia.org/wiki/")
  }

  const fetchArticleData = async (articleUrl) => {
    if (!isValidWikipediaUrl(articleUrl)) {
      setError("Please enter a valid URL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: articleUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch article data")
      }

      const data = await response.json()
      console.log(data)

      // Update graph with new data
      updateGraph(data, articleUrl)
    } catch (err) {
      setError("Error fetching article data. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

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

  const updateNode = (nodeId, newProperties) => {
    setGraphData((prevData) => {
      const updatedNodes = prevData.nodes.map((node) =>
        node.id === nodeId ? { ...node, ...newProperties } : node
      )
      return { ...prevData, nodes: updatedNodes }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url) {
      fetchArticleData(url)
    }
  }

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


  return (
    <div>
      <div className="fixed top-4 left-4 z-10">
      {selectedNode && <SelectedNode node={selectedNode} handleLinkClick={handleLinkClick} deselectNode={deselectNode}/>}
      </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 p-4 justify-center items-center w-full">
              {graphData.nodes.length > 0 && (
                <div className="relative w-full md:w-64">
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
          <div className="flex flex-row justify-between items-center bg-gray-100 rounded-full border py-[8px] px-[36px] w-full">
          <CardContent className="flex flex-col gap-2 p-0">
            <form onSubmit={handleSubmit} className="flex flex-row gap-1 text-xs">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter Wikipedia URL"
                  className="w-[300px] h-[30px] rounded-full px-5 text-[6px]"
                />
              <Button type="submit" disabled={isLoading} className="h-[30px] rounded-full px-4 py-2 text-xs">
                {isLoading ? "Scraping..." : "Scrape"}
              </Button>
            </form>
            {error && (
              <Alert variant="destructive" className="flex justify-between items-center w-[270px]">
                <AlertDescription>{error}</AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-4 text-red-500"
                >
                  Close
                </Button>
              </Alert>
            )}
          </CardContent>
            <Button onClick={() => setIsSettingsPopupOpen((prev) => !prev)} variant="outline" className="rounded-full h-[30px] px-4 py-2 text-xs">
              File
            </Button>
            <div className="absolute bottom-[70px] right-[53px] flex flex-row gap-1">
              {isSettingsPopupOpen && (
                <div className="bg-white border border-gray-300 rounded-md p-2 z-20">
                  <ul className="flex flex-col gap-1">
                    <li className="cursor-pointer hover:text-blue-500 text-xs" onClick={handleFileImport}>Import</li>
                    <li className="cursor-pointer hover:text-blue-500 text-xs" onClick={exportGraph}>Export</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

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

