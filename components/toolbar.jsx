
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Carousel } from "./ui/carousel";
import { useState } from "react";

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
        <>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-3 flex flex-col gap-2 justify-end items-end w-[99vw] z-30">
          <div className="flex flex-row justify-between items-center bg-gray-100 rounded-full border py-[8px] px-[36px] w-full backdrop-blur-md bg-opacity-50">
          <CardContent className="flex flex-col gap-2 p-0 w-[380px]">
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
          <div className="w-[380px]">
            {props.children}
          </div>

          <div className="flex flex-row justify-end gap-1 w-[380px]">
            {isSettingsPopupOpen && (
                    <ul className="flex flex-row gap-1 justify-center items-center bg-white border rounded-full z-20 h-[30px] px-4 py-2">
                        <li className="cursor-pointer hover:text-teal-600 text-xs" onClick={handleFileImport}>Import</li>
                        <li className="cursor-pointer hover:text-teal-600 text-xs" onClick={exportGraph}>Export</li>
                    </ul>
                )}
            <Button onClick={() => setIsSettingsPopupOpen((prev) => !prev)} variant="outline" className="rounded-full h-[30px] px-4 py-2 text-xs">File</Button>
          </div>
          </div>
        </div>
        </>
    )
}