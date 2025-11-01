'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// --- Components ---
// Note: These imports assume they are correctly placed in your project root
import ConsultationVolumeBox from '@/components/dashboard/ConsultationStatistics';
import FlaggedStudents from "@/components/dashboard/FlaggedStudents";
import ConsultationsTable from "@/components/dashboard/ConsultationTable"; 
import FilterDropdown from "@/components/dashboard/FilterDropdown"; 


// --- Placeholder Filter Types (Mandatory for compilation) ---
interface Consultation { email: string; type: string; }
const consultations: Consultation[] = [];
const previousConsultations: Consultation[] = []; 
// --- END Placeholder Filter Types ---


interface DashboardContentProps {}

const DashboardContent = ({}: DashboardContentProps) => {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'Guest';
  const userEmail = session?.user?.email;
  const userNamePart = userEmail ? userEmail.split('@')[0] : 'User';

  // Filter states for charts and tables
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("All");
  const [chartFilter, setChartFilter] = useState<string>("Weekly");

  const filterDate = ["Weekly", "Monthly", "Yearly"];

  // The actual filtering logic will be passed down to ConsultationTable and Chart Components
  // For DashboardClient, we just define the states that control the data flow.

  return (
    <div className="space-y-6">
      
      {/* Header (Breadcrumb and Welcome Message) */}
      <div className="flex flex-col mb-4">
        <div className="flex flex-row space-x-1">
          <Link href="/dashboard" className="font-extrabold text-[var(--text-muted)] hover:text-[var(--title)] transition-colors">
            Dashboard
          </Link>
          <a className="font-regular text-[var(--text-muted)]">
            / Home
          </a>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--title)] hidden sm:block">
            {`Welcome back, ${userNamePart}!`}
          </h1>
        </div>
      </div>
      
      {/* Chart Filter (Dropdown) */}
      <div className="flex gap-2 justify-end">
        {/* NOTE: FilterDropdown component needs to be created or provided */}
        <FilterDropdown
          label="Timeframe"
          options={filterDate}
          selected={chartFilter}
          onChange={setChartFilter}
        />
      </div>
      
      {/* KPI and Chart Row */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Chart 1: Consultation Volume */}
        <div className="flex-1">
          <ConsultationVolumeBox timeFilter={chartFilter} />
        </div>
        {/* Chart 2: Student Classification/Flagged */}
        <div className="flex-1">
          <FlaggedStudents timeFilter={chartFilter} />
        </div>
      </div>

      {/* Consultation Table Section */}
      <div className="my-6">
        {/* NOTE: You need to pass the filter states to the ConsultationsTable component */}
        <ConsultationsTable
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sessionTypeFilter={sessionTypeFilter}
          setSessionTypeFilter={setSessionTypeFilter}
        />
      </div>
    </div>
  );
};

// NOTE: We don't need a Server Component here if the main layout already checks auth.
export default DashboardContent;
