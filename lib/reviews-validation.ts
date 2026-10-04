import { NextRequest } from 'next/server';
import { Prisma, ReviewType } from '@prisma/client';

/** Parses a JSON object body; null when the body is malformed or not an object. */
export async function readJsonObject(
  req: NextRequest
): Promise<Record<string, unknown> | null> {
  const body = await req.json().catch(() => null);
  return body && typeof body === 'object' && !Array.isArray(body)
    ? (body as Record<string, unknown>)
    : null;
}

type ReviewShape = {
  type?: ReviewType | null;
  content?: string | null;
  mediaUrl?: string | null;
};

/** Rules that span fields; checked against the full record after a merge. */
export function reviewConsistencyError(review: ReviewShape): string | null {
  if (review.type === 'TEXT' && !review.content)
    return 'Text reviews need review text.';
  if ((review.type === 'IMAGE' || review.type === 'VIDEO') && !review.mediaUrl)
    return `${review.type === 'IMAGE' ? 'Image' : 'Video'} reviews need an uploaded file or URL.`;
  return null;
}

const REVIEW_TYPES = Object.values(ReviewType);

const optionalString = (value: unknown, max: number) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = String(value).trim();
  return trimmed ? trimmed.slice(0, max) : null;
};

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

/**
 * Validates a create/update payload. With `partial`, missing fields are left
 * untouched (PATCH semantics); otherwise required fields must be present.
 */
export function parseReviewInput(
  body: Record<string, unknown>,
  { partial }: { partial: boolean }
): { data: Prisma.ReviewUncheckedCreateInput } | { error: string } {
  const data: Record<string, unknown> = {};

  if (!partial || body.type !== undefined) {
    if (!REVIEW_TYPES.includes(body.type as ReviewType))
      return { error: 'Review type must be TEXT, IMAGE or VIDEO.' };
    data.type = body.type;
  }

  if (!partial || body.customerName !== undefined) {
    const name = optionalString(body.customerName, 80);
    if (!name) return { error: 'Customer name is required.' };
    data.customerName = name;
  }

  if (body.rating !== undefined || !partial) {
    const rating = Number(body.rating ?? 5);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return { error: 'Rating must be a whole number from 1 to 5.' };
    data.rating = rating;
  }

  const location = optionalString(body.location, 80);
  if (location !== undefined) data.location = location;

  const content = optionalString(body.content, 1000);
  if (content !== undefined) data.content = content;

  for (const key of ['instagramUrl', 'mediaUrl', 'thumbnailUrl'] as const) {
    const value = optionalString(body[key], 1000);
    if (value === undefined) continue;
    if (value && !isHttpUrl(value))
      return { error: `${key} must be a valid http(s) URL.` };
    data[key] = value;
  }

  if (body.productId !== undefined) {
    if (body.productId === null || body.productId === '') {
      data.productId = null;
    } else {
      const productId = Number(body.productId);
      if (!Number.isInteger(productId) || productId < 1)
        return { error: 'Invalid product.' };
      data.productId = productId;
    }
  }

  for (const key of ['isFeatured', 'isPublished'] as const) {
    if (body[key] !== undefined) data[key] = Boolean(body[key]);
  }

  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder);
    if (!Number.isInteger(sortOrder))
      return { error: 'Sort order must be a whole number.' };
    data.sortOrder = sortOrder;
  }

  // Partial updates are checked by the caller once merged with the stored row.
  if (!partial) {
    const error = reviewConsistencyError(data as ReviewShape);
    if (error) return { error };
  }

  return { data: data as Prisma.ReviewUncheckedCreateInput };
}
