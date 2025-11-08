import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import {
  verifyPassword,
  signToken,
  attachTokenToResponse,
  jsonResponse,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse({ error: "Email and password are required" }, 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isAdmin) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const valid = await verifyPassword(password, user.password ?? "");
    if (!valid) return jsonResponse({ error: "Invalid credentials" }, 401);

    const token = signToken({ id: user.id, email: user.email, isAdmin: user.isAdmin });

    // create response object and attach cookie
    const response = jsonResponse({ success: true });
    return attachTokenToResponse(token, response);
  } catch (err) {
    console.error("Login error:", err);
    // More detailed error for debugging
    const errorMessage = err instanceof Error ? err.message : "Server error";
    return jsonResponse({ 
      error: "Server error", 
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined 
    }, 500);
  }
}
