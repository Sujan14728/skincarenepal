import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'skincarenepal12345';

export interface JWTPayload {
  id: number;
  email: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

// Base64 URL encode
// function base64UrlEncode(str: string): string {
//   return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
// }

// Base64 URL decode
function base64UrlDecode(str: string): string {
  const pad = str.length % 4;
  if (pad) {
    str += '='.repeat(4 - pad);
  }
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

// Verify JWT token using Web Crypto API (Edge Runtime compatible)
export async function verifyTokenEdge(
  token: string
): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JWTPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const secretKey = encoder.encode(JWT_SECRET);

    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode signature
    const signature = Uint8Array.from(base64UrlDecode(signatureB64), c =>
      c.charCodeAt(0)
    );

    // Verify signature
    const isValid = await crypto.subtle.verify('HMAC', key, signature, data);

    if (!isValid) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('JWT verification failed (Edge):', error);
    return null;
  }
}

// Get user from request cookies (Edge Runtime compatible)
export async function getUserFromRequestEdge(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return null;
  }

  return await verifyTokenEdge(token);
}

export function hasRequiredRole(
  user: JWTPayload | null,
  allowedRoles: string[]
): boolean {
  return (
    user !== null && allowedRoles.includes(user.isAdmin ? 'admin' : 'guest')
  );
}
