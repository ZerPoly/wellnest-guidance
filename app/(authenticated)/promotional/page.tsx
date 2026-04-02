'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeleteModal from '@/components/DeleteModal'; // Ensure this path is correct

// Mock data
const INITIAL_PROMOTIONS = [
  {
    id: 'mental-health-awareness-2026',
    title: 'Prioritizing Mental Health in the Digital Age',
    teaser: 'Read our latest letter to students regarding digital wellness and emotional balance in a connected world.',
    image: '/img/umakbg.jpg',
    date: 'March 24, 2026',
  },
  {
    id: 'exam-season-support',
    title: 'Effective Coping Strategies for Exam Season',
    teaser: 'Our counselors share practical tips and encouraging messages to help you stay grounded during finals.',
    image: '/img/umakbg.jpg',
    date: 'March 15, 2026',
  },
  {
    id: 'cgcs-new-initiatives',
    title: 'Expanding Our Psychological First Aid Program',
    teaser: 'CGCS is proud to announce new community-focused initiatives starting this semester for all departments.',
    image: '/img/umakbg.jpg',
    date: 'March 01, 2026',
  },
];

const PromotionalManagement = () => {
  const [promotions, setPromotions] = useState(INITIAL_PROMOTIONS);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<any | null>(null); // State for modal
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".promo-menu-container")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteConfirm = () => {
    if (deletingPromo) {
      // API call logic would go here
      setPromotions(promotions.filter(p => p.id !== deletingPromo.id));
      setDeletingPromo(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <div className="flex flex-row space-x-1">
            <Link href="/dashboard" className="font-extrabold text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors">
              Dashboard
            </Link>
            <span className="font-regular text-[var(--foreground-muted)]">/ Promotional</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--title)] mt-2">
            Promotional Management
          </h1>
          <p className="text-[var(--foreground-muted)] text-sm">
            Create and manage articles displayed on the public landing page.
          </p>
        </div>

        <button 
          onClick={() => router.push('/promotional/create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--cyan)] text-white font-bold rounded-xl hover:bg-[var(--cyan-dark)] transition-all active:scale-95 shadow-md shadow-[var(--cyan)]/20"
        >
          <AiOutlinePlus size={18} />
          <span>Add New Promotion</span>
        </button>
      </div>

      {/* Grid of Manageable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {promotions.map((promo) => (
          <div key={promo.id} className="relative group bg-[var(--card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            
            {/* Image Section */}
            <div className="relative h-44 w-full overflow-hidden">
              <img 
                src={promo.image} 
                alt={promo.title} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              
              {/* Hamburger Menu Trigger */}
              <div className="absolute top-4 right-4 promo-menu-container">
                <button 
                  onClick={() => setOpenMenuId(openMenuId === promo.id ? null : promo.id)}
                  className="p-2 bg-[var(--card)] backdrop-blur-md rounded-xl text-[var(--title)] shadow-lg hover:scale-105 transition-all"
                >
                  <FaEllipsisV size={16} />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === promo.id && (
                  <div className="absolute right-0 mt-2 w-36 bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                      className="w-full px-4 py-2 text-left text-sm font-bold text-[var(--title)] hover:bg-[var(--cyan)]/10 hover:text-[var(--cyan)] transition-colors flex items-center justify-between"
                      onClick={() => {
                        router.push(`/promotional/edit/${promo.id}`);
                        setOpenMenuId(null);
                      }}
                    >
                      Edit <FaEdit className="text-[var(--cyan)]" />
                    </button>
                    <button 
                      className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-between"
                      onClick={() => {
                        setDeletingPromo(promo);
                        setOpenMenuId(null);
                      }}
                    >
                      Delete <FaTrash />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[var(--cyan)] uppercase tracking-wider">{promo.date}</span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded-full">Live</span>
              </div>
              
              <h3 className="text-lg font-extrabold text-[var(--title)] mb-3 leading-tight">
                {promo.title}
              </h3>
              
              <p className="text-[var(--foreground-muted)] text-xs leading-relaxed mb-6 line-clamp-3">
                {promo.teaser}
              </p>

              <div className="mt-auto pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <Link href={`/articles/${promo.id}`} target="_blank" className="text-xs font-bold text-[var(--cyan)] hover:underline">
                  View Public Page
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deletingPromo !== null}
        onClose={() => setDeletingPromo(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion"
        description="Are you sure you want to delete this promotional article? This action cannot be undone."
        itemName={deletingPromo?.title}
      />
    </div>
  );
};

export default PromotionalManagement;