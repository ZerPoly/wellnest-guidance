'use client';
import React, { useState } from 'react'; // ← remove unused imports
import { AiOutlinePlus } from 'react-icons/ai'; // ← only keep what you use
import TableComponent from '@/components/Users/TableComponent';
import { studentUsers, counselorUsers, AppUser } from '@/data/data';
import CounselorModal from '@/components/Users/CounselorModal';
import DeleteModal from '@/components/DeleteModal';

export default function UsersPage() {
  const [currentTab,  setCurrentTab]  = useState('Students');
  const [addOpen,     setAddOpen]     = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUser | null>(null);

  return (
    <div className="p-6">
      <p className="text-sm text-gray-500 mb-1">Admin</p>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-6">User Management</h1>

      <TableComponent<AppUser>
        title="Users"
        tabs={['Students', 'Counselors']}

        columns={currentTab === 'Counselors'
          ? ['ID', 'Name', 'Email', 'Department', 'Status']
          : ['ID', 'Email', 'Department', 'Status']
        }

        fetchData={(tab) => tab === 'Students' ? studentUsers : counselorUsers}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 text-sm text-gray-500">{item.id}</td>
            {currentTab === 'Counselors' && (
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.name}</td>
            )}
            <td className="px-6 py-4 text-sm text-gray-900">{item.email}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{item.department}</td>
            <td className="px-6 py-4 text-sm">{item.status}</td>
          </>
        )}
              searchFilter={(item, query) =>
                item.email.toLowerCase().includes(query.toLowerCase()) ||
                item.department.toLowerCase().includes(query.toLowerCase()) ||
                item.status.toLowerCase().includes(query.toLowerCase())
              }
              filterOptions={[
                { label: 'All',      value: 'All'      },
                { label: 'Active',   value: 'Active'   },
                { label: 'Inactive', value: 'Inactive' },
              ]}
              actionTab="Counselors"
              onEdit={(user) => setEditingUser(user)}
              onDelete={(user) => setDeletingUser(user)}
              onTabChange={(tab) => setCurrentTab(tab)}
              headerAction={currentTab === 'Counselors' ? (
                <button onClick={() => setAddOpen(true)}
                  className="flex items-center gap-1 px-3 py-3 h-full rounded-lg text-xs bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors">
                  <AiOutlinePlus size={16} /> Add Counselor
                </button>
              ) : null}
            />

            {/* add counselor modal */}
            <CounselorModal
              isOpen={addOpen}
              onClose={() => setAddOpen(false)}
              onSave={(formData) => {
                console.log('new counselor:', formData);
                setAddOpen(false);
              }}
            />

            {/* edit modal */}
            <CounselorModal
              isOpen={editingUser !== null}
              onClose={() => setEditingUser(null)}
              title="Edit Counselor"
              submitText="Save Changes"
              initialData={editingUser ? {
                firstName:   editingUser.name?.split(' ')[0] ?? '',
                lastName:    editingUser.name?.split(' ')[1] ?? '', 
                email:       editingUser.email,
                password:    '',
                departments: [editingUser.department],
                startTime:   '08:00',
                endTime:     '17:00',
              } : null}
              onSave={(formData) => {
                console.log('updated:', formData);
                setEditingUser(null);
              }}
            />

            <DeleteModal
              isOpen={deletingUser !== null}
              onClose={() => setDeletingUser(null)}
              onConfirm={() => setDeletingUser('deleted:', deletingUser)}
              title="Delete Counselor"
              description='Are you sure you want to delete this counselor? This action cannot be undone.'
              itemName={deletingUser?.email}
            />
          </div>
        );
}