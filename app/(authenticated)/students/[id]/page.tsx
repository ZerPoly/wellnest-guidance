import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import StudentProfileClient from "@/components/students/StudentProfileClient"; 

interface StudentProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StudentProfilePage(props: StudentProfilePageProps) {
  const params = await props.params;
  const studentId = params.id;

  console.log('=== SERVER SIDE PAGE ===');
  console.log('Student ID from URL params:', studentId);

  // 1. Authentication Check (Server-Side)
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log('No session found, redirecting to login');
    redirect(`/login?callbackUrl=/students/${studentId}`);
  }

  console.log('Session found, rendering StudentProfileClient with ID:', studentId);

  // 2. Render the Client Component with the studentId prop
  return <StudentProfileClient studentId={studentId} />;
}