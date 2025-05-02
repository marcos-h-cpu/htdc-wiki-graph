import React, { useState } from "react";


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
    <div className="flex flex-row items-center justify-between w-full overflow-hidden">

        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="p-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <div className="flex overflow-x-auto gap-0 p-0 h-[full]">
        {paginatedChildren}
      </div>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="p-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
    </div>
  );
}