import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: validate ImageKit URL (allow empty strings)
function isValidImageKitUrl(url: unknown): boolean {
  if (url === undefined || url === null) return true;
  if (typeof url !== 'string') return false;
  if (url.trim() === '') return true;
  const endpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';
  return url.startsWith(endpoint) || url.includes('imagekit.io');
}

// =====================================
// GET all members
// =====================================
export async function GET() {
  try {
    // Add connection retry logic
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const members = await prisma.teamMember.findMany({
          orderBy: { id: 'asc' },
          // Add timeout to prevent hanging
          take: 100 // Limit results to prevent large queries
        });
        return NextResponse.json(members);
      } catch (error: unknown) {
        lastError = error as unknown;
        retries--;

        // If it's a connection error, wait before retrying
        if (
          typeof error === 'object' &&
          error !== null &&
          // Prisma timeout code
          (('code' in error && (error as { code?: string }).code === 'P2024') ||
            // Generic connection text
            ('message' in error &&
              typeof (error as { message?: unknown }).message === 'string' &&
              (error as { message: string }).message.includes('connection')))
        ) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          continue;
        }

        // If it's not a connection error, break immediately
        break;
      }
    }

    // If all retries failed, throw the last error
    throw lastError;
  } catch (error: unknown) {
    console.error('Error fetching team members:', error);

    // Provide more specific error messages
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2024'
    ) {
      return NextResponse.json(
        { error: 'Database connection timeout. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// =====================================
// POST - Create new member
// =====================================
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    if (!isValidImageKitUrl(data?.image)) {
      return NextResponse.json(
        {
          error:
            'Invalid image URL. Please upload to ImageKit and pass its URL.'
        },
        { status: 400 }
      );
    }
    const member = await prisma.teamMember.create({ data });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

// =====================================
// PUT - Update existing member
// =====================================
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, ...update } = data;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (!isValidImageKitUrl(update?.image)) {
      return NextResponse.json(
        {
          error:
            'Invalid image URL. Please upload to ImageKit and pass its URL.'
        },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.update({
      where: { id },
      data: update
    });
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    );
  }
}

// =====================================
// DELETE - Remove a member
// =====================================
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await prisma.teamMember.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}
