import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getUploadAuth } from "@/lib/media/imagekit";

// GET /api/media/auth - Get upload authentication parameters
export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;
  try {
    // Get ImageKit authentication parameters
    const authData = await getUploadAuth();

    return NextResponse.json(authData);
  } catch {
    return NextResponse.json(
      { error: "Failed to get upload authentication" },
      { status: 500 }
    );
  }
}
