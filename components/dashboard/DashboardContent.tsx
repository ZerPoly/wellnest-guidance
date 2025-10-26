'use client';

import React, { useState, ChangeEvent } from "react";
import FilterDropdown from "../FilterDropdown";
import DonutChart from "../DonutChart";
import DashboardBarChart from "../DashboardBarChart";
import {
  consultations,
  previousConsultations,
  type Consultation,
} from "../../data/data";
import { Search } from "lucide-react";

const DashboardContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Upcoming Consultations");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("All");
  const [chartFilter, setChartFilter] = useState<string>("Weekly");

  const filterOptions = ["All", "Counseling", "Routine Interview"];
  const filterDate = ["Weekly", "Monthly", "Yearly"];

  // Filtered consultations for table
  const upcomingConsultations: Consultation[] = consultations
    .filter((c) => sessionTypeFilter === "All" || c.type.toLowerCase() === sessionTypeFilter.toLowerCase())
    .filter((c) => c.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredPreviousConsultations: Consultation[] = previousConsultations
    .filter((c) => sessionTypeFilter === "All" || c.type.toLowerCase() === sessionTypeFilter.toLowerCase())
    .filter((c) => c.email.toLowerCase().includes(searchQuery.toLowerCase()));

  // Badge styling for session type
  const renderSessionTypeBadge = (type: string) => {
    const isCounseling = type.toLowerCase() === "counseling";
    const bgColor = isCounseling ? "bg-[#03BFBF]" : "bg-[#460F9D]";
    return (
      <span className={`text-md justify-center font-semibold rounded-md p-3 ${bgColor} text-[#E4E6E7]`}>
        {type}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-8 text-gray-800 mb-20">
      {/* Header */}
      <div>
        <p className="text-sm text-gray-500">Counselor / Dashboard</p>
        <h1 className="text-3xl font-bold text-[#460F9D]">
          Welcome, Sir John Doe!
        </h1>
      </div>

      {/* Chart Filter */}
      <div className="flex gap-2 justify-end">
        <FilterDropdown
          label="Filter"
          options={filterDate}
          selected={chartFilter}
          onChange={setChartFilter}
        />
      </div>

      {/* Graphs Section */}
      <div className="graphs grid grid-cols-1 lg:grid-cols-2 gap-5 col-span-2">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col  justify-start">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6">
            Consultation Statistics
          </h3>
          <div className="h-auto flex items-center justify-center">
            <DashboardBarChart selectedFilter={chartFilter} />
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col ">
          <h3 className="text-2xl font-semibold text-gray-800 mb-6 w-full self-start">
            Student Classification
          </h3>
          <div className="h-auto flex items-center justify-center">
            <DonutChart />
          </div>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white rounded-xl shadow-sm space-x-6">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-lg">Consultations</h3>
            <div className="flex bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setActiveTab("Upcoming Consultations")}
                className={`px-4 py-1.5 text-md font-semibold rounded-full transition-all ${
                  activeTab === "Upcoming Consultations" ? "bg-[#03BFBF] text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Upcoming Consultations
              </button>
              <button
                onClick={() => setActiveTab("Previous Consultations")}
                className={`px-4 py-1.5 text-md font-semibold rounded-full transition-all ${
                  activeTab === "Previous Consultations" ? "bg-[#03BFBF] text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Previous Consultations
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full max-w-xs pl-10 pr-4 py-2 bg-gray-100 border-[#7D8087] rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-700"
              />
            </div>

            {/* Session Type Filter */}
            <FilterDropdown
              label="Filter"
              options={filterOptions}
              selected={sessionTypeFilter}
              onChange={setSessionTypeFilter}
            />
          </div>
        </div>

        <div className="overflow-auto flex-1 px-6 py-6">
          <table className="min-w-full text-lg">
            <thead className="bg-[#F0F1F5]">
              <tr>
                <th className="px-6 py-3 text-left font-bold text-[#46484E]">Email</th>
                <th className="px-6 py-3 text-left font-bold text-[#46484E]">Session Type</th>
                <th className="px-6 py-3 text-left font-bold text-[#46484E]">Time</th>
                <th className="px-6 py-3 text-left font-bold text-[#46484E]">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeTab === "Upcoming Consultations" ? upcomingConsultations : filteredPreviousConsultations).map((c, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderSessionTypeBadge(c.type)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;