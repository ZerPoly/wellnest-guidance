"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputProps {
  password: string;
  setPassword: (value: string) => void;
  onSubmit: () => void;
  loading?: boolean;
  error?: string | null;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  password,
  setPassword,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 bg-blue-600 rounded-2xl shadow-xl">
      <h2 className="text-white text-2xl font-semibold mb-4 text-center">
        Enter Access Password
      </h2>

      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 pr-10 text-white placeholder-blue-100 bg-blue-500 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Enter password..."
        />
        <button
          type="button"
          className="absolute right-3 top-3 text-blue-100 hover:text-white"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {error && (
        <p className="text-red-200 mt-3 text-sm text-center">{error}</p>
      )}

      <button
        onClick={onSubmit}
        disabled={loading}
        className={`mt-5 w-full py-3 rounded-lg text-lg font-medium transition-all duration-300 ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-700 hover:bg-blue-800 text-white"
        }`}
      >
        {loading ? "Verifying..." : "Submit"}
      </button>
    </div>
  );
};

export default PasswordInput;
