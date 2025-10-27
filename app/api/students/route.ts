import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { fetchStudents, FetchStudentsParams } from "@/lib/api/studentClassification";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  console.log('🔥 Students API called');
  
  try {
    const session = await getServerSession(authOptions);

    console.log('🔐 Session details:', {
      hasSession: !!session,
      sessionType: typeof session,
      hasUser: !!session?.user,
      userKeys: session?.user ? Object.keys(session.user) : [],
      role: session?.user?.role,
      email: session?.user?.email,
      hasAccessToken: !!session?.user?.accessToken,
      tokenPreview: session?.user?.accessToken ? `${session.user.accessToken.substring(0, 20)}...` : 'NO TOKEN'
    });

    // Check if user is authenticated
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: No session found. Please log in." 
        },
        { status: 401 }
      );
    }

    if (!session.user) {
      console.log('❌ Session exists but no user object');
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Invalid session. Please log in again." 
        },
        { status: 401 }
      );
    }

    if (!session.user.accessToken) {
      console.log('❌ No access token in session');
      return NextResponse.json(
        { 
          success: false, 
          message: "Unauthorized: Missing authentication token. Please log in again.",
          debug: process.env.NODE_ENV === 'development' ? {
            sessionKeys: Object.keys(session),
            userKeys: Object.keys(session.user)
          } : undefined
        },
        { status: 401 }
      );
    }

    // Only admin, counselor, or super_admin can access
    const allowedRoles = ['admin', 'counselor', 'super_admin'];
    if (!session.user.role || !allowedRoles.includes(session.user.role)) {
      console.log('❌ Insufficient permissions. Role:', session.user.role);
      return NextResponse.json(
        { 
          success: false, 
          message: `Forbidden: Insufficient permissions. Your role: ${session.user.role || 'none'}` 
        },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const classification = searchParams.get("classification") as any;
    const isFlagged = searchParams.get("isFlagged");
    const limit = searchParams.get("limit");
    const cursor = searchParams.get("cursor");

    const params: FetchStudentsParams = {};
    
    if (classification) params.classification = classification;
    if (isFlagged !== null) params.isFlagged = isFlagged === 'true';
    if (limit) params.limit = parseInt(limit, 10);
    if (cursor) params.cursor = cursor;

    console.log('📊 Fetching students with params:', params);
    console.log('🔑 Using role:', session.user.role);

    const result = await fetchStudents(session.user.accessToken, params);

    console.log('📦 Fetch result:', {
      success: result.success,
      code: result.code,
      message: result.message,
      dataExists: !!result.data,
      studentsCount: result.data?.classifications?.length || 0
    });

    if (!result.success) {
      console.log('❌ Fetch failed:', result);
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌❌❌ Students API route error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal Server Error: Failed to fetch students",
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      },
      { status: 500 }
    );
  }
}