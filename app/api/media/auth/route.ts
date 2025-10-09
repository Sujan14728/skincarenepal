import { NextRequest } from "next/server";
import { getUploadAuth } from "@/lib/media/imagekit";

// GET /api/media/auth - Get upload authentication parameters
export async function GET(req: NextRequest) {
  try {
    // Verify user authentication (optional but recommended)
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return Response.json(
        { error: "Authentication required for file uploads" },
        { status: 401 }
      );
    }

    // Get ImageKit authentication parameters
    const authData = await getUploadAuth();

    return Response.json(authData);
  } catch (error) {
    return Response.json(
      { error: "Failed to get upload authentication" },
      { status: 500 }
    );
  }
}
