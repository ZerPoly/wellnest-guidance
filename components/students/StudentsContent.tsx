"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  StudentClassification,
  ClassificationType,
  fetchStudents as apiFetchStudents,
} from "@/lib/api/studentClassification";
import { verifyStudentAccess } from "@/lib/api/studentClassificationByID";
import Link from "next/link";
import { AiOutlineFilter } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PasswordModal from "@/components/students/PasswordModal";
import { StudentProfileData } from "../types/studentProfile.type";

// --- Helper Functions ---
const maskEmail = (email: string, revealed: boolean) => {
  if (revealed) return email;

  const parts = email.split("@");
  const localPart = parts[0];
  const domain = parts[1];

  if (!localPart || localPart.length < 2) {
    return `*@${domain}`;
  }

  const firstChar = localPart.charAt(0);
  const lastChar = localPart.charAt(localPart.length - 1);

  return `${firstChar}***${lastChar}@${domain}`;
};

// Avatar Component
const StudentAvatar: React.FC<{ classification: ClassificationType }> = ({
  classification,
}) => {
  const isFlagged =
    classification === "InCrisis" || classification === "Struggling";
  const bgColor = isFlagged ? "bg-[#460F9D]" : "bg-[#03BFBF]";
  const iconColor = isFlagged ? "text-orange-100" : "text-teal-100";

  return (
    <div
      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${bgColor}`}
    >
      <img
        src="/img/student.png"
        alt="Student Icon"
        className={`w-full h-full object-cover rounded-full ${iconColor}`}
      />
    </div>
  );
};

// Token Hook
const useAuthToken = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const token = session?.user?.accessToken ?? null;
  const email = session?.user?.email ?? null;

  return { token, email, isLoading };
};

// --- Main Component ---
const StudentsContent: React.FC = () => {
  const router = useRouter();
  const { token, email, isLoading: isSessionLoading } = useAuthToken();
  const LIMIT = 20;

  const [students, setStudents] = useState<StudentClassification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentClassification | null>(null);
  const [revealedStudents, setRevealedStudents] = useState<string[]>([]);

  // View Details → opens password modal
  const handleViewDetails = (student: StudentClassification) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // When password verified successfully
  const handlePasswordVerified = (
    studentId: string,
    result: StudentProfileData | undefined
  ) => {
    setIsModalOpen(false);
    setRevealedStudents((prev) => [...prev, studentId]);

    if (result) {
      // Clear first
      sessionStorage.removeItem(`student_${studentId}`);

      sessionStorage.setItem(`student_${studentId}`, JSON.stringify(result));
      router.push(`/students/${studentId}`);
    }
  };

  // Fetch students from API
  const fetchStudents = useCallback(
    async (cursor: string | undefined = undefined, append = false) => {
      if (isSessionLoading) return;
      if (!token) {
        setError("Authentication token missing. Please log in.");
        setLoading(false);
        return;
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
        setStudents([]);
      }

      const params = {
        limit: LIMIT,
        cursor: cursor,
        classification:
          statusFilter !== "All"
            ? (statusFilter as ClassificationType)
            : undefined,
      };

      try {
        const response = await apiFetchStudents(token, params);

        if (response.success && response.data) {
          setStudents((prev) =>
            append
              ? [...prev, ...response.data!.classifications]
              : response.data!.classifications
          );
          setHasMore(response.data.hasMore);
          setNextCursor(response.data.nextCursor);
        } else {
          setError(response.message || "Unknown error fetching students.");
        }
      } catch (err: any) {
        setError(err.message || "A network error occurred.");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token, statusFilter, isSessionLoading]
  );

  useEffect(() => {
    if (!isSessionLoading) {
      fetchStudents(undefined, false);
    }
  }, [fetchStudents, isSessionLoading]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore && hasMore) {
      fetchStudents(nextCursor, true);
    }
  };

  const filterOptions = [
    "All",
    "Excelling",
    "Thriving",
    "Struggling",
    "InCrisis",
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatusText = (classification: ClassificationType) => {
    const color =
  classification === "Excelling"
    ? "text-green-600"
  : classification === "Thriving"
    ? "text-amber-500"
  : classification === "Struggling"
    ? "text-blue-600"
  : classification === "InCrisis"
    ? "text-red-600"
  : "text-gray-600"

    const displayText =
      classification === "InCrisis" ? "In-Crisis" : classification;

    return (
      <span className={`${color} font-semibold font-metropolis`}>
        {displayText}
      </span>
    );
  };

  // --- RENDER START ---
  if (isSessionLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#460F9D]"></div>
        <p className="ml-4 text-lg text-gray-700">Checking authentication...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#03BFBF]"></div>
        <p className="ml-4 text-lg text-gray-700">Fetching students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-100 border-l-4 border-red-500 text-red-700">
        <p className="font-bold">Data Error</p>
        <p>{error}</p>
        <button
          onClick={() => fetchStudents(undefined, false)}
          className="mt-2 text-sm text-red-500 hover:text-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* search bar */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by email or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03BFBF] focus:border-transparent"
        />
      </div>

      {/* filter controls parent container */}
      <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4">
        {/* showing N students */}
        <p className="text-sm text-(--text-muted)">
          Showing <span className="font-bold text-(--title)">{filteredStudents.length}</span> students
        </p>

        {/* filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-xl transition-all shadow-sm hover:border-purple-400 focus:ring-2 focus:ring-purple-100 ${
              statusFilter !== "All" ? "border-purple-500 text-purple-700" : "border-gray-300 text-gray-700"
            }`}
          >
            <AiOutlineFilter className={`w-4 h-4 ${statusFilter !== "All" ? "text-purple-600" : "text-gray-500"}`} />
            <span className="text-sm font-semibold">
              Filter: {statusFilter === "InCrisis" ? "In-Crisis" : statusFilter}
            </span>
            <svg 
              className={`w-4 h-4 ml-1 transition-transform duration-200 ${showFilter ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showFilter && (
            <>
              {/* Transparent overlay to close dropdown when clicking outside */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowFilter(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {filterOptions.map((option) => {
                  const isActive = statusFilter === option;
                  const label = option === "InCrisis" ? "In-Crisis" : option;
                  return (
                    <button
                      key={option}
                      onClick={() => {
                        setStatusFilter(option);
                        setShowFilter(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors ${
                        isActive 
                          ? "bg-purple-50 text-purple-700 font-bold" 
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {label}
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            return (
              <div
                key={student.student_id}
                className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105 hover:shadow-lg"
              >
                <StudentAvatar classification={student.classification} />
                
                <p className="font-bold text-lg text-gray-800">
                  {/* Always mask by default; redirection handles the 'revealed' view */}
                  {maskEmail(student.email, false)}
                </p>

                <div className="mt-1 mb-2">
                  {renderStatusText(student.classification)}
                </div>

                <p className="text-xs text-gray-500 mb-4 truncate w-full">
                  {student.department_name}
                </p>

                <button
                  onClick={() => handleViewDetails(student)}
                  className="w-full font-semibold py-3 px-4 rounded-full transition-all shadow bg-[#03BFBF] hover:bg-[#02A4A4] text-white"
                >
                  View Details
                </button>
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
              "Load More Students"
            )}
          </button>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentId={selectedStudent?.student_id || null}
        studentEmail={email}
        token={token}
        onVerified={handlePasswordVerified}
      />
    </div>
  );
};

export default StudentsContent;
