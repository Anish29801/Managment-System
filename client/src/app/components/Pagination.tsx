"use client";

import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center mt-6 gap-2">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
      >
        <FaChevronLeft />
      </button>

      <span className="px-3 py-1 bg-gray-800 rounded-md">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};
