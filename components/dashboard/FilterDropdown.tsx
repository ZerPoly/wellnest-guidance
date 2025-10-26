"use client";
import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";

interface FilterDropdownProps {
  label?: string; 
  options: string[]; 
  selected: string; 
  onChange: (value: string) => void; 
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label = "Filter",
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors ${
          selected !== "All" ? "text-teal-500" : "text-gray-700"
        }`}
      >
        {/* Display the selected option instead of the default label */}
        <span>{selected === "All" ? label : selected}</span>
        <FaFilter className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
          <ul className="py-1">
            {options.map((option) => (
              <li key={option}>
                <button
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    option === selected ? "text-teal-500 font-medium" : "text-gray-700"
                  }`}
                >
                  {option}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;