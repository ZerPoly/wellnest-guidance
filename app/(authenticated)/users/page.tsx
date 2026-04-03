'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlinePlus, AiOutlineUserAdd, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import Link from 'next/link';

// components
import TableComponent from '@/components/Users/TableComponent';
import CounselorModal, { CounselorForm } from '@/components/Users/CounselorModal';
import AdminModal, { AdminForm } from '@/components/Users/AdminModal';
import UserDetailsModal from '@/components/Users/UserDetailsModal';
import DeleteModal from '@/components/DeleteModal';
import { ToastContainer, ToastType } from '@/components/Toast'; // adjust import path if needed

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
  updateCounselor,
  updateCounselorPassword,
  deleteCounselor,
  Department 
} from '@/lib/api/admin/management';
import { AppRow, CounselorRow, AdminRow, isStudentRow } from '@/components/Users/users.utils';
import { formatYearLevel, mapCounselor, mapStudent, mapAdmin } from '@/lib/api/admin/management.utils';

export default function UsersPage() {
  const { data: session } = useSession();
  const adminToken = session?.adminToken ?? '';
  
  // extract current user info for authorization rules
  const currentUserId = (session?.user as any)?.id || '';
  const currentUserRole = session?.user?.role || '';

  // ui & refresh state
  const [currentTab, setCurrentTab] = useState('Students');
  const [refreshKey, setRefreshKey] = useState(0); 
  const [addCounselorOpen, setAddCounselorOpen] = useState(false);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CounselorRow | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppRow | null>(null);
  const [viewingUser, setViewingUser] = useState<AppRow | null>(null);
  
  // toast state
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: ToastType; duration?: number }>>([]);

  // logic state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // toast helpers
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  // table data fetcher
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

      if (editingUser) {
        // update basic info
        await updateCounselor(adminToken, editingUser.user_id, {
          user_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          department_id: matched.department_id,
        });

        // update password if the admin provided a new one
        if (formData.password) {
          await updateCounselorPassword(adminToken, editingUser.user_id, {
            new_password: formData.password,
          });
        }
        showToast("Counselor updated successfully!", "success");
      } else {
        // create new counselor
        await createCounselor(adminToken, {
          user_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password || '',
          department_id: matched.department_id,
        });
        showToast("Counselor added successfully!", "success");
      }

      setAddCounselorOpen(false);
      setEditingUser(null);
      triggerRefresh(); 
    } catch (err: any) {
      const msg = err.message || 'Failed to save counselor.';
      setSaveError(msg);
      showToast(msg, "error");
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
        showToast("Admin updated successfully!", "success");
      } else {
        // create new admin
        await createAdmin(adminToken, {
          user_name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          password: formData.password || '',
          is_super_admin: formData.isSuperAdmin, 
        });
        showToast("Admin added successfully!", "success");
      }

      setAddAdminOpen(false);
      setEditingAdmin(null);
      triggerRefresh(); 
    } catch (err: any) {
      const msg = err.message || 'Failed to save admin.';
      setSaveError(msg);
      showToast(msg, "error");
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
      triggerRefresh(); 
      showToast("User deleted successfully!", "success");
    } catch (err: any) {
      const msg = err.message || 'Failed to delete user.';
      setSaveError(msg);
      showToast(msg, "error");
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

      <TableComponent<AppRow>
        tabs={['Students', 'Counselors', 'Admins']}
        columns={
          currentTab === 'Counselors'
            ? ['ID', 'Name', 'Email', 'Department', 'Status', 'Actions']
            : currentTab === 'Admins'
            ? ['ID', 'Name', 'Email', 'Role', 'Status', 'Actions'] 
            : ['ID', 'Name', 'Email', 'Year Level', 'Status']
        }
        fetchData={fetchData}
        renderRow={(item) => {
          // evaluate authorization for actions
          let canEdit = false;
          let canDelete = false;

          if (currentTab === 'Counselors') {
            canEdit = true;
            canDelete = true;
          } else if (currentTab === 'Admins') {
            const adminItem = item as AdminRow;
            if (currentUserRole === 'admin') {
              // admin: can only edit their own info
              canEdit = adminItem.user_id === currentUserId;
            } else if (currentUserRole === 'super_admin') {
              // super admin: can edit own info and non-super-admins
              canEdit = adminItem.user_id === currentUserId || !adminItem.is_super_admin;
            }
          }

          return (
            <>
              <td 
                className="px-6 py-4 text-sm text-[var(--cyan)] font-mono cursor-pointer hover:underline" 
                onClick={() => setViewingUser(item)}
              >
                {item.user_id.substring(0, 8)}...
              </td>
              <td className="px-6 py-4 text-sm text-[var(--text-muted)] font-semibold">{item.name}</td>
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
              
              {/* actions cell */}
              {(currentTab === 'Counselors' || currentTab === 'Admins') && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button 
                        onClick={() => {
                          setSaveError(null); 
                          if (currentTab === 'Counselors') {
                            setEditingUser(item as CounselorRow); 
                          } else if (currentTab === 'Admins') {
                            setEditingAdmin(item as AdminRow);
                          }
                        }} 
                        className="p-2 rounded-lg text-[var(--cyan)] bg-[var(--cyan)]/10 hover:bg-[var(--cyan)]/20 transition-colors"
                      >
                        <AiOutlineEdit size={18} />
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        onClick={() => setDeletingUser(item)} 
                        className="p-2 rounded-lg text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                      >
                        <AiOutlineDelete size={18} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </>
          );
        }}
        searchFilter={(item, query) =>
          item.email.toLowerCase().includes(query.toLowerCase()) ||
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        onTabChange={setCurrentTab}
        headerAction={
          <div className="flex gap-2">
            {currentUserRole === 'super_admin' && (
              <button
                onClick={() => { setSaveError(null); setAddAdminOpen(true); }}
                className="flex items-center gap-1 px-3 py-3 h-full rounded-lg text-xs bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-all"
              >
                <AiOutlineUserAdd size={16} /> Add Admin
              </button>
            )}
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
        currentUserId={currentUserId}
        targetUserId={editingAdmin?.user_id}
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

      {/* toast notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}