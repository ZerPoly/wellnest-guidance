'use client';

import Modal from '@/components/Modal';

interface DeleteModalProps {
  isOpen:       boolean;
  onClose:      () => void;
  onConfirm:    () => void;
  title?:       string;
  description: string;
  itemName?:    string; 
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title       = 'Delete',
  description = 'Are you sure you want to delete:',
  itemName,
}: DeleteModalProps) {
  return (
    // UPDATED: Changed size from "sm" to "md" for a larger modal presence
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="p-2">
        {/* FIXED: text-gray-600 -> text-[var(--foreground-muted)] (Adapts to Light/Dark) */}
        <p className="text-base text-(--foreground-muted) mb-2">
          {description}
        </p>
        
        {/* FIXED: text-gray-900 -> text-[var(--title)] (Adapts to Light/Dark) */}
        {itemName && (
          <p className="text-lg font-bold text-[var(--title)] mb-4 p-3 bg-[var(--background-dark)] rounded-xl border border-[var(--line)]">
            {itemName}
          </p>
        )}
        
        <p className="text-sm text-red-500 mb-8 font-medium">
          This action is permanent and cannot be undone.
        </p>
        
        <div className="flex justify-end gap-4">
          {/* FIXED: Colors mapped to theme variables for Light/Dark support */}
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-[var(--foreground-muted)] bg-[var(--background-dark)] border border-[var(--line)] rounded-xl hover:bg-[var(--line)] hover:text-[var(--title)] transition-all"
          >
            Cancel
          </button>
          
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="px-6 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 shadow-lg transition-all active:scale-95"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}