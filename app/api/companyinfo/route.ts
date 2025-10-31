// /app/api/company-info/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth'; // Ensure this is imported

// Helper function to find the single record
const getCompanyInfoRecord = () => {
  return prisma.companyInfo.findFirst();
};

// --- GET: PUBLIC Read Access ---
export async function GET() {
  try {
    const companyInfo = await prisma.companyInfo.findFirst();
    if (!companyInfo)
      return NextResponse.json({
        success: false,
        message: 'No company info found'
      });

    return NextResponse.json({ success: true, companyInfo });
  } catch (err) {
    console.error('Public GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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
          companyLocation: companyLocation?.trim() || null
        }
      });
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

    return NextResponse.json({ success: true, companyInfo });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
