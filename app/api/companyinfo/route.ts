// /app/api/company-info/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth'; // Ensure this is imported
import type { CompanyInfo } from '@prisma/client';

// Simple in-memory cache to minimize DB hits and avoid pool exhaustion
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache: { data: CompanyInfo | null; ts: number } = { data: null, ts: 0 };

const now = () => Date.now();

// Helper function to find the single record
const getCompanyInfoRecord = async () => {
  // Return cached value if still fresh
  if (cache.data && now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }
  const data = await prisma.companyInfo.findFirst();
  cache = { data: data ?? null, ts: now() };
  return data;
};

// --- GET: PUBLIC Read Access ---
export async function GET() {
  try {
    const companyInfo = await getCompanyInfoRecord();
    if (!companyInfo) {
      return NextResponse.json(
        { success: false, message: 'No company info found' },
        { status: 404 }
      );
    }

    const res = NextResponse.json({ success: true, companyInfo });
    // Add cache headers for upstream caches/CDN or reverse proxy
    res.headers.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=60'
    );
    return res;
  } catch (err: unknown) {
    // If DB pool timed out but we have a cached value, return it as a soft-fallback
    const e = err as { code?: string; message?: string };
    const isPoolTimeout =
      e?.code === 'P2024' ||
      String(e?.message || '').includes('Timed out fetching a new connection');
    const hasFreshCache = cache.data && now() - cache.ts < CACHE_TTL_MS;
    if (isPoolTimeout && hasFreshCache) {
      const res = NextResponse.json({
        success: true,
        companyInfo: cache.data,
        cached: true
      });
      res.headers.set(
        'Warning',
        '110 - "Returning cached company info due to DB pool timeout"'
      );
      res.headers.set(
        'Cache-Control',
        'public, max-age=30, stale-while-revalidate=60'
      );
      return res;
    }
    console.error('Public GET error:', err);
    // Return 503 to indicate a transient backend issue
    return NextResponse.json(
      { error: 'Service temporarily unavailable' },
      { status: 503 }
    );
  }
}

// --- PATCH: ADMIN Write Access ---
export async function PATCH(req: NextRequest) {
  try {
    // 1. Admin check
    const token = req.cookies.get('token')?.value ?? '';
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      );
    }

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { companyEmails, companyPhones, companyLocation } = body ?? {};

    let companyInfo = await getCompanyInfoRecord();

    // If no record, create one
    if (!companyInfo) {
      companyInfo = await prisma.companyInfo.create({
        data: {
          companyEmails: Array.isArray(companyEmails)
            ? companyEmails.map(e => e.trim())
            : [],
          companyPhones: Array.isArray(companyPhones)
            ? companyPhones.map(p => p.trim())
            : [],
          companyLocation: companyLocation?.trim() || null,
          updatedAt: new Date()
        }
      });
      // Update cache immediately
      cache = { data: companyInfo, ts: now() };
      return NextResponse.json({ success: true, companyInfo });
    }

    // Build partial update data
    const updateData: Partial<{
      companyEmails: string[];
      companyPhones: string[];
      companyLocation: string | null;
    }> = {};

    if (companyEmails) {
      updateData.companyEmails = Array.isArray(companyEmails)
        ? companyEmails.map(e => e.trim())
        : companyInfo.companyEmails;
    }

    if (companyPhones) {
      updateData.companyPhones = Array.isArray(companyPhones)
        ? companyPhones.map(p => p.trim())
        : companyInfo.companyPhones;
    }

    if (companyLocation !== undefined) {
      updateData.companyLocation = companyLocation?.trim() || null;
    }

    companyInfo = await prisma.companyInfo.update({
      where: { id: companyInfo.id },
      data: updateData
    });

    // Refresh cache after update
    cache = { data: companyInfo, ts: now() };
    return NextResponse.json({ success: true, companyInfo });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
