import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";
import { authOptions } from "@/lib/authOptions";

import AuthenticatedLayoutClient from "@/components/AuthenticatedLayoutClient";


interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default async function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect("/"); 
    }
    
    return <AuthenticatedLayoutClient>{children}</AuthenticatedLayoutClient>;
}
