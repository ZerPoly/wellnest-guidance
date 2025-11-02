'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AgendaForm } from '../types/agenda.types';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdropClick?: boolean;
  title?: string;
  submitText?: string;
  agendaOptions?: string[];
  onSave: (formData: AgendaForm & { startTime: string; endTime: string }) => void;
  initialData?: AgendaForm;
}

export default function AgendaModal({
  isOpen,
  onClose,
  size = "md",
  closeOnBackdropClick = true,
  title = "New Agenda",
  submitText = "Create Agenda",
  agendaOptions = ["Counseling", "Routine Interview"],
  onSave,
  initialData,
}: AgendaModalProps) {
  const [formData, setFormData] = useState<AgendaForm>({
    title: "",
    date: "",
    type: agendaOptions[0],
    startTime: "09:00",
    endTime: "10:00",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  // FIX: Calculate the MINIMUM available date (7 days from today)
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() + 7); // Set min date to 7 days from today

  // Format for input[type="date"] min attribute (YYYY-MM-DD)
  const minDateString = minDate.toISOString().split('T')[0];
  // REMOVED: maxDate and maxDateString

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          title: "",
          date: "", // Date will be empty, forcing user to pick
          type: agendaOptions[0],
          startTime: "09:00",
          endTime: "10:00",
        });
        setValidationError(null);
      }
    }
  // FIX: Removed 'agendaOptions' from dependency array to prevent infinite loop
  }, [isOpen, initialData]); 

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const handleTypeChange = (type: string) => {
    setFormData((prev) => ({ ...prev, type }));
    setValidationError(null);
  };

  const handleValidationAndSave = () => {
    const { title, date, startTime, endTime } = formData;

    if (!title || !date || !startTime || !endTime) {
      setValidationError("Please fill in the title, date, start time, and end time.");
      return;
    }

    // FIX: Updated validation logic to check for 7-day minimum notice
    const [year, month, day] = date.split('-').map(Number);
    // Note: new Date(y, m-1, d) creates a date in local time at 00:00
    const selectedDate = new Date(year, month - 1, day); 
    
    const minDateCheck = new Date();
    minDateCheck.setHours(0, 0, 0, 0); // Start of today
    minDateCheck.setDate(minDateCheck.getDate() + 7); // Set to 7 days from now (e.g., Nov 2 -> Nov 9)

    if (selectedDate < minDateCheck) {
      setValidationError("Date must be at least 1 week (7 days) in advance.");
      return;
    }
    // REMOVED: maxDateCheck and the associated validation

    if (startTime >= endTime) {
      setValidationError("End time must be after start time.");
      return;
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur transition-all duration-300"
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />
      
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-[#460F9D]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors rounded-full"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {validationError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded">
            <p className="text-sm text-red-700 font-medium">{validationError}</p>
          </div>
        )}

        <form 
          className="space-y-4" 
          onSubmit={(e) => { 
            e.preventDefault(); 
            handleValidationAndSave(); 
          }}
        >
          <div>
            <label className="block text-[#46484E] mb-1 font-bold text-base">
              Agenda Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter Agenda Title"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#46484E] mb-1 font-bold text-base">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={minDateString} // FIX: Set min attribute
              // REMOVED: max attribute
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[#46484E] mb-1 font-bold text-base">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                min="08:00"
                max="17:00"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#46484E] mb-1 font-bold text-base">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                min="08:00"
                max="17:00"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#46484E] mb-1 font-bold text-base">
              What's your Agenda?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {agendaOptions.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  // FIX: Corrected typo in className
                  className={`py-2 rounded-xl font-medium transition-colors ${
                    formData.type === type
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
          >
            {submitText}
          </button>
        </form>
      </div>
    </div>
  );
}

