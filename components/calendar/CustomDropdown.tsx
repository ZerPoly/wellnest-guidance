'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomDropdownProps {
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  label: string;
}

export default function CustomDropdown({ 
  value, 
  options, 
  onChange, 
  label 
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <span className="font-semibold text-gray-700">
          {options.find(opt => opt.value === value)?.label}
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto w-32">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => { 
                  onChange(option.value); 
                  setIsOpen(false); 
                }}
                className={`w-full text-left px-4 py-2 hover:bg-purple-50 transition ${
                  value === option.value 
                    ? 'bg-purple-100 text-purple-700 font-semibold' 
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}