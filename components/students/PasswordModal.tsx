'use client';

import React, { useState } from "react";
import Modal from "../Modal";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { StudentClassification } from "@/lib/api/studentClassification";
// Assuming verifyStudentAccess is imported and correctly returns { success: boolean, message: string }
import { verifyStudentAccess } from "@/lib/api/studentClassificationByID"; 
import { useRouter } from 'next/navigation';

// --- PasswordInput Component (CONSOLIDATED) ---
interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
  error,
  onKeyDown,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-2">
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder || "Enter password"}
          disabled={disabled}
          className={`w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#460F9D] outline-none pr-10 transition-colors ${error
              ? "border-red-500 focus:border-red-500"
              : "border-gray-300 focus:border-[#460F9D]"
            } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : ""}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-metropolis -mt-1">{error}</p>
      )}
    </div>
  );
};
// --- END PasswordInput Component ---


// --- 2. PasswordModal Component ---
interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudent: StudentClassification | null;
  email: string | null;
  token: string | null;
  onVerificationSuccess: (studentId: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  selectedStudent,
  email,
  token,
  onVerificationSuccess,
}) => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePasswordSubmit = async () => {
    setPasswordError(null);

    if (!selectedStudent || !email || !token) {
      setPasswordError("Verification error: Missing user or student data. Please re-log in.");
      return;
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password.");
      return;
    }

    const studentId = selectedStudent.student_id;
    const credentials = { email, password };

    setIsVerifying(true);

    try {
      // API call to verify credentials
      const verificationResult = await verifyStudentAccess(studentId, credentials, token);

      // 🛑 CRITICAL FIX: Ensure REDIRECTION ONLY HAPPENS inside this block
      if (verificationResult.success) {
        
        // Store password in sessionStorage
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('temp_student_access_password', password);
        }

        // 1. Notify parent
        onVerificationSuccess(studentId); 
        
        // 2. Clean up and close modal states
        setPassword("");
        onClose();

        // 3. PERFORM REDIRECT
        router.push(`/students/${studentId}?access=granted`);
        
      } else {
        // FAILURE PATH: Show error message and stop
        setPasswordError(verificationResult.message || "Invalid credentials. Please try again.");
        setPassword(""); 
      }
    } catch (error) {
      console.error("Password verification failed:", error);
      setPasswordError("A critical network error occurred.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isVerifying) {
          setPassword("");
          setPasswordError(null);
          onClose();
        }
      }}
      title="Password Required"
    >
      <div className="-mt-6 space-y-6">
        <p className="text-gray-700 text-base font-metropolis mt-2">
          To view <span className="font-bold">{selectedStudent?.email}</span>'s information, please enter your password.
        </p>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isVerifying) {
              handlePasswordSubmit();
            }
          }}
          error={passwordError}
          disabled={isVerifying}
        />
        <button
          onClick={handlePasswordSubmit}
          disabled={isVerifying}
          className="w-full bg-[#460F9D] hover:bg-[#5E21D2] text-white font-semibold py-3 px-4 mb-5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Verifying...
            </span>
          ) : (
            'Submit'
          )}
        </button>
      </div>
    </Modal>
  );
};

export default PasswordModal;