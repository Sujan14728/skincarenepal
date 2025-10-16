import { NextRequest, NextResponse } from "next/server";
import {
  imagekit,
  validateFile,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "@/lib/media/imagekit";

// POST /api/media/upload - Server-side upload to ImageKit
export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    // const token = req.cookies.get("token")?.value;

    // if (!token) {
    //   return NextResponse.json(
    //     { error: "Authentication required for file uploads" },
    //     { status: 401 }
    //   );
    // }

    // const payload = await verifyToken(token);
    // if (!payload || !payload.id) {
    //   return NextResponse.json(
    //     { error: "Invalid authentication token" },
    //     { status: 401 }
    //   );
    // }

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    try {
      const fileType = file.type.startsWith("video/") ? "video" : "image";
      validateFile(file, fileType);
    } catch (validationError) {
      return NextResponse.json(
        {
          error:
            validationError instanceof Error
              ? validationError.message
              : "File validation failed",
        },
        { status: 400 }
      );
    }

    // Prepare upload options
    const folder = (formData.get("folder") as string) || "articles/images";
    const useUniqueFileName = formData.get("useUniqueFileName") !== "false";
    const tags = formData.get("tags") as string;

    // Generate filename
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = useUniqueFileName
      ? `${timestamp}_${cleanName}`
      : cleanName;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to ImageKit
    const uploadOptions = {
      file: buffer,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: useUniqueFileName,
      tags: tags
        ? tags.split(",").map((tag) => tag.trim())
        : [`skincarenepal`],
    };

    const result = await imagekit.upload(uploadOptions);

    // Return structured response
    const responseData = {
      fileId: result.fileId,
      name: result.name,
      size: result.size,
      filePath: result.filePath,
      url: result.url,
      fileType: result.fileType,
      height: result.height,
      width: result.width,
      thumbnailUrl: result.thumbnailUrl,
      AITags: result.AITags || [],
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Upload error:", error);

    // Handle specific ImageKit errors
    if (error && typeof error === "object" && "message" in error) {
      const errorMessage = error.message as string;

      if (errorMessage.includes("file size")) {
        return NextResponse.json(
          { error: "File size exceeds maximum allowed limit" },
          { status: 413 }
        );
      }

      if (errorMessage.includes("file type")) {
        return NextResponse.json(
          {
            error: "Unsupported file type",
            allowedTypes: {
              images: ALLOWED_IMAGE_TYPES,
              videos: ALLOWED_VIDEO_TYPES,
            },
          },
          { status: 415 }
        );
      }
    }

    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
