import React, { useState, useEffect } from "react";

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnBackdropClick?: boolean;
  title?: string;
  submitText?: string;
  agendaOptions?: string[];
}

export default function AgendaModal({
  isOpen,
  onClose,
  size = "md",
  closeOnBackdropClick = true,
  title = "New Agenda",
  submitText = "Create Agenda",
  agendaOptions = ["Counseling", "Routine Interview", "Meeting","Events"],
}: AgendaModalProps) {
  const [agendaType, setAgendaType] = useState("");

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 space-y-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur transition-all duration-300"
        style={{
          pointerEvents: "auto",
          cursor: closeOnBackdropClick ? "pointer" : "default",
        }}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal content */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-lg p-6`}
      >
        <h2 className="text-xl font-bold text-[#460F9D] mb-5">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[#46484E]mb-1 font-metropolis font-bold text-base">Agenda Title</label>
            <input
              type="text"
              placeholder="Enter Agenda Title"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#46484E]mb-1 font-metropolis font-bold text-base">Date</label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#46484E]mb-1 font-metropolis font-bold text-base">Time</label>
            <input
              type="time"
               min="08:00"
                max="16:00"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[#46484E]mb-1 font-metropolis font-bold text-base" >What’s your Agenda?</label>
            <div className="grid grid-cols-2 gap-3">
              {agendaOptions.map((type) => (
                <button
                  key={type}
                  onClick={() => setAgendaType(type)}
                  className={`py-2 rounded-xl font-medium ${
                    agendaType === type
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className="w-full mt-6 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition">
          {submitText}
        </button>
      </div>
    </div>
  );
}