'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlinePlus, AiOutlineUserAdd } from 'react-icons/ai';
import Link from 'next/link';

// components
import TableComponent from '@/components/Users/TableComponent';
import CounselorModal, { CounselorForm } from '@/components/Users/CounselorModal';
import AdminModal, { AdminForm } from '@/components/Users/AdminModal';
import UserDetailsModal from '@/components/Users/UserDetailsModal';
import DeleteModal from '@/components/DeleteModal';

// api & types
import { 
  getCounselors, 
  getStudents,
  getAdmins, 
  getDepartments, 
  createCounselor, 
  createAdmin,
  updateAdmin,
  updateAdminPassword,
  deleteCounselor,
  Department 
} from '@/lib/api/admin/management';
import { AppRow, CounselorRow, AdminRow, isStudentRow } from '@/components/Users/users.utils';
import { formatYearLevel, mapCounselor, mapStudent, mapAdmin } from '@/lib/api/admin/management.utils';

export default function UsersPage() {
  const { data: session } = useSession();
  const adminToken = session?.adminToken ?? '';

  // ui & refresh state
  const [currentTab, setCurrentTab] = useState('Students');
  const [refreshKey, setRefreshKey] = useState(0); // forces table to re-fetch
  const [addCounselorOpen, setAddCounselorOpen] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CounselorRow | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppRow | null>(null);
  const [viewingUser, setViewingUser] = useState<AppRow | null>(null);
  
  // logic state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // helper to trigger a data refresh
  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  // fetch departments for the counselor modal dropdown
  useEffect(() => {
    if (!adminToken) return;
    setDeptLoading(true);
    getDepartments(adminToken)
      .then(setDepartments)
      .catch((err) => console.error('Failed to load departments:', err))
      .finally(() => setDeptLoading(false));
  }, [adminToken]);

  // table data fetcher - depends on refreshkey
  const fetchData = useCallback(async (tab: string, cursor?: string) => {
    if (!adminToken) throw new Error('No admin token available.');

    if (tab === 'Counselors') {
      const res = await getCounselors(adminToken, 10, cursor);
      return {
        items: res.data.counselors.map(mapCounselor),
        hasMore: res.data.hasMore,
        nextCursor: res.data.nextCursor,
      };
    } else if (tab === 'Admins') {
      const res = await getAdmins(adminToken, 10, cursor);
      return {
        items: res.data.admins.map(mapAdmin),
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

  // handler: save counselor
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
      triggerRefresh(); // update the table
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save counselor.');
    } finally {
      setIsSaving(false);
    }
  };

  // handler: save or update admin
  const handleSaveAdmin = async (formData: AdminForm & { previousPassword?: string }) => {
    setSaveError(null);
    setIsSaving(true);
    try {
      if (editingAdmin) {
        // update basic info
        await updateAdmin(adminToken, editingAdmin.user_id, {
          user_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
        });

        // update password if a new one is provided
        if (formData.password) {
          await updateAdminPassword(adminToken, editingAdmin.user_id, {
            new_password: formData.password,
            previous_password: formData.previousPassword,
          });
        }
      } else {
        // create new admin
        await createAdmin(adminToken, {
          user_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password || '', // added fallback here to fix the ts error
          is_super_admin: formData.isSuperAdmin, 
        });
      }

      setAddAdminOpen(false);
      setEditingAdmin(null);
      triggerRefresh(); // update the table
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save admin.');
    } finally {
      setIsSaving(false);
    }
  };

  // handler: delete counselor
  const handleDeleteCounselor = async () => {
    if (!adminToken || !deletingUser) return;
    setSaveError(null);
    setIsSaving(true);
    try {
      await deleteCounselor(adminToken, deletingUser.id);
      setDeletingUser(null);
      triggerRefresh(); // update the table
    } catch (err: any) {
      setSaveError(err.message || 'Failed to delete user.');
    } finally {
      setIsSaving(false);
    }
  };

  const deptNames = departments.map((d) => d.department_name);

  return (
    <div className="space-y-6">
      {/* breadcrumb */}
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

      {/* error banner */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 rounded-xl">
          {saveError}
        </div>
      )}

      <TableComponent<AppRow>
        key={refreshKey}
        tabs={['Students', 'Counselors', 'Admins']}
        columns={
          currentTab === 'Counselors'
            ? ['ID', 'Name', 'Email', 'Department', 'Status'] 
            : currentTab === 'Admins'
            ? ['ID', 'Name', 'Email', 'Role', 'Status'] 
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
              {'is_super_admin' in item 
                ? (item.is_super_admin ? 'Super Admin' : 'Admin')
                : isStudentRow(item) 
                ? formatYearLevel((item as any).year_level) 
                : (item as CounselorRow).department}
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
        searchFilter={(item, query) =>
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        onEdit={(user) => { 
          setSaveError(null); 
          if (currentTab === 'Counselors') {
            setEditingUser(user as CounselorRow); 
          } else if (currentTab === 'Admins') {
            setEditingAdmin(user as AdminRow);
          }
        }}
        onDelete={(user) => setDeletingUser(user)}
        actionTab={currentTab === 'Students' ? undefined : currentTab} // enable actions for both counselors and admins
        
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

      {/* modals */}
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
        isOpen={addAdminOpen || !!editingAdmin}
        onClose={() => { setAddAdminOpen(false); setEditingAdmin(null); }}
        onSave={handleSaveAdmin}
        isLoading={isSaving}
        title={editingAdmin ? "Edit Admin" : "Add Admin"}
        initialData={editingAdmin ? {
          firstName: editingAdmin.name.split(' ')[0],
          lastName: editingAdmin.name.split(' ')[1] || '',
          email: editingAdmin.email,
          isSuperAdmin: editingAdmin.is_super_admin,
          password: '',
          previousPassword: ''
        } : null}
      />

      <UserDetailsModal 
        isOpen={!!viewingUser} 
        onClose={() => setViewingUser(null)} 
        data={viewingUser} 
      />
      
      <DeleteModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteCounselor}
        description='Are you sure you want to delete this user?'
        itemName={deletingUser?.email}
      />
    </div>
  );
}