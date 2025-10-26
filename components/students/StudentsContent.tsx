'use client';

import React, { useState } from "react";
import { Filter } from "lucide-react";
import { students, type Student } from "../../data/data";
import Modal from "../Modal";
import PasswordInput from "./PasswordInput"; 


// Helper function to partially hide email
const maskEmail = (email: string) => {
  const [localPart, domain] = email.split("@");
  return localPart.length > 4
    ? `${localPart.substring(0, 4)}***@${domain}`
    : `${localPart.substring(0, 1)}***@${domain}`;
};

// Avatar Component
const StudentAvatar: React.FC<{ status: Student["status"] }> = ({ status }) => {
  const isFlagged = status === "In-Crisis" || status === "Struggling";
  const bgColor = isFlagged ? "bg-[#460F9D]" : "bg-[#03BFBF]";
  const iconColor = isFlagged ? "text-orange-100" : "text-teal-100";

  return (
    <div
      className={`w-40 h-40 rounded-full flex items-center justify-center mb-4 shadow-inner ${bgColor}`}
    >
      <img
        src="/img/student.png"
        alt="Student Icon"
        className={`w-40 h-40 ${iconColor}`}
      />
    </div>
  );
};

// Main StudentsContent Component
const StudentsContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handlePasswordSubmit = () => {
    if (password === "1234") {
      alert(`Access granted for ${selectedStudent?.name}`);
      setIsModalOpen(false);
      setPassword("");
    } else {
      alert("Incorrect password");
    }
  };

  const filterOptions = ["All", "In-Crisis", "Struggling", "Excelling", "Thriving"];

  const filteredStudents = students
    .filter((student) =>
      statusFilter === "All" ? true : student.status === statusFilter
    )
    .filter(
      (student) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const renderStatusText = (status: Student["status"]) => {
    const color =
      status === "Excelling" || status === "Thriving"
        ? "text-green-600"
        : status === "Struggling" || status === "In-Crisis"
        ? "text-red-600"
        : "text-gray-600";
    return (
      <span className={`${color} font-semibold font-metropolis`}>{status}</span>
    );
  };

  return (
    <div className="p-8 bg-gray-100 text-gray-800 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-md text-[#46484E]">Students / Classification</p>
          <h2 className="text-4xl font-bold text-[#00CCCC]">Classification</h2>
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm ${
              statusFilter !== "All" ? "text-teal-600" : "text-gray-700"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          {showFilter && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
              <ul className="py-1">
                {filterOptions.map((option) => (
                  <li key={option}>
                    <button
                      onClick={() => {
                        setStatusFilter(option);
                        setShowFilter(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {option}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.id}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105 hover:shadow-lg"
            >
              <StudentAvatar status={student.status} />
              <p className="font-bold text-lg text-gray-800">
                {maskEmail(student.email)}
              </p>
              <div className="mt-1 mb-4">{renderStatusText(student.status)}</div>
              <button
                onClick={() => {
                  setSelectedStudent(student);
                  setIsModalOpen(true);
                }}
                className="w-full bg-[#03BFBF] hover:bg-[#02A4A4] text-white font-semibold py-3 px-4 rounded-full transition-all shadow"
              >
                View
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No matching students found.</p>
          </div>
        )}
      </div>

      {/* Password Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Password Required"
         
    
      >
        <div className="-mt-6 space-y-6">
          <p className="text-gray-700 text-base font-metropolis mt-2">
            To view Students’ information, please enter your password.
          </p>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-[#460F9D] hover:bg-[#02A4A4] text-white font-semibold py-2 px-4 mb-5 rounded-full"
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentsContent;