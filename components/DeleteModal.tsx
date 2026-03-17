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
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-gray-600 mb-1">{description}</p>
      {itemName && (
        <p className="text-sm font-semibold text-gray-900 mb-3">{itemName}</p>
      )}
      <p className="text-xs text-red-500 mb-6">This action cannot be undone.</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
          Cancel
        </button>
        <button onClick={() => { onConfirm(); onClose(); }}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600">
          Yes, delete
        </button>
      </div>
    </Modal>
  );
}