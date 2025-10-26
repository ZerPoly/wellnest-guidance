'use client';
import React from 'react';

// Define the component using the modern explicit typing pattern
const Dashboard = ({}: {}) => (
  <div className="p-8 bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[80vh]">
    <h1 className="text-3xl font-extrabold text-gray-800">Dashboard Overview</h1>
    <p className="mt-2 text-gray-600">This area will house high-level analytics for the portal.</p>
    <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700">
      <span className="font-semibold">Status:</span> Ready for data visualization implementation (Charts, KPIs, Recent Activity).
    </div>
  </div>
);

export default Dashboard;
