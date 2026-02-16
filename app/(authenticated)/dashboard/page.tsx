import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { authOptions } from "@/lib/authOptions";
import Sidebar from "@/components/Sidebar";
import DashboardClient from "./dashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/?callbackUrl=/dashboard");
  }

  return <DashboardClient />;
}
