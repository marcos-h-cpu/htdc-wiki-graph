import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import React from "react";
import styles from "./toolbar.module.css";

export default function Toolbar({ fetchArticleData, updateGraph, ...props }) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (query) {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch search results from Wikipedia API
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
          query
        )}&format=json&origin=*`;
        const response = await fetch(searchUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();
        setSearchResults(data.query.search || []);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError("Failed to fetch search results. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectResult = async (selectedResult) => {
    try {
      setIsLoading(true);
      const articleUrl = `https://en.wikipedia.org/wiki/${selectedResult.title.replace(/ /g, "_")}`;
      const articleData = await fetchArticleData(articleUrl);
      updateGraph(articleData, articleData.url);
      setSearchResults([]); // Clear search results after selection
      setQuery(""); // Clear the search input
    } catch (err) {
      console.error("Error fetching article data:", err);
      setError("Failed to fetch article data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <div className="flex flex-row justify-between items-center bg-gray-100 rounded-full border py-[5px] px-[32px] backdrop-blur-md bg-opacity-50 w-full">
        <CardContent className="flex flex-col gap-2 p-0 w-1/4">
          {searchResults.length === 0 && (
            <form onSubmit={handleSearch} className="flex flex-row gap-1 items-center">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a starting point..."
                className={`h-[24px] w-[250px] rounded-full px-3 !text-xs ${error ? "border-red-500" : "border"}`}
              />
              <Button type="submit" disabled={isLoading} className="h-[24px] w-[24px] rounded-full px-2 py-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </form>
          )}
          {searchResults.length > 0 && (
            <div className="flex flex-row gap-1 items-center">
            <div className={`border bg-white h-[24px] rounded-full flex flex-row justify-between`}>
              <ul className={`overflow-y-auto ${styles.scroll}`}>
                {searchResults.map((result) => (
                  <li
                    key={result.pageid}
                    className="cursor-pointer hover:bg-green-100 text-xs w-[200px] h-[24px] rounded-full flex px-3 py-1"
                    onClick={() => handleSelectResult(result)}
                  >
                    {result.title}
                  </li>
                ))}
              </ul>
              <span className="px-2 pt-2 text-gray-500 text-[8px] h-[24px] w-[50px] text-right">{searchResults.length} results</span>
            </div>
            <Button onClick={() => setSearchResults([])} className="h-[24px] w-[24px] rounded-full px-2 py-1">
              <img
                src="/refresh-svgrepo-com.svg"
                alt="Refresh Search"
                style={{
                  filter: "invert(100%) sepia(100%) saturate(100%) hue-rotate(120deg)"
                }}
              />
            </Button>
            </div>
          )}

        </CardContent>
        {React.Children.map(props.children, (child, index) => (
          <div key={index} className="w-1/4">
            {child}
          </div>
        ))}
      </div>
    </>
  );
}