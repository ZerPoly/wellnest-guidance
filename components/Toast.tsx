'use client';

import React, { useEffect, useState } from 'react';
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle, HiXCircle } from 'react-icons/hi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast = ({ id, message, type = 'info', duration = 3000, onClose }: ToastProps) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const toastConfig = {
    success: {
      icon: HiCheckCircle,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    error: {
      icon: HiXCircle,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    warning: {
      icon: HiExclamationCircle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
    info: {
      icon: HiInformationCircle,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      iconColor: 'text-white',
    },
  };

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.textColor} rounded-lg shadow-lg p-4 mb-3 flex items-center space-x-3 min-w-[300px] max-w-md transition-all duration-300 ${
        isExiting ? 'animate-toast-exit' : 'animate-toast-enter'
      }`}
      role="alert"
    >
      <Icon className={`w-6 h-6 flex-shrink-0 ${config.iconColor}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 hover:opacity-75 transition-opacity"
        aria-label="Close notification"
      >
        <HiX className="w-5 h-5" />
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{
    id: string;
    message: string;
    type?: ToastType;
    duration?: number;
  }>;
  onClose: (id: string) => void;
}

export const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-[10000] flex flex-col-reverse">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

export default Toast;