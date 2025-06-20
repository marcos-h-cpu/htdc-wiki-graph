import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import React from "react";

export default function Toolbar({fetchArticleData, ...props}) {
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)


    const handleSubmit = (e) => {
        e.preventDefault()
        if (url) {
          fetchArticleData(url)
        }
    }

    return (
        <>
        
          <div className="flex flex-row justify-between items-center bg-gray-100 rounded-full border py-[5px] px-[32px] backdrop-blur-md bg-opacity-50 w-full">
          <CardContent className="flex flex-col gap-2 p-0 w-1/4">
            <form onSubmit={handleSubmit} className="flex flex-row gap-1 items-center text-xs">
                <Input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter Wikipedia URL"
                  className={`h-[24px] w-[200px] rounded-full px-5 !text-xs ${error ? "border-red-500" : "border"}`}
                />
              <Button type="submit" disabled={isLoading} className="h-[24px] rounded-full px-2 py-1 text-xs">
                Scrape
              </Button>
            </form>
          </CardContent>
          {React.Children.map(props.children, (child, index) => (
            <div key={index} className="w-1/4">
              {child}
            </div>
          ))}
          </div>
        
        </>
    )
}