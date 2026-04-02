"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useToastContext } from '@/lib/providers/ToastProvider';
import { HiOutlineChevronLeft, HiOutlineCloudUpload, HiX } from 'react-icons/hi';

// Validation Constants
const MIN_TITLE_LENGTH = 5;
const MAX_TITLE_LENGTH = 100;
const MAX_SUMMARY_LENGTH = 250;

const PromotionalCreate = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { error: showErrorToast, success: showSuccessToast } = useToastContext();

  // Form States
  const [title, setTitle] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [summary, setSummary] = useState('');
  const [mainBody, setMainBody] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);
  const dataRef = useRef({ title, summary, mainBody });

  useEffect(() => {
    dataRef.current = { title, summary, mainBody };
  }, [title, summary, mainBody]);

  // --- 1. Recovery Logic ---
  useEffect(() => {
    const savedTitle = localStorage.getItem('promo_draft_title');
    const savedSum = localStorage.getItem('promo_draft_sum');
    const savedBody = localStorage.getItem('promo_draft_body');
    if (savedTitle) setTitle(savedTitle);
    if (savedSum) setSummary(savedSum);
    if (savedBody) setMainBody(savedBody);
    setIsLoaded(true);
  }, []);

  // --- 2. Auto-Save Logic ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('promo_draft_title', title);
      localStorage.setItem('promo_draft_sum', summary);
      localStorage.setItem('promo_draft_body', mainBody);
    }
  }, [title, summary, mainBody, isLoaded]);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        showErrorToast("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.length < MIN_TITLE_LENGTH) {
      showErrorToast(`Title must be at least ${MIN_TITLE_LENGTH} characters.`);
      return;
    }
    if (!imageFile) {
      showErrorToast("Please upload a headliner image.");
      return;
    }

    setIsSubmitting(true);
    isSubmittingRef.current = true;

    try {
      // Logic for FormData upload (for images)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('body', mainBody);
      formData.append('image', imageFile);

      // Replace with your actual API call: await uploadPromotion(formData, token)
      console.log("Submitting FormData...");
      await new Promise(resolve => setTimeout(resolve, 1500));

      ['title', 'sum', 'body'].forEach(key => localStorage.removeItem(`promo_draft_${key}`));
      showSuccessToast("Promotion published successfully!");
      router.push('/dashboard/promotional');
    } catch (error) {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
      showErrorToast("Failed to publish promotion.");
    }
  };

  return (
    <main className="min-h-screen space-y-4">
      {/* Header / Breadcrumbs */}
      <div className="flex flex-col mb-2">
        <div className="flex flex-row items-center space-x-1">
          <Link href="/promotional" className="flex items-center font-extrabold text-[var(--foreground-muted)] hover:text-[var(--title)] transition-colors">
            <HiOutlineChevronLeft className="mr-1" /> Promotional
          </Link>
          <span className="font-regular text-[var(--foreground-muted)]">/ Create Promotion</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--title)] mt-2">New Promotional Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--card)] rounded-3xl p-8 space-y-8 shadow-sm border border-[var(--line)]">
        
        {/* Title Input (Clean Style) */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add your article title here..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 bg-transparent border-b border-[var(--line)] text-[var(--title)] font-extrabold text-xl focus:outline-none focus:border-[var(--cyan)] transition-all"
            required
            disabled={isSubmitting}
          />
          <div className="text-right text-[10px] text-[var(--foreground-muted)] font-bold">
            {title.length} / {MAX_TITLE_LENGTH}
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Headliner Image</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          {!imagePreview ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-[var(--line)] rounded-2xl bg-[var(--background-dark)] hover:bg-[var(--background)] hover:border-[var(--cyan)] transition-all group"
            >
              <HiOutlineCloudUpload size={40} className="text-[var(--foreground-muted)] group-hover:text-[var(--cyan)] transition-colors" />
              <span className="mt-2 text-sm font-bold text-[var(--foreground-muted)]">Click to upload image</span>
              <span className="text-xs text-[var(--foreground-muted)] opacity-60">PNG, JPG or WEBP (Max 5MB)</span>
            </button>
          ) : (
            <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-[var(--line)] shadow-inner bg-black">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-all"
              >
                <HiX size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Quick Summary Section */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Quick Summary</label>
          <textarea
            placeholder="A short hook to catch the student's attention..."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full p-4 bg-[var(--background-dark)] rounded-2xl border border-[var(--line)] text-base text-[var(--foreground)] focus:outline-none focus:border-[var(--cyan)] resize-none transition-all"
            required
            disabled={isSubmitting}
          />
          <div className="text-right text-[10px] text-[var(--foreground-muted)] font-bold">
            {summary.length} / {MAX_SUMMARY_LENGTH}
          </div>
        </div>

        {/* Main Body Content */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[var(--foreground-muted)] ml-1">Main Article Body</label>
          <textarea
            placeholder="Write the full content of your article here..."
            value={mainBody}
            onChange={(e) => setMainBody(e.target.value)}
            rows={12}
            className="w-full p-6 bg-[var(--background-dark)] rounded-2xl border border-[var(--line)] text-[var(--foreground)] text-base focus:outline-none focus:border-[var(--cyan)] resize-none transition-all"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={() => router.back()}
            className="py-4 px-8 rounded-full border border-[var(--line)] text-[var(--foreground-muted)] font-bold hover:bg-[var(--background-dark)] transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-4 px-10 rounded-full bg-[var(--cyan)] hover:bg-[var(--cyan-dark)] transition-all font-extrabold text-white shadow-lg disabled:opacity-50 active:scale-95"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Article'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default PromotionalCreate;