import React, { useState } from "react";
import Image from "next/image";


export default function NodeCarousel({ children }) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const childrenArray = React.Children.toArray(children);
  const totalPages = Math.ceil(childrenArray.length / itemsPerPage);

  const paginatedChildren = childrenArray.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center w-full overflow-hidden">

        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="p-1 opacity-60 disabled:opacity-0 hover:opacity-25"
        >
          <Image 
            src="/Arrow.svg" 
            alt="Previous Page" 
            width={20} 
            height={20} 
            className="h-4 w-4 transform rotate-180"
          />
        </button>
        <div className="flex overflow-x-auto gap-0 p-0 h-[full]">
          {paginatedChildren}
        </div>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="p-1 opacity-60 disabled:opacity-0 hover:opacity-25"
        >
          <Image 
            src="/Arrow.svg" 
            alt="Next Page" 
            width={20} 
            height={20} 
            className="h-4 w-4"
          />
        </button>
    </div>
  );
}