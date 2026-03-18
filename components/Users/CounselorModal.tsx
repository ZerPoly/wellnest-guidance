'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { departments } from '@/data/data';

// ── types ─────────────────────────────────────────────────────────────────────

export interface CounselorForm {
  firstName:   string;
  lastName:    string;
  email:       string;
  password:    string;
  departments: string[];
  startTime:   string;
  endTime:     string;
}

interface Props {
  isOpen:       boolean;
  onClose:      () => void;
  onSave:       (data: CounselorForm) => void;
  initialData?: CounselorForm | null;
  title?:       string;
  submitText?:  string;
}

const TIMES = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

const toAMPM = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const EMPTY: CounselorForm = {
  firstName: '', lastName: '', email: '', password: '',
  departments: [], startTime: '08:00', endTime: '17:00',
};

const input = 'w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-700 bg-white placeholder-gray-400';
const label = 'block text-sm font-semibold text-gray-600 mb-1';

export default function AddCounselorModal({
  isOpen, onClose, onSave,
  initialData = null,
  title = 'Add New Counselor',
  submitText = 'Save Counselor',
}: Props) {

  const [form,      setForm]      = useState<CounselorForm>(EMPTY);
  const [showPass,  setShowPass]  = useState(false);
  const [deptOpen,  setDeptOpen]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const isEdit = !!initialData;

  useEffect(() => {
    if (!isOpen) return;
    setForm(initialData ?? { ...EMPTY });
    setError(null);
    setShowPass(false);
    setDeptOpen(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (field: keyof CounselorForm, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setError(null);
  };

  const toggleDept = (dept: string) => {
    setForm((p) => ({
      ...p,
      departments: p.departments.includes(dept)
        ? p.departments.filter((d) => d !== dept)
        : [...p.departments, dept],
    }));
    setError(null);
  };

  const validate = () => {
    if (!form.firstName.trim())  return 'First name is required.';
    if (!form.lastName.trim())   return 'Last name is required.';
    if (!form.email.trim())      return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email.';
    if (!isEdit && form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.departments.length === 0) return 'Select at least one department.';
    const mins = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
    if (mins(form.endTime) <= mins(form.startTime)) return 'End time must be after start time.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>

        {/* header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#460F9D]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* first + last name */}
          <div className="grid grid-cols-2 gap-3">
            {(['firstName', 'lastName'] as const).map((field) => (
              <div key={field}>
                <label className={label}>{field === 'firstName' ? 'First Name' : 'Last Name'} <span className="text-red-500">*</span></label>
                <input
                  value={form[field]}
                  onChange={(e) => set(field, e.target.value)}
                  placeholder={field === 'firstName' ? 'John' : 'Doe'}
                  className={input}
                />
              </div>
            ))}
          </div>

          {/* email */}
          <div>
            <label className={label}>Email Address <span className="text-red-500">*</span></label>
            <input type="email" value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="counselor@gmail.com" className={input}
            />
          </div>

          {/* password*/}
          {!isEdit && (
            <div>
              <label className={label}>Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Min. 8 characters"
                  className={`${input} pr-10`}
                />
                <button type="button" onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* departments */}
          <div>
            <label className={label}>Department <span className="text-red-500">*</span></label>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button type="button" onClick={() => setDeptOpen((p) => !p)}
                className={`${input} flex items-center justify-between ${form.departments.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>
                <span className="truncate">{form.departments.length === 0 ? 'Select departments...' : form.departments.join(', ')}</span>
                <ChevronDown size={18} className={`ml-2 flex-shrink-0 text-gray-500 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
              </button>

              {deptOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {departments.map((dept) => {
                    const on = form.departments.includes(dept);
                    return (
                      <button key={dept} type="button" onClick={() => toggleDept(dept)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left ${on ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${on ? 'bg-purple-700 border-purple-700' : 'border-gray-300'}`}>
                          {on && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        {dept}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* pills */}
            {form.departments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.departments.map((dept) => (
                  <span key={dept} className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    {dept}
                    <button type="button" onClick={() => toggleDept(dept)} className="hover:text-purple-900"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* start and end time */}
          <div className="grid grid-cols-2 gap-3">
            {(['startTime', 'endTime'] as const).map((field) => (
              <div key={field}>
                <label className={label}>{field === 'startTime' ? 'Start Time' : 'End Time'} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={form[field]} onChange={(e) => set(field, e.target.value)}
                    className={`${input} appearance-none pr-10`}>
                    {TIMES.map((t) => <option key={t} value={t}>{toAMPM(t)}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="w-full mt-2 py-3 rounded-xl bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors">
            {submitText}
          </button>

        </form>
      </div>
    </div>
  );
}