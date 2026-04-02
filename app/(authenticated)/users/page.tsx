'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlinePlus, AiOutlineUserAdd } from 'react-icons/ai';
import Link from 'next/link';

// Components
import TableComponent from '@/components/Users/TableComponent';
import CounselorModal, { CounselorForm } from '@/components/Users/CounselorModal';
import AdminModal, { AdminForm } from '@/components/Users/AdminModal';
import UserDetailsModal from '@/components/Users/UserDetailsModal';
import DeleteModal from '@/components/DeleteModal';

// API & Types
import { 
  getCounselors, 
  getStudents, 
  getDepartments, 
  createCounselor, 
  createAdmin, 
  Department 
} from '@/lib/api/admin/management';
import { AppRow, CounselorRow, isStudentRow } from '@/components/Users/users.utils';
import { formatYearLevel, mapCounselor, mapStudent } from '@/lib/api/admin/management.utils';

export default function UsersPage() {
  const { data: session } = useSession();
  const adminToken = session?.adminToken ?? '';

  // --- UI & Refresh State ---
  const [currentTab, setCurrentTab] = useState('Students');
  const [refreshKey, setRefreshKey] = useState(0); // Forces table to re-fetch
  const [addCounselorOpen, setAddCounselorOpen] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CounselorRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppRow | null>(null);
  const [viewingUser, setViewingUser] = useState<AppRow | null>(null);
  
  // --- Logic State ---
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // Helper to trigger a data refresh
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  // Fetch Departments for the Counselor Modal dropdown
  useEffect(() => {
    if (!adminToken) return;
    setDeptLoading(true);
    getDepartments(adminToken)
      .then(setDepartments)
      .catch((err) => console.error('Failed to load departments:', err))
      .finally(() => setDeptLoading(false));
  }, [adminToken]);

  // Table Data Fetcher - depends on refreshKey
  const fetchData = useCallback(async (tab: string, cursor?: string) => {
    if (!adminToken) throw new Error('No admin token available.');

    if (tab === 'Counselors') {
      const res = await getCounselors(adminToken, 10, cursor);
      return {
        items: res.data.counselors.map(mapCounselor),
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      };
    } else {
      const res = await getStudents(adminToken, 10, cursor);
      return {
        items: res.data.students.map(mapStudent),
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      };
    }
  }, [adminToken, refreshKey]); 

  // ── Handler: Save Counselor ──────────────────────────────────────────────
  const handleSaveCounselor = async (formData: CounselorForm) => {
    setSaveError(null);
    setIsSaving(true);
    try {
      const selectedDeptName = formData.departments[0];
      const matched = departments.find(
        (d) => d.department_name.toLowerCase() === selectedDeptName?.toLowerCase()
      );

      if (!matched) throw new Error(`Department "${selectedDeptName}" not found.`);

      await createCounselor(adminToken, {
        user_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        department_id: matched.department_id,
      });

      setAddCounselorOpen(false);
      setEditingUser(null);
      triggerRefresh(); // Update the table
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save counselor.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Handler: Save Admin ──────────────────────────────────────────────────
  const handleSaveAdmin = async (formData: AdminForm) => {
    setSaveError(null);
    setIsSaving(true);
    try {
      await createAdmin(adminToken, {
        user_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        is_super_admin: formData.isSuperAdmin, 
      });

      setAddAdminOpen(false);
      triggerRefresh(); // Update the table
    } catch (err: any) {
      setSaveError(err.message || 'Failed to create admin.');
    } finally {
      setIsSaving(false);
    }
  };

  const deptNames = departments.map((d) => d.department_name);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex flex-col mb-4">
        <div className="flex flex-row space-x-1">
          <Link 
            href="/dashboard" 
            className="font-extrabold text-(--text-muted) hover:text-(--title) transition-colors"
          >
            Dashboard
          </Link>
          <span className="font-regular text-(--text-muted)">
            / Users
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-(--title) hidden sm:block">
            User Management
          </h1>
        </div>
      </div>

      {/* Error Banner */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
          {saveError}
        </div>
      )}

      <TableComponent<AppRow>
        key={refreshKey}
        tabs={['Students', 'Counselors']}
        columns={
          currentTab === 'Counselors'
            ? ['ID', 'Name', 'Email', 'Department', 'Status', 'Actions'] // Added Actions
            : ['ID', 'Name', 'Email', 'Year Level', 'Status']
        }
        fetchData={fetchData}
        renderRow={(item) => (
          <>
            <td 
              className="px-6 py-4 text-sm text-[var(--cyan)] font-mono cursor-pointer hover:underline" 
              onClick={() => setViewingUser(item)}
            >
              {item.user_id.substring(0, 8)}...
            </td>
            <td className="px-6 py-4 text-sm text-[var(--cyan)] font-medium">{item.name}</td>
            <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{item.email}</td>
            <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
              {isStudentRow(item) ? formatYearLevel(item.year_level) : (item as CounselorRow).department}
            </td>
            <td className="px-6 py-4 text-sm">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'
              }`}>
                {item.status}
              </span>
            </td>
          </>
        )}
        // 🚀 Logic for the Search Bar
        searchFilter={(item, query) =>
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        // 🚀 Logic for the Edit/Delete Actions
        onEdit={(user) => { 
          setSaveError(null); 
          setEditingUser(user as CounselorRow); 
        }}
        onDelete={(user) => setDeletingUser(user)}
        actionTab="Counselors" // Only show Edit/Delete on the Counselors tab
        
        // 🚀 Filter Options
        statusFilterOptions={[
          { label: 'All Status', value: 'All' },
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
        ]}
        yearFilterOptions={[
          { label: 'All Years', value: 'All' },
          { label: '1st Year', value: '1' },
          { label: '2nd Year', value: '2' },
          { label: '3rd Year', value: '3' },
          { label: '4th Year', value: '4' },
        ]}
        onTabChange={setCurrentTab}
        headerAction={
          <div className="flex gap-2">
            <button
              onClick={() => { setSaveError(null); setAddAdminOpen(true); }}
              className="flex items-center gap-1 px-3 py-3 h-full rounded-lg text-xs bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-all"
            >
              <AiOutlineUserAdd size={16} /> Add Admin
            </button>
            <button
              onClick={() => { setSaveError(null); setAddCounselorOpen(true); }}
              className="flex items-center gap-1 px-3 py-3 h-full rounded-lg text-xs bg-[var(--cyan)] text-white font-semibold hover:bg-[var(--cyan-dark)] transition-all"
            >
              <AiOutlinePlus size={16} /> Add Counselor
            </button>
          </div>
        }
      />

      {/* --- Modals --- */}
      <CounselorModal
        isOpen={addCounselorOpen || !!editingUser}
        onClose={() => { setAddCounselorOpen(false); setEditingUser(null); }}
        onSave={handleSaveCounselor}
        departmentOptions={deptNames}
        isLoading={isSaving || deptLoading}
        title={editingUser ? "Edit Counselor" : "Add Counselor"}
        initialData={editingUser ? {
          firstName: editingUser.name.split(' ')[0],
          lastName: editingUser.name.split(' ')[1] || '',
          email: editingUser.email,
          password: '',
          departments: [editingUser.department],
          startTime: '08:00',
          endTime: '17:00'
        } : null}
      />

      <AdminModal
        isOpen={addAdminOpen}
        onClose={() => setAddAdminOpen(false)}
        onSave={handleSaveAdmin}
        isLoading={isSaving}
      />

      <UserDetailsModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        data={viewingUser} 
      />
      
      <DeleteModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => { console.log('Delete logic placeholder'); setDeletingUser(null); }}
        description='Are you sure you want to delete this user?'
        itemName={deletingUser?.email}
      />
    </div>
  );
}