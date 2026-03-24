'use client';
import React, { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlinePlus } from 'react-icons/ai';
import TableComponent from '@/components/Users/TableComponent';
import CounselorModal from '@/components/Users/CounselorModal';
import DeleteModal from '@/components/DeleteModal';
import Link from 'next/link';
import { CounselorForm } from '@/components/Users/CounselorModal';
import { CounselorRecord, StudentRecord } from '@/lib/api/admin/management.types';
import { getCounselors, getStudents } from '@/lib/api/admin/management';

// ── Row types ──────────────────────────────────────────────────────────────────

interface CounselorRow {
  id:            string;
  user_id:       string;
  name:          string;
  email:         string;
  department:    string;
  department_id: string;
  status:        string;
  year:          string;
}

interface StudentRow {
  id:         string;
  user_id:    string;
  name:       string;
  email:      string;
  department: string;
  status:     string;
  year_level: string;
  year:       string; // raw value from API e.g. "1", "2", "3", "4"
}

type AppRow = CounselorRow | StudentRow;

// ── Mappers ────────────────────────────────────────────────────────────────────

function mapCounselor(c: CounselorRecord): CounselorRow {
  return {
    id:            c.user_id,
    user_id:       c.user_id,
    name:          c.user_name,
    email:         c.email,
    department:    c.department_name,
    department_id: c.department_id,
    status:        'Active',
    year:          '',
  };
}

function mapStudent(s: StudentRecord): StudentRow {
  return {
    id:         s.user_id,
    user_id:    s.user_id,
    name:       s.user_name,
    email:      s.email,
    department: s.program_id,
    status:     s.is_deleted ? 'Inactive' : 'Active',
    year_level: s.year_level,
    year:       s.year_level, // ✅ raw API value: "1", "2", "3", "4"
  };
}

// ── Year display helper ────────────────────────────────────────────────────────

function formatYearLevel(raw: string): string {
  const map: Record<string, string> = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year',
  };
  return map[raw] ?? raw;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const { data: session } = useSession();
  const adminToken = session?.adminToken ?? '';

  const [currentTab,   setCurrentTab]   = useState('Students');
  const [addOpen,      setAddOpen]      = useState(false);
  const [editingUser,  setEditingUser]  = useState<CounselorRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppRow | null>(null);

  const fetchData = useCallback(
    async (tab: string, cursor?: string) => {
      if (!adminToken) {
        throw new Error('No admin token available. Please sign in again.');
      }
      if (tab === 'Counselors') {
        const res = await getCounselors(adminToken, 10, cursor);
        return {
          items:      res.data.counselors.map(mapCounselor),
          hasMore:    res.data.hasMore,
          nextCursor: res.data.nextCursor,
        };
      } else {
        const res = await getStudents(adminToken, 10, cursor);
        return {
          items:      res.data.students.map(mapStudent),
          hasMore:    res.data.hasMore,
          nextCursor: res.data.nextCursor,
        };
      }
    },
    [adminToken]
  );

  const handleSaveCounselor = (formData: CounselorForm) => {
    // TODO: wire up POST /management/counselors
    console.log('Save counselor:', formData);
    setAddOpen(false);
    setEditingUser(null);
  };

  const handleDeleteCounselor = () => {
    // TODO: wire up DELETE /management/counselors/:id
    console.log('Delete:', deletingUser);
    setDeletingUser(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col mb-4">
        <div className="flex flex-row space-x-1">
          <Link href="/dashboard" className="font-extrabold text-[var(--text-muted)] hover:text-[var(--title)] transition-colors">
            Dashboard
          </Link>
          <span className="font-regular text-[var(--text-muted)]">/ Users</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--title)] hidden sm:block">
          User Management
        </h1>
      </div>

      <TableComponent<AppRow>
        tabs={['Students', 'Counselors']}
        columns={
          currentTab === 'Counselors'
            ? ['ID', 'Name', 'Email', 'Department', 'Status']
            : ['ID', 'Name', 'Email', 'Year Level', 'Status']
        }
        fetchData={fetchData}
        renderRow={(item) => (
          <>
            <td className="px-6 py-4 text-sm text-[var(--text)] font-mono">
              {item.user_id.substring(0, 8)}...
            </td>
            <td className="px-6 py-4 text-sm text-[var(--cyan)] font-medium">
              {item.name}
            </td>
            <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
              {item.email}
            </td>
            {currentTab === 'Counselors' ? (
              <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                {item.department}
              </td>
            ) : (
              <td className="px-6 py-4 text-sm text-[var(--text-muted)]">
                {'year_level' in item ? formatYearLevel(item.year_level) : '—'}
              </td>
            )}
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
        statusFilterOptions={[
          { label: 'All Status', value: 'All'      },
          { label: 'Active',     value: 'Active'   },
          { label: 'Inactive',   value: 'Inactive' },
        ]}
        // ✅ Values now match raw API year_level: "1", "2", "3", "4"
        yearFilterOptions={[
          { label: 'All Years', value: 'All' },
          { label: '1st Year',  value: '1'   },
          { label: '2nd Year',  value: '2'   },
          { label: '3rd Year',  value: '3'   },
          { label: '4th Year',  value: '4'   },
        ]}
        actionTab="Counselors"
        onEdit={(user) => setEditingUser(user as CounselorRow)}
        onDelete={(user) => setDeletingUser(user)}
        onTabChange={(tab) => setCurrentTab(tab)}
        headerAction={
          currentTab === 'Counselors' ? (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1 px-3 py-3 h-full rounded-lg text-xs bg-[var(--cyan)] text-white font-semibold hover:bg-[var(--cyan-dark)] transition-colors"
            >
              <AiOutlinePlus size={16} /> Add Counselor
            </button>
          ) : null
        }
      />

      <CounselorModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSave={handleSaveCounselor} />

      <CounselorModal
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        title="Edit Counselor"
        submitText="Save Changes"
        initialData={
          editingUser ? {
            firstName:   editingUser.name?.split(' ')[0] ?? '',
            lastName:    editingUser.name?.split(' ')[1] ?? '',
            email:       editingUser.email,
            password:    '',
            departments: [editingUser.department],
            startTime:   '08:00',
            endTime:     '17:00',
          } : null
        }
        onSave={handleSaveCounselor}
      />

      <DeleteModal
        isOpen={deletingUser !== null}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteCounselor}
        title="Delete User"
        description="Are you sure you want to delete this user?"
        itemName={deletingUser?.email}
      />
    </div>
  );
}