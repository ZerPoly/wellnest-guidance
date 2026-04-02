"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/lib/providers/ToastProvider';
import { HiOutlineChevronLeft, HiOutlineCloudUpload, HiX } from 'react-icons/hi';

const PromotionalEdit = () => {
  const { id } = useParams(); // Gets the ID from the URL
  const router = useRouter();
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();

  // Form States
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [mainBody, setMainBody] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Mock Fetch Data (Replace with API call) ---
  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        // In a real app: const data = await getPromotionById(id);
        // Simulating fetch delay:
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mocking the data that would come back from your database
        const mockData = {
            title: 'Prioritizing Mental Health in the Digital Age',
            image: '/img/umakbg.jpg',
            teaser: 'Read our latest letter to students regarding digital wellness...',
            body: 'Full article content goes here...'
        };

        setTitle(mockData.title);
        setImagePreview(mockData.image);
        setSummary(mockData.teaser);
        setMainBody(mockData.body);
        setLoading(false);
      } catch (err) {
        showErrorToast("Could not load promotional data.");
        router.push('/promotional');
      }
    };

    fetchPromoData();
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // API call: await updatePromotion(id, { title, summary, mainBody, imagePreview });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccessToast("Promotion updated successfully!");
      router.push('/promotional');
    } catch (error) {
      showErrorToast("Failed to update promotion.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Promotion...</div>;

  return (
    <main className="min-h-screen space-y-4">
      {/* Header */}
      <div className="flex flex-col mb-2">
        <div className="flex flex-row items-center space-x-1">
          <Link href="/promotional" className="flex items-center font-extrabold text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors">
            <HiOutlineChevronLeft className="mr-1" /> Promotional
          </Link>
          <span className="font-regular text-[var(--foreground-muted)]">/ Edit Promotion</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--title)] mt-2">Edit: {title}</h1>
      </div>

      <form onSubmit={handleUpdate} className="bg-[var(--card)] rounded-3xl p-8 space-y-8 shadow-sm border border-[var(--line)]">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Article Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-transparent border-b border-[var(--line)] text-[var(--title)] font-extrabold text-3xl focus:outline-none focus:border-[var(--cyan)] transition-all"
            required
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Headliner Image</label>
          <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          
          <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[var(--line)] bg-black">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-bold hover:bg-white/40 transition-all"
                >
                    Change Image
                </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Quick Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full p-4 bg-[var(--background-dark)] rounded-2xl border border-[var(--line)] text-base text-[var(--foreground)] focus:outline-none focus:border-[var(--cyan)] resize-none transition-all"
            required
          />
        </div>

        {/* Main Body */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Main Article Body</label>
          <textarea
            value={mainBody}
            onChange={(e) => setMainBody(e.target.value)}
            rows={12}
            className="w-full p-6 bg-[var(--background-dark)] rounded-2xl border border-[var(--line)] text-[var(--foreground)] text-base focus:outline-none focus:border-[var(--cyan)] resize-none transition-all"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={() => router.back()}
            className="py-4 px-8 rounded-full border border-[var(--line)] text-[var(--foreground-muted)] font-bold hover:bg-[var(--background-dark)] transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="py-4 px-10 rounded-full bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] transition-all font-extrabold text-white shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update Article'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default PromotionalEdit;