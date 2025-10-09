import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string) => {
  return bcrypt.compare(password, hash);
};

export const signToken = (
  payload: object,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
};

export async function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Verified payload:", payload);
    return payload as { id: string; email: string; isAdmin: boolean };
  } catch {
    return false;
  }
}

/** Attach cookie to NextResponse */
export const attachTokenToResponse = (
  token: string,
  response: NextResponse
) => {
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
  return response;
};

export const clearTokenFromResponse = (
  token: string,
  response: NextResponse
) => {
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  return response;
};

/** Standard JSON response */
export const jsonResponse = (data: object, status: number = 200) => {
  return NextResponse.json(data, { status });
};
