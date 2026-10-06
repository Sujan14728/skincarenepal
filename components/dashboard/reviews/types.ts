export type ReviewType = 'TEXT' | 'IMAGE' | 'VIDEO';

export type AdminReview = {
  id: number;
  type: ReviewType;
  customerName: string;
  location: string | null;
  instagramUrl: string | null;
  rating: number;
  content: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  productId: number | null;
  product: { id: number; name: string; slug: string } | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
};

export type ProductOption = { id: number; name: string };

export type ReviewFormValues = {
  type: ReviewType;
  customerName: string;
  location: string;
  instagramUrl: string;
  rating: number;
  content: string;
  mediaUrl: string;
  thumbnailUrl: string;
  productId: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export const EMPTY_REVIEW: ReviewFormValues = {
  type: 'TEXT',
  customerName: '',
  location: '',
  instagramUrl: '',
  rating: 5,
  content: '',
  mediaUrl: '',
  thumbnailUrl: '',
  productId: '',
  isFeatured: false,
  isPublished: true,
  sortOrder: 0
};

export function toFormValues(review: AdminReview): ReviewFormValues {
  return {
    type: review.type,
    customerName: review.customerName,
    location: review.location ?? '',
    instagramUrl: review.instagramUrl ?? '',
    rating: review.rating,
    content: review.content ?? '',
    mediaUrl: review.mediaUrl ?? '',
    thumbnailUrl: review.thumbnailUrl ?? '',
    productId: review.productId ? String(review.productId) : '',
    isFeatured: review.isFeatured,
    isPublished: review.isPublished,
    sortOrder: review.sortOrder
  };
}
