"use client";

import React, { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import Modal from "../Modal";
import PasswordInput from "./PasswordInput";
import { 
  StudentClassification, 
  ClassificationType 
} from "@/lib/api/studentClassification";

// Helper function to partially hide email
const maskEmail = (email: string, revealed: boolean) => {
  if (revealed) return email;
  const [localPart, domain] = email.split("@");
  return localPart.length > 4
    ? `${localPart.substring(0, 4)}***@${domain}`
    : `${localPart.substring(0, 1)}***@${domain}`;
};

// Avatar Component
const StudentAvatar: React.FC<{ classification: ClassificationType }> = ({ classification }) => {
  const isFlagged = classification === "InCrisis" || classification === "Struggling";
  const bgColor = isFlagged ? "bg-[#460F9D]" : "bg-[#03BFBF]";
  const iconColor = isFlagged ? "text-orange-100" : "text-teal-100";

  return (
    <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-4 shadow-inner ${bgColor}`}>
      <img src="/img/student.png" alt="Student Icon" className={`w-40 h-40 ${iconColor}`} />
    </div>
  );
};

// Function to generate email templates dynamically
const getEmailTemplate = (student: StudentClassification) => {
  switch (student.classification) {
    case "InCrisis":
      return {
        subject: "Do Not Reply To This Email",
        body: `Hello,\n\nWe wanted to check if you're facing some challenges. Please know that the CGCS office is here to support and help you. Schedule a visit if you have time\n\nWarm regards,\nCenter for Guidance and Counseling Services`
      };
    case "Struggling":
      return {
        subject: "Do Not Reply To This Email",
        body: `Hi,\n\nWe wanted to check how you're doing. Remember, CGCS is always available to you.\n\nTake care,\nCenter for Guidance and Counseling Services`
      };
    default:
      return {
        subject: "Hello from the Guidance Office",
        body: `Hi,\n\nJust checking in to see how things are going. Don't hesitate to reach out if you need any assistance.\n\nWarm regards,\nCenter for Guidance and Counseling Services`
      };
  }
};

// Main StudentsContent Component
const StudentsContent: React.FC = () => {
  const [students, setStudents] = useState<StudentClassification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentClassification | null>(null);
  const [revealedStudents, setRevealedStudents] = useState<string[]>([]);

  // Fetch students from API
  const fetchStudents = async (cursor?: string, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      
      setError(null);

      const params = new URLSearchParams();
      
      // Map UI filter to API classification
      if (statusFilter !== "All") {
        params.append('classification', statusFilter);
      }
      
      params.append('limit', '50'); // Fetch more for card view
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/students?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch students');
      }

      if (append) {
        setStudents(prev => [...prev, ...(data.data?.classifications || [])]);
      } else {
        setStudents(data.data?.classifications || []);
      }
      
      setHasMore(data.data?.hasMore || false);
      setNextCursor(data.data?.nextCursor || null);
      
      setLoading(false);
      setIsLoadingMore(false);
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message);
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handlePasswordSubmit = () => {
    if (password === "1234" && selectedStudent) {
      setRevealedStudents((prev) => [...prev, selectedStudent.student_id]);
      setIsModalOpen(false);
      setPassword("");
    } else {
      alert("Incorrect password");
    }
  };

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore) {
      fetchStudents(nextCursor, true);
    }
  };

  const filterOptions = ["All", "Excelling", "Thriving", "Struggling", "InCrisis"];

  // Client-side search filter
  const filteredStudents = students.filter(
    (student) =>
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatusText = (classification: ClassificationType) => {
    const color =
      classification === "Excelling" || classification === "Thriving"
        ? "text-green-600"
        : classification === "Struggling" || classification === "InCrisis"
        ? "text-red-600"
        : "text-gray-600";
    
    // Format display text
    const displayText = classification === "InCrisis" ? "In-Crisis" : classification;
    
    return <span className={`${color} font-semibold font-metropolis`}>{displayText}</span>;
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03BFBF] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading students...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-gray-100">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Unable to Load Students</h3>
              <p className="mt-2 text-sm text-red-700">{error}</p>
              <button
                onClick={() => fetchStudents()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                      {option === "InCrisis" ? "In-Crisis" : option}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by email or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03BFBF] focus:border-transparent"
        />
      </div>

      {/* Student Count */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          <span className="font-bold text-gray-800">{filteredStudents.length}</span> students found
        </p>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const revealed = revealedStudents.includes(student.student_id);
            const { subject, body } = getEmailTemplate(student);

            return (
              <div
                key={student.classification_id}
                className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105 hover:shadow-lg"
              >
                <StudentAvatar classification={student.classification} />
                <p className="font-bold text-lg text-gray-800">
                  {maskEmail(student.email, revealed)}
                </p>
                <div className="mt-1 mb-2">{renderStatusText(student.classification)}</div>
                <p className="text-xs text-gray-500 mb-4 truncate w-full">
                  {student.department_name}
                </p>

                {!revealed ? (
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsModalOpen(true);
                    }}
                    className="w-full bg-[#03BFBF] hover:bg-[#02A4A4] text-white font-semibold py-3 px-4 rounded-full transition-all shadow"
                  >
                    View
                  </button>
                ) : ( <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${student.email}&su=${encodeURIComponent(
                      subject
                    )}&body=${encodeURIComponent(body)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#460F9D] hover:bg-[#5E21D2] text-white font-semibold py-3 px-4 rounded-full transition-all shadow text-center"
                  >
                    Send Email
                  </a>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No matching students found.</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3 bg-[#03BFBF] hover:bg-[#02A4A4] text-white rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoadingMore ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Loading More...
              </span>
            ) : (
              'Load More Students'
            )}
          </button>
        </div>
      )}

      {/* Password Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Password Required"
      >
        <div className="-mt-6 space-y-6">
          <p className="text-gray-700 text-base font-metropolis mt-2">
            To view Students' information, please enter your password.
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