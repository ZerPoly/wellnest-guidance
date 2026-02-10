"use client";

import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { verifyStudentAccess } from "@/lib/api/studentClassificationByID";

interface AccessPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  studentEmail: string | null;
  token: string | null;
  onVerified: (studentId: string, data: any) => void;
}

const AccessPasswordModal: React.FC<AccessPasswordModalProps> = ({
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
      setErrorMessage("verification error: missing student or token.");
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
        setErrorMessage(result.message || "Incorrect password. Please try again.");
        setPassword("");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 relative">
        <h2 className="text-xl font-bold mb-2 text-gray-800">
          Security Verification
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Please enter your password to view sensitive student information.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access password"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <AiFillEyeInvisible size={22} />
              ) : (
                <AiFillEye size={22} />
              )}
            </button>
          </div>

          {errorMessage && (
            <p className="text-xs text-red-500 font-semibold bg-red-50 p-2 rounded-lg">
              {errorMessage}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 px-4 py-3 rounded-xl bg-[#460F9D] hover:bg-[#350b77] text-white font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isVerifying ? "Verifying..." : "View Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessPasswordModal;