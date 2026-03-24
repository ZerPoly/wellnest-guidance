// components/Modal.tsx
'use client';

import React, { useEffect } from 'react';
import { HiX } from 'react-icons/hi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  showHeader?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  showHeader = true,
  className = '',
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render if not open
  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        pointerEvents: 'auto',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        cursor: 'default'
      }}
    >
      {/* Backdrop with Gaussian blur */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300"
        style={{ 
          pointerEvents: 'auto',
          cursor: closeOnBackdropClick ? 'pointer' : 'default',
          userSelect: 'none',
          WebkitUserSelect: 'none'
        }}
        onClick={closeOnBackdropClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      {/* FIXED: bg-[var(--bg)] -> bg-[var(--card)], border border-[var(--line)] added */}
      <div
        className={`relative bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-2xl w-full ${sizeClasses[size]} ${className} transform transition-all animate-modal-appear`}
        style={{
          pointerEvents: 'auto',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          cursor: 'auto'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)]">
            {title && (
              <h2
                id="modal-title"
                /* FIXED: text-gray-800 -> text-[var(--title)] */
                className="text-xl font-extrabold text-[var(--title)] font-['Metropolis']"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                /* FIXED: text-gray-400 -> text-[var(--foreground-muted)], hover colors updated */
                className="ml-auto text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors p-1.5 rounded-full hover:bg-[var(--background-dark)]"
                style={{ cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <HiX size={24} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}