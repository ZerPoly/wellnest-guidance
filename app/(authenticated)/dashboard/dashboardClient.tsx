'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import ConsultationStatistics from '@/components/dashboard/ConsultationStatistics';
import FlaggedStudents from "@/components/dashboard/FlaggedStudents";
import ConsultationsTable from "@/components/dashboard/ConsultationTable"; 
import MoodSummaryStatistics from "@/components/dashboard/MoodSummaryStatistics";

interface DashboardContentProps {}

const DashboardContent = ({}: DashboardContentProps) => {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  const userNamePart = userEmail ? userEmail.split('@')[0] : 'User';

  // filter states for charts and tables
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("All");
  const [chartFilter] = useState<string>("Weekly");

  return (
    <div className="space-y-6">
      {/* header (breadcrumb and welcome message) */}
      <div className="flex flex-col mb-4">
        <div className="flex flex-row space-x-1">
          <Link 
            href="/dashboard" 
            className="font-extrabold text-(--text-muted) hover:text-(--title) transition-colors"
          >
            Dashboard
          </Link>
          <span className="font-regular text-(--text-muted)">
            / Home
          </span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-(--title) hidden sm:block">
            {`Welcome back, ${userNamePart}!`}
          </h1>
        </div>
      </div>
      
      {/* kpi and chart row */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* chart 1: consultation volume */}
        <div className="flex-1">
          <ConsultationStatistics timeFilter={chartFilter} />
        </div>
        {/* chart 2: student classification/flagged */}
        <div className="flex-1">
          <FlaggedStudents timeFilter={chartFilter} />
        </div>
      </div>

      {/* Mood Summary Statistics, mood of total users idk kay faith */}
      <MoodSummaryStatistics />

      {/* consultation table section */}
      <div className="my-6">
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

export default DashboardContent;