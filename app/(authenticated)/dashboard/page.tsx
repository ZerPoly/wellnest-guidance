import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[var(--bg-light)] rounded-2xl p-8 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--title)] mb-2">
                Welcome to Dashboard
              </h1>
              <p className="text-[var(--text-muted)]">
                You are logged in as {session.user.role}
              </p>
            </div>
            <LogoutButton />
          </div>

          <div className="space-y-4 text-[var(--text-muted)]">
            <div className="bg-[var(--bg)] p-4 rounded-lg">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
                Email
              </p>
              <p className="text-lg text-[var(--title)]">
                {session.user.email}
              </p>
            </div>

            <div className="bg-[var(--bg)] p-4 rounded-lg">
              <p className="text-sm font-medium text-[var(--text-muted)] mb-1">
                Role
              </p>
              <p className="text-lg text-[var(--title)] capitalize">
                {session.user.role}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✓ Authentication successful
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
