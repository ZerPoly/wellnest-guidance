// app/promotional/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/lib/providers/ToastProvider';
import { HiOutlineChevronLeft, HiOutlineCloudUpload, HiX } from 'react-icons/hi';

// Import the specific API functions
import { updatePromotionalContent, getAllPromotionalContent } from '@/lib/api/admin/promotional';

const PromotionalEdit = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();

  // Form States
  const [title, setTitle] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [mainBody, setMainBody] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Fetch Existing Data ---
  useEffect(() => {
    const fetchExistingContent = async () => {
      const token = (session as any)?.adminToken;
      if (!token || !contentId) return;

      try {
        const response = await getAllPromotionalContent(token) as any;
        
        // 1. Safely extract the array just like we did on the management page
        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (response.data && Array.isArray(response.data)) {
          list = response.data;
        } else if (response.content && Array.isArray(response.content)) {
          list = response.content;
        }

        // 2. THE FIX: Search using content_id instead of id!
        const item = list.find((p: any) => p.content_id === contentId);

        if (item) {
          setTitle(item.title || '');
          setSummary(item.headline || '');
          setMainBody(item.summary || '');
          setImagePreview(item.image || '');
        } else {
          showErrorToast("Article not found.");
          router.push('/promotional');
        }
      } catch (err) {
        console.error("Failed to load article:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchExistingContent();
  }, [session, contentId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = (session as any)?.adminToken;
    if (!token) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('headline', summary);
      formData.append('summary', mainBody);
      
      // Only append image if a NEW one was selected
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await updatePromotionalContent(token, contentId, formData);
      showSuccessToast("Promotion updated successfully!");
      router.push('/promotional');
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold">Loading Data...</div>;

  return (
    <main className="min-h-screen space-y-4">
      <div className="flex flex-col mb-2">
        <div className="flex flex-row items-center space-x-1">
          <Link href="/promotional" className="flex items-center font-extrabold text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors">
            <HiOutlineChevronLeft className="mr-1" /> Promotional
          </Link>
          <span className="font-regular text-[var(--foreground-muted)]">/ Edit Promotion</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--title)] mt-2">Edit Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-3xl p-8 space-y-8 shadow-sm border border-[var(--line)]">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)]">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-transparent border-b border-[var(--line)] text-[var(--title)] font-extrabold text-xl focus:outline-none focus:border-[var(--cyan)]"
            required
          />
        </div>

        {/* Image Preview / Upload */}
          <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[var(--line)] bg-black">
            
            {/* Check if imagePreview has text inside it before rendering the img tag */}
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--foreground-muted)] font-bold">
                No image uploaded
              </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black px-4 py-2 rounded-lg font-bold"
              >
                Change Image
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

        {/* Headline */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)]">Headline</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-4 bg-[var(--background-dark)] rounded-2xl border border-[var(--line)]"
            rows={2}
            required
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)]">Content</label>
          <textarea
            value={mainBody}
            onChange={(e) => setMainBody(e.target.value)}
            className="w-full p-6 bg-[var(--background-dark)] rounded-2xl border border-[var(--line)]"
            rows={10}
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-8 py-4 font-bold">Cancel</button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="py-4 px-10 rounded-full bg-[var(--cyan)] text-white font-extrabold"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default PromotionalEdit;