"use client";

import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { verifyStudentAccess } from "@/lib/api/studentClassificationByID";
import {
  StudentProfileData,
  StudentProfileResponse,
} from "../types/studentProfile.type";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  studentEmail: string | null;
  token: string | null;
  onVerified: (
    studentId: string,
    result: StudentProfileData | undefined
  ) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentEmail,
  token,
  onVerified,
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentId || !studentEmail || !token) {
      setErrorMessage("Verification error: missing student or token.");
      return;
    }

    try {
      setIsVerifying(true);
      setErrorMessage(null);

      const result = await verifyStudentAccess(
        studentId,
        { email: studentEmail, password },
        token
      );

      if (result.success) {
        setPassword("");
        onVerified(studentId, result.data);
      } else {
        setErrorMessage(
          result.message || "Incorrect password. Please try again."
        );
        setPassword("");
      }
    } catch (error: any) {
      console.error("Password verification failed:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Enter Access Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-[#03BFBF] outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <AiFillEyeInvisible size={20} />
              ) : (
                <AiFillEye size={20} />
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 rounded-lg bg-[#03BFBF] hover:bg-[#02A4A4] text-white font-semibold disabled:opacity-60"
            >
              {isVerifying ? "Verifying..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
