
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Carousel } from "./ui/carousel";
import { useState } from "react";
import React from "react";

export default function Toolbar(props) {
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSettingsPopupOpen, setIsSettingsPopupOpen] = useState(false)

    const {updateGraph, setGraphData, exportGraph} = props


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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (url) {
          fetchArticleData(url)
        }
    }



    return (
        <>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-3 flex flex-col gap-2 justify-end items-end w-[99vw] z-30">
          <div className="flex flex-row justify-between items-center bg-gray-100 rounded-full border py-[8px] px-[36px] w-full backdrop-blur-md bg-opacity-50">
          <CardContent className="flex flex-col gap-2 p-0 w-[480px]">
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
          {React.Children.map(props.children, (child, index) => (
            <div key={index} className="child-container">
              {child}
            </div>
          ))}
          </div>
        </div>
        </>
    )
}