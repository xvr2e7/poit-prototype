import React from "react";
import { Search, Filter, TrendingUp, Calendar, Star } from "lucide-react";

const SearchControls = ({ filterBy, searchTerm, onSearch, onFilterChange }) => {
  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search poems..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <button
            onClick={() => onFilterChange("trending")}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              filterBy === "trending"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => onFilterChange("recent")}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              filterBy === "recent"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Recent</span>
          </button>
          <button
            onClick={() => onFilterChange("popular")}
            className={`px-3 py-1 rounded-lg flex items-center space-x-1 ${
              filterBy === "popular"
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            <Star className="h-4 w-4" />
            <span>Popular</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchControls;
