'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AiOutlinePlus } from 'react-icons/ai';
import { FaEllipsisV, FaTrash, FaEdit } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DeleteModal from '@/components/DeleteModal';
import { useToastContext } from '@/lib/providers/ToastProvider';
import { getAllPromotionalContent, deletePromotionalContent } from '@/lib/api/admin/promotional';

const PromotionalManagement = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();

  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingPromo, setDeletingPromo] = useState<any | null>(null);

  // --- 1. Fetching Data ---
  useEffect(() => {
    const fetchAll = async () => {
      const token = (session as any)?.adminToken;
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await getAllPromotionalContent(token) as any;
        
        let dataArray = [];
        if (Array.isArray(response)) {
          dataArray = response;
        } else if (response.data && Array.isArray(response.data)) {
          dataArray = response.data;
        } else if (response.content && Array.isArray(response.content)) {
          dataArray = response.content;
        }

        setPromotions(dataArray);
      } catch (err) {
        console.error("Failed to load promotions:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchAll();
  }, [session]);

  // --- 2. Menu Logic ---
  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // --- 3. Delete Logic ---
  const handleDeleteConfirm = async () => {
    if (!deletingPromo) return;
    const token = (session as any)?.adminToken;
    if (!token) return;

    // Grab the exact property name returned from the API
    const idToDelete = deletingPromo.content_id; 

    if (!idToDelete) {
      showErrorToast("Error: Could not find the ID for this article.");
      return;
    }

    try {
      await deletePromotionalContent(token, idToDelete);
      
      setPromotions(prev => prev.filter(p => p.content_id !== idToDelete));
      setDeletingPromo(null);
      showSuccessToast("Promotion deleted successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to delete promotion.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <div className="flex flex-row space-x-1">
            <Link href="/adminDashboard" className="font-extrabold text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors">
              Dashboard
            </Link>
            <span className="font-regular text-[var(--foreground-muted)]">/ Promotional</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--title)] mt-2">Promotional Management</h1>
        </div>

        <button
          onClick={() => router.push('/promotional/create')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--cyan)] text-white font-bold rounded-xl hover:bg-[var(--cyan-dark)] transition-all active:scale-95"
        >
          <AiOutlinePlus size={18} />
          <span>Add New Promotion</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-[var(--foreground-muted)]">Loading...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-20 font-bold text-[var(--foreground-muted)]">No promotions found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promo) => (
            <div key={promo.content_id || Math.random()} className="relative bg-[var(--card)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm flex flex-col h-full">
              
              {/* Card Image & Menu */}
              <div className="relative h-44 w-full">
                
                {/* Conditional Image Rendering to prevent console warnings */}
                {promo.image ? (
                  <img 
                    src={promo.image} 
                    alt={promo.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--background-dark)] flex items-center justify-center text-xs font-bold text-[var(--foreground-muted)]">
                    No Image Available
                  </div>
                )}
                
                <div className="absolute top-4 right-4 promo-menu-container">
                  <button
                    onClick={(e) => toggleMenu(e, promo.content_id)}
                    className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-gray-800 shadow-lg hover:scale-105 transition-all"
                  >
                    <FaEllipsisV size={16} />
                  </button>

                  {/* Isolated Dropdown Menu */}
                  {openMenuId === promo.content_id && (
                    <div className="absolute right-0 mt-2 w-36 bg-[var(--card)] border border-[var(--line)] rounded-2xl shadow-xl z-30 py-2">
                      <button
                        className="w-full px-4 py-2 text-left text-sm font-bold text-[var(--title)] hover:bg-[var(--cyan)]/10 flex items-center justify-between"
                        onClick={() => router.push(`/promotional/edit/${promo.content_id}`)}
                      >
                        Edit <FaEdit className="text-[var(--cyan)]" />
                      </button>
                      <button
                        className="w-full px-4 py-2 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center justify-between"
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

              {/* Card Content */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-[var(--cyan)] uppercase tracking-wider">
                    {promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[var(--title)] mb-3 line-clamp-2">{promo.title}</h3>
                <p className="text-[var(--foreground-muted)] text-xs mb-6 line-clamp-3">{promo.headline}</p>

                <div className="mt-auto pt-4 border-t border-[var(--line)]">
                  <Link 
                    href={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://heron-wellnest.vercel.app'}/articles/${promo.content_id}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[var(--cyan)] hover:underline"
                  >
                    View Public Page
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteModal
        isOpen={deletingPromo !== null}
        onClose={() => setDeletingPromo(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Promotion"
        description={`Are you sure you want to delete "${deletingPromo?.title}"?`}
      />
    </div>
  );
};

export default PromotionalManagement;