"use client";

import { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts";

const CHART_TITLE = "Flagged Students";
const CHART_HEIGHT = 380;
const CHART_WIDTH = 300;

export default function FlaggedStudents() {
  const [data, setData] = useState<{ id: number; value: number; label: string; color: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Missing authentication token");

      const API = process.env.NEXT_PUBLIC_HW_USERS_API;
      const res = await fetch(`${API}/api/v1/users/students?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || "Failed to fetch");

      const classifications = json.data.classifications || [];

      const inCrisis = classifications.filter(
        (s: any) => s.classification === "InCrisis" && s.is_flagged
      ).length;

      const struggling = classifications.filter(
        (s: any) => s.classification === "Struggling" && s.is_flagged
      ).length;

      const formattedData = [
        { id: 0, value: inCrisis, label: "In-Crisis", color: "hsl(180, 70%, 50%)" },
        { id: 1, value: struggling, label: "Struggling", color: "hsl(263, 83%, 34%)" },
      ];

      setData(formattedData);
      setTotal(inCrisis + struggling);
    } catch (error) {
      console.error("Pie chart fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const cx = CHART_WIDTH / 2;
  const cy = CHART_HEIGHT / 2;

  return (
    <div className="flex-1 border border-[var(--outline)] h-full bg-[var(--bg)] p-4 rounded-2xl shadow-md flex flex-col relative">
      <h2 className="text-xl font-bold text-[var(--text-muted)] mb-4">{CHART_TITLE}</h2>

      {loading ? (
  <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
    Loading...
  </div>
) : total === 0 ? (
  <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
    No flagged students at the moment
  </div>
) : (
  <div className="flex items-center justify-center w-full">
    <PieChart
      series={[
        {
          data,
          innerRadius: 80,
          outerRadius: 100,
          paddingAngle: 5,
          cornerRadius: 5,
          startAngle: -90,
          endAngle: 270,
          cx,
          cy,
        },
      ]}
      height={CHART_HEIGHT}
      width={CHART_WIDTH}
      sx={{
        "text": {
          fontFamily: "Metropolis, sans-serif !important",
          fill: "var(--text-muted)",
        },
      }}
      slotProps={{
        legend: {
          direction: "row",
          position: { vertical: "bottom", horizontal: "middle" },
          padding: 10,
        },
      }}
      margin={{ top: 5, bottom: 20, left: 5, right: 5 }}
    >
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-3xl font-bold fill-[var(--text-color)]"
        style={{ fontFamily: "Metropolis, sans-serif" }}
      >
        {total}
      </text>
    </PieChart>
  </div>
)}
    </div>
  );
}
