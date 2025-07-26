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

      <div className="flex flex-row justify-between items-center py-[5px] px-[16px] w-full">
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
              <ul className={`!rounded-full !bg-white border !h-[24px] flex flex-col overflow-y-auto ${styles.scroll}`}>
                {searchResults.map((result) => (
                  <li
                    key={result.pageid}
                    className="cursor-pointer text-xs w-[250px] h-[24px] rounded-full flex px-3 py-1"
                    onClick={() => handleSelectResult(result)}
                  >
                   <span className={styles.searchResult}
                   >{result.title}</span>
                  </li>
                ))}
              </ul>
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