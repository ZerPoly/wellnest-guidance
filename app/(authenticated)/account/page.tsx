"use client";

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { HiMail, HiLockClosed, HiArrowLeft, HiPencil } from 'react-icons/hi';
import { X, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

// API imports
import { 
  updateAdmin, 
  updateAdminPassword, 
  updateCounselor, 
  updateCounselorPassword 
} from '@/lib/api/admin/management';

interface CustomUser {
  id: string;
  email: string;
  role: "admin" | "counselor" | "super_admin";
  accessToken: string;
  name?: string; 
}

interface CustomSession {
  user: CustomUser;
  adminToken?: string;
  counselorToken?: string;
  error?: string;
}

export default function AccountPage() {
  const { data: sessionData, status, update: updateSession } = useSession();
  const session = sessionData as unknown as CustomSession | null;

  // Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    previousPassword: '',
    newPassword: ''
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--blue-bg-darker)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--cyan)]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--blue-bg-darker)] p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/auth' })}
          className="px-6 py-3 bg-[var(--cyan)] text-white rounded-full font-bold hover:bg-[var(--cyan-dark)] transition-colors"
        >
          Go to Sign In
        </button>
      </div>
    );
  }
  
  const displayRoleMap: Record<string, string> = {
    'admin': 'Admin',
    'super_admin': 'Super Admin',
    'counselor': 'Counselor'
  };

  const rawRole = session.user?.role || 'counselor';
  const userRole = displayRoleMap[rawRole] || 'Staff';
  const userEmail = session.user?.email || 'N/A';
  const userName = session.user?.name || userEmail.split('@')[0] || 'User Name';
  const userId = session.user?.id;
  const token = session.adminToken || session.counselorToken || '';

  // Open modal and pre-fill data
  const handleOpenEdit = () => {
    const parts = userName.split(' ');
    setFormData({
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      email: userEmail,
      previousPassword: '',
      newPassword: ''
    });
    setError(null);
    setIsEditing(true);
  };

  // Handle Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) {
      setError("First name and email are required.");
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError("New password must be at least 8 characters.");
        return;
      }
      if (!formData.previousPassword) {
        setError("You must provide your previous password to set a new one.");
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedName = `${formData.firstName} ${formData.lastName}`.trim();
      
      if (rawRole === 'admin' || rawRole === 'super_admin') {
        // Update Admin
        await updateAdmin(token, userId, {
          user_name: updatedName,
          email: formData.email
        });
        if (formData.newPassword) {
          await updateAdminPassword(token, userId, {
            new_password: formData.newPassword,
            previous_password: formData.previousPassword
          });
        }
      } else {
        // Update Counselor
        await updateCounselor(token, userId, {
          user_name: updatedName,
          email: formData.email
        });
        if (formData.newPassword) {
          await updateCounselorPassword(token, userId, {
            new_password: formData.newPassword,
            previous_password: formData.previousPassword
          });
        }
      }

      // Update NextAuth Session 
      await updateSession();
      
      setIsEditing(false);
      window.location.reload(); 
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // REMOVED: border-t border-[var(--outline)] from this main tag
    <main className="bg-[var(--background)] flex-1 overflow-y-auto no-scrollbar">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Link href="/adminDashboard" className="flex items-center text-[var(--foreground-muted)] hover:text-[var(--title)] mb-6 transition-colors">
          <HiArrowLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </Link>
        
        <div className="bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-md overflow-hidden">

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 gap-4 border-b border-[var(--line)]">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--title)] mb-1 capitalize">
                {userName}
              </h1>
              <p className="text-sm md:text-base font-medium text-[var(--foreground-muted)]">
                {userRole} Account
              </p>
            </div>
            
            {/* Edit Button */}
            <button 
              onClick={handleOpenEdit}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--cyan)] text-white rounded-xl font-semibold hover:bg-[var(--cyan-dark)] transition-all shadow-sm shrink-0 text-sm md:text-base"
            >
              <HiPencil size={16} /> Edit Profile
            </button>
          </div>
          
          <div className="p-6 md:p-8">
            <h2 className="text-lg md:text-xl font-extrabold text-[var(--title)] mb-6">
              Account Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4 p-4 bg-[var(--background-dark)] rounded-xl border border-[var(--line)] shadow-sm">
                <HiMail className="w-8 h-8 md:w-10 md:h-10 text-[var(--cyan)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-semibold text-[var(--foreground-muted)]">Email Address</p>
                  <p className="font-bold text-[var(--foreground)] break-all text-sm md:text-base">{userEmail}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-[var(--background-dark)] rounded-xl border border-[var(--line)] shadow-sm">
                <HiLockClosed className="w-8 h-8 md:w-10 md:h-10 text-[var(--cyan)] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs md:text-sm font-semibold text-[var(--foreground-muted)]">User Role</p>
                  <p className="font-bold text-[var(--foreground)] text-sm md:text-base">{userRole}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 md:px-8 py-6 bg-[var(--background-dark)]/50 border-t border-[var(--line)] flex justify-end">
            <LogoutButton/>
          </div>
        </div>
      </div>

      {/* --- Edit Profile Modal --- */}
      {isEditing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 h-[100dvh] w-screen">
          <div className="absolute inset-0 w-full h-full bg-black/40 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-w-md bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-[var(--line)] bg-[var(--background-dark)]">
              <h2 className="text-lg md:text-xl font-bold text-[var(--cyan)]">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} disabled={isSaving} className="text-[var(--foreground-muted)] hover:bg-[var(--line)] rounded-full p-1.5 transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 md:p-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
              {error && (
                <div className="bg-red-500/10 border-l-4 border-red-500 p-3 rounded">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-[var(--foreground-muted)] mb-1">First Name</label>
                  <input 
                    value={formData.firstName} 
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                    className="w-full border border-[var(--line)] rounded-xl px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] bg-[var(--background-dark)] text-[var(--foreground)] transition-shadow" 
                    disabled={isSaving} 
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-[var(--foreground-muted)] mb-1">Last Name</label>
                  <input 
                    value={formData.lastName} 
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                    className="w-full border border-[var(--line)] rounded-xl px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] bg-[var(--background-dark)] text-[var(--foreground)] transition-shadow" 
                    disabled={isSaving} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[var(--foreground-muted)] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full border border-[var(--line)] rounded-xl px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] bg-[var(--background-dark)] text-[var(--foreground)] transition-shadow" 
                  disabled={isSaving} 
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[var(--foreground-muted)] mb-1">Previous Password (Required if changing)</label>
                <div className="relative">
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={formData.previousPassword} 
                    onChange={(e) => setFormData({...formData, previousPassword: e.target.value})} 
                    className="w-full border border-[var(--line)] rounded-xl px-4 py-2 md:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] bg-[var(--background-dark)] text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] transition-shadow" 
                    disabled={isSaving} 
                    placeholder="Leave blank to keep current" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-semibold text-[var(--foreground-muted)] mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPass ? 'text' : 'password'} 
                    value={formData.newPassword} 
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                    className="w-full border border-[var(--line)] rounded-xl px-4 py-2 md:py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cyan)] bg-[var(--background-dark)] text-[var(--foreground)] placeholder-[var(--foreground-placeholder)] transition-shadow" 
                    disabled={isSaving} 
                    placeholder="Leave blank to keep current" 
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div className="pt-4 mt-4 border-t border-[var(--line)]">
                <button type="submit" disabled={isSaving} className="w-full py-2.5 md:py-3 rounded-xl bg-[var(--cyan)] text-white font-bold hover:bg-[var(--cyan-dark)] disabled:opacity-50 active:scale-[0.98] transition-all shadow-md">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}