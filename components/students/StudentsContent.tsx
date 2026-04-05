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
  if (!localPart || localPart.length < 2) return `*@${domain}`;
  const firstChar = localPart.charAt(0);
  const lastChar = localPart.charAt(localPart.length - 1);
  return `${firstChar}***${lastChar}@${domain}`;
};

// Avatar Component
const StudentAvatar: React.FC<{ classification: ClassificationType }> = ({
  classification,
}) => {
  const isFlagged = classification === "InCrisis" || classification === "Struggling";
  // Syncing avatar colors with your theme variables
  const bgColor = isFlagged ? "bg-[var(--primary)]" : "bg-[var(--cyan)]";
  
  return (
    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner ${bgColor}`}>
      <img
        src="/img/student.png"
        alt="Student Icon"
        className="w-full h-full object-cover rounded-full"
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
  const [selectedStudent, setSelectedStudent] = useState<StudentClassification | null>(null);
  const [revealedStudents, setRevealedStudents] = useState<string[]>([]);

  const handleViewDetails = (student: StudentClassification) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handlePasswordVerified = async (studentId: string, result: StudentProfileData | undefined) => {
    setIsModalOpen(false);
    setRevealedStudents((prev) => [...prev, studentId]);

    if (result) {
      try {
        sessionStorage.removeItem(`student_${studentId}`);
        sessionStorage.setItem(`student_${studentId}`, JSON.stringify(result));
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push(`/students/${studentId}`);
      } catch (error) {
        alert('Failed to load student profile. Please try again.');
      }
    } else {
      alert('Failed to retrieve student data. Please try again.');
    }
  };

  const fetchStudents = useCallback(
    async (cursor: string | undefined = undefined, append = false) => {
      if (isSessionLoading) return;
      if (!token) {
        setError("Authentication token missing. Please log in.");
        return;
      }

      if (append) setIsLoadingMore(true);
      else {
        setLoading(true);
        setError(null);
        setStudents([]);
      }

      const params = {
        limit: LIMIT,
        cursor: cursor,
        classification: statusFilter !== "All" ? (statusFilter as ClassificationType) : undefined,
      };

      try {
        const response = await apiFetchStudents(token, params);
        if (response.success && response.data) {
          setStudents((prev) => append ? [...prev, ...response.data!.classifications] : response.data!.classifications);
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
    if (!isSessionLoading) fetchStudents(undefined, false);
  }, [fetchStudents, isSessionLoading]);

  const handleLoadMore = () => {
    if (nextCursor && !isLoadingMore && hasMore) fetchStudents(nextCursor, true);
  };

  const filterOptions = ["All", "Excelling", "Thriving", "Struggling", "InCrisis"];

  const filteredStudents = students.filter(
    (student) =>
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.department_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatusText = (classification: ClassificationType) => {
    const color =
      classification === "Excelling" ? "text-(--classification-green)" :
      classification === "Thriving" ? "text-(--classification-yellow)" :
      classification === "Struggling" ? "text-(--classification-blue)" :
      classification === "InCrisis" ? "text-(--classification-red)" : "text-[var(--foreground-muted)]";

    const displayText = classification === "InCrisis" ? "In-Crisis" : classification;

    return (
      <span className={`${color} font-bold`}>
        {displayText}
      </span>
    );
  };

  if (isSessionLoading) return (
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 border-4 border-[var(--outline)] rounded-2xl"></div>
          <div className="absolute inset-0 border-4 border-t-[var(--cyan)] rounded-2xl animate-spin"></div>
        </div>
      </div>
  );

  if (loading) return (
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 border-4 border-[var(--outline)] rounded-2xl"></div>
          <div className="absolute inset-0 border-4 border-t-[var(--cyan)] rounded-2xl animate-spin"></div>
        </div>
      </div>
  );

  if (error) return (
    <div className="p-8 bg-red-500/10 border-l-4 border-red-500 text-red-500 rounded-r-xl">
      <p className="font-bold uppercase tracking-widest text-xs">Data Error</p>
      <p className="text-sm">{error}</p>
      <button onClick={() => fetchStudents(undefined, false)} className="mt-2 text-xs font-black underline uppercase">Try Again</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search bar */}
      {/* <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by email or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-6 py-3 bg-[var(--card-dark)] border border-[var(--line)] rounded-2xl text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] focus:ring-2 focus:ring-[var(--cyan)] outline-none transition-all"
        />
      </div> */}

      {/* Filter controls */}
      <div className="flex flex-col sm:flex-row justify-start items-start sm:items-center gap-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--foreground-muted)]">
          Showing <span className="text-[var(--title)]">{filteredStudents.length}</span> students
        </p>

        <div className="relative">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-5 py-2.5 bg-[var(--card)] border rounded-2xl transition-all shadow-sm ${
              statusFilter !== "All" ? "border-[var(--primary)] text-[var(--primary)]" : "border-[var(--line)] text-[var(--foreground)]"
            }`}
          >
            <AiOutlineFilter className="w-4 h-4" />
            <span className="text-sm font-bold">
              Filter: {statusFilter === "InCrisis" ? "In-Crisis" : statusFilter}
            </span>
          </button>

          {showFilter && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
              <div className="absolute left-0 mt-2 w-48 bg-[var(--card)] rounded-2xl shadow-2xl border border-[var(--line)] z-20 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {filterOptions.map((option) => {
                  const isActive = statusFilter === option;
                  return (
                    <button
                      key={option}
                      onClick={() => { setStatusFilter(option); setShowFilter(false); }}
                      className={`flex items-center justify-between w-full px-5 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                        isActive ? "bg-[var(--button)] text-white" : "text-[var(--foreground-muted)] hover:bg-[var(--background)]"
                      }`}
                    >
                      {option === "InCrisis" ? "In-Crisis" : option}
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
          filteredStudents.map((student) => (
            <div
              key={student.student_id}
              className="bg-[var(--card)] border border-[var(--line)] shadow-md rounded-[2rem] p-8 flex flex-col items-center text-center transition-all hover:translate-y-[-4px] hover:shadow-xl"
            >
              <StudentAvatar classification={student.classification} />
              
              <p className="font-extrabold text-lg text-[var(--text)] tracking-tight">
                {maskEmail(student.email, false)}
              </p>

              <div className="mt-1 mb-2 text-sm uppercase tracking-tighter">
                {renderStatusText(student.classification)}
              </div>

              <p className="text-[10px] font-bold uppercase text-[var(--foreground-placeholder)] mb-6 truncate w-full">
                {student.department_name}
              </p>

              <button
                onClick={() => handleViewDetails(student)}
                className="w-full font-extrabold py-4 px-4 rounded-full transition-all bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-white shadow-lg active:scale-95 text-sm"
              >
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-[var(--foreground-muted)] uppercase font-black tracking-widest text-xs">
            <p>No matching students found.</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-10 py-4 bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] text-white rounded-full font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl"
          >
            {isLoadingMore ? "Loading..." : "Load More Students"}
          </button>
        </div>
      )}

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