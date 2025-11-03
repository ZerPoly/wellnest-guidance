'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { Student } from '@/lib/api/appointments/students';

interface CounselorAgendaForm {
  date: string;
  type: 'counseling' | 'routine_interview';
  startTime: string;
  endTime: string;
  studentId: string;
}

interface CounselorAgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CounselorAgendaForm) => void;
  initialData?: CounselorAgendaForm | null;
  students: Student[];
  title?: string;
  submitText?: string;
}

const START_TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00",
];

const formatDisplayTime = (time24: string): string => {
  const [hour, minute] = time24.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const addOneHour = (time: string): string => {
  const [hour, minute] = time.split(':').map(Number);
  const newHour = hour + 1;
  return `${String(newHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export default function CounselorAgendaModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  students,
  title = "Schedule Consultation",
  submitText = "Save",
}: CounselorAgendaModalProps) {
  const [formData, setFormData] = useState<CounselorAgendaForm>({
    date: "",
    type: "counseling",
    startTime: "08:00",
    endTime: "09:00",
    studentId: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 7);
  const minDateString = minDate.toISOString().split("T")[0];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...initialData });
      } else {
        setFormData({
          date: "",
          type: "counseling",
          startTime: "08:00",
          endTime: "09:00",
          studentId: "",
        });
      }
      setValidationError(null);
      setSearchQuery("");
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "startTime") {
        return {
          ...prev,
          startTime: value,
          endTime: addOneHour(value),
        };
      }
      return { ...prev, [name]: value };
    });
    setValidationError(null);
  };

  const handleValidationAndSave = () => {
    const { date, startTime, endTime, studentId } = formData;

    if (!studentId || !date || !startTime || !endTime) {
      setValidationError("Please select a student, date, and time.");
      return;
    }

    const [year, month, day] = date.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const minDateCheck = new Date();
    minDateCheck.setDate(minDateCheck.getDate() + 7);
    minDateCheck.setHours(0, 0, 0, 0);

    if (selectedDate < minDateCheck) {
      setValidationError("Date must be at least 1 week (7 days) in advance.");
      return;
    }

    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    if (toMinutes(endTime) <= toMinutes(startTime)) {
      setValidationError("End time must be after start time.");
      return;
    }

    onSave(formData);
    onClose();
  };

  const filteredStudents = students.filter(student =>
    // ⬇️ MODIFIED LINES ⬇️
    (student?.user_name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
    (student?.email?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
    // ⬆️ END MODIFIED LINES ⬆️
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-[#460F9D]">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 transition-colors rounded-full"
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
          {/* Student Selection with Search */}
          <div>
            <label className="block text-[#46484E] mb-1 font-bold text-base">
              Select Student *
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search student by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-400"
              />
            </div>
            <div className="relative">
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 appearance-none pr-10 bg-white max-h-40"
              >
                <option value="">-- Choose a student --</option>
                {filteredStudents.map((student) => (
                  <option key={student.user_id} value={student.user_id}>
                    {student.user_name} ({student.email})
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500"
                size={20}
              />
            </div>
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-[#46484E] mb-1 font-bold text-base">
              Session Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'counseling' }))}
                className={`py-2 rounded-xl font-medium transition-colors ${
                  formData.type === 'counseling'
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Counseling
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'routine_interview' }))}
                className={`py-2 rounded-xl font-medium transition-colors ${
                  formData.type === 'routine_interview'
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Routine Interview
              </button>
            </div>
          </div>

          {/* Date */}
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
              min={minDateString}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 7 days in advance
            </p>
          </div>

          {/* Time */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[#46484E] mb-1 font-bold text-base">
                Start Time
              </label>
              <select
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-400 appearance-none bg-white"
              >
                {START_TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {formatDisplayTime(time)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[#46484E] mb-1 font-bold text-base">
                End Time
              </label>
              <input
                type="text"
                name="endTime"
                value={formatDisplayTime(formData.endTime)}
                readOnly
                className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-100 cursor-not-allowed text-gray-700"
              />
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