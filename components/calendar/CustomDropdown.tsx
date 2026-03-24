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
        className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:bg-[var(--card-dark)] transition"
      >
        <span className="font-semibold text-[var(--foreground)]">
          {options.find(opt => opt.value === value)?.label}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-[var(--foreground-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      
      {isOpen && (
        <>
          {/* Background overlay for click-away logic */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* - Changed bg-white to var(--card)
            - Changed border-gray-200 to var(--line)
            - Added overflow-hidden to ensure rounded corners on hover
            - Added custom-scrollbar class
          */}
          <div className="absolute top-full mt-2 bg-[var(--card)] border border-[var(--line)] rounded-xl shadow-lg z-20 max-h-60 overflow-hidden w-32 flex flex-col">
            <div className="overflow-y-auto custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => { 
                    onChange(option.value); 
                    setIsOpen(false); 
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-[var(--card-dark)] transition ${
                    value === option.value 
                      ? 'bg-[var(--card-dark)] text-[var(--button)] font-bold' 
                      : 'text-[var(--foreground)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}