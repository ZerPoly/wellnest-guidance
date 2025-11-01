import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; 
import StudentProfileClient from "@/components/students/StudentProfileClient"; 

interface StudentProfilePageProps {
  params: {
    id: string; // The student_id from the URL
  };
}

export default async function StudentProfilePage({ params }: StudentProfilePageProps) {
  // Safely access the dynamic route parameter
  const { id: studentId } = params;

  // 1. Authentication Check (Server-Side)
  const session = await getServerSession(authOptions);

  if (!session) {
    // Redirect unauthenticated users
    redirect(`/login?callbackUrl=/students/${studentId}`);
  }

  // 2. Render the Client Component
  return <StudentProfileClient studentId={studentId} />;
}