'use client';
import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

export interface AdminForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isSuperAdmin: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdminForm) => void;
  isLoading?: boolean;
}

const EMPTY: AdminForm = {
  firstName: '', lastName: '', email: '', password: '', isSuperAdmin: false,
};

const inputCls = 'w-full border border-[var(--line)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] bg-[var(--card)] text-[var(--foreground)] placeholder-[var(--foreground-placeholder)]';
const labelCls = 'block text-sm font-semibold text-[var(--foreground-muted)] mb-1';

export default function AdminModal({ isOpen, onClose, onSave, isLoading = false }: Props) {
  const [form, setForm] = useState<AdminForm>(EMPTY);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || form.password.length < 8) {
      setError('Please fill in all fields correctly (Password min 8 chars).');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-[var(--line)]">
          <h2 className="text-xl font-bold text-[var(--cyan)]">Add New Admin</h2>
          <button onClick={onClose} disabled={isLoading} className="text-[var(--foreground-muted)] hover:bg-[var(--background-dark)] rounded-full p-1"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>First Name</label>
              <input value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className={inputCls} disabled={isLoading} />
            </div>
            <div>
              <label className={labelCls}>Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className={inputCls} disabled={isLoading} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className={inputCls} disabled={isLoading} />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className={inputCls} disabled={isLoading} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 py-2">
            <input type="checkbox" checked={form.isSuperAdmin} onChange={(e) => setForm({...form, isSuperAdmin: e.target.checked})} id="superAdmin" className="accent-[var(--cyan)]" />
            <label htmlFor="superAdmin" className="text-sm font-bold text-[var(--title)]">Grant Super Admin Privileges</label>
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl bg-[var(--cyan)] text-white font-bold hover:bg-[var(--cyan-dark)] disabled:opacity-50 transition-all">
            {isLoading ? 'Creating...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}