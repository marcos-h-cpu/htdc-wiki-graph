"use client"

import { useState } from "react"
import { ForceGraph } from "@/components/force-graph"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import CustomNode from "@/components/custom-node"
import styles from "./wikipedia-graph.module.css"

export default function WikipediaGraph() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [graphData, setGraphData] = useState({ nodes: [], links: [] })
  const [searchTerm, setSearchTerm] = useState("")

  const isValidWikipediaUrl = (url) => {
    return url.startsWith("https://en.wikipedia.org/wiki/") || url.startsWith("https://wikipedia.org/wiki/")
  }

  const fetchArticleData = async (articleUrl) => {
    if (!isValidWikipediaUrl(articleUrl)) {
      setError("Please enter a valid Wikipedia URL (e.g., https://en.wikipedia.org/wiki/Article_Name)")
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
    const urlParts = sourceUrl.split("/wiki/")
    const sourceId = urlParts[urlParts.length - 1]

    // Create the source node if it doesn't exist
    const sourceExists = graphData.nodes.some((node) => node.id === sourceId)

    const newNodes = [...graphData.nodes]
    const newLinks = [...graphData.links]

    if (!sourceExists) {
      newNodes.push({
        id: sourceId,
        title: data.title,
        url: sourceUrl,
        summary: data.summary,
        image: data.image,
      })
    }

    // Add new nodes and links
    data.links.forEach((link) => {
      const targetId = link.url.split("/wiki/")[1]

      // Add target node if it doesn't exist
      if (!newNodes.some((node) => node.id === targetId)) {
        newNodes.push({
          id: targetId,
          title: link.title,
          url: link.url,
          summary: "",
        })
      }

      // Add link if it doesn't exist
      if (!newLinks.some((l) => l.source === sourceId && l.target === targetId)) {
        newLinks.push({
          source: sourceId,
          target: targetId,
        })
      }
    })

    setGraphData({
      nodes: newNodes,
      links: newLinks,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url) {
      fetchArticleData(url)
    }
  }

  const handleNodeClick = (nodeId) => {
    const node = graphData.nodes.find((n) => n.id === nodeId)
    if (node) {
      fetchArticleData(node.url)
    }
  }

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

  return (
    <div className="w-full">
      <div className="absolute top-6 left-2 z-10 flex flex-row">
        <CardContent>
          <form onSubmit={handleSubmit} className="flex md:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter Wikipedia URL"
                className="w-96"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Scraping..." : "Scrape"}
            </Button>
          </form>
        </CardContent>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      </div>

      {graphData.nodes.length > 0 && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col gap-2 p-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search nodes..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={exportGraph} variant="outline">
            Export Graph
          </Button>
        </div>
      )}

      <div className="fixed inset-0 w-full h-full border overflow-hidden">
        {graphData.nodes.length > 0 ? (
          <ForceGraph data={filteredData} onNodeClick={handleNodeClick} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Disappear Completely
          </div>
        )}
      </div>
    </div>
  )
}

