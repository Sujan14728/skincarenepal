'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Image as ImageIcon,
  Instagram,
  MessageSquareQuote,
  MessageSquareText,
  Pencil,
  Play,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Video
} from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import EmptyState from '@/components/dashboard/EmptyState';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';
import FormSheet from '@/components/dashboard/FormSheet';
import ReviewForm from '@/components/dashboard/reviews/ReviewForm';
import {
  EMPTY_REVIEW,
  toFormValues,
  type AdminReview,
  type ProductOption,
  type ReviewFormValues,
  type ReviewType
} from '@/components/dashboard/reviews/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const TYPE_META: Record<ReviewType, { label: string; icon: React.ElementType }> =
  {
    TEXT: { label: 'Text', icon: MessageSquareText },
    IMAGE: { label: 'Image', icon: ImageIcon },
    VIDEO: { label: 'Video', icon: Video }
  };

const TYPE_FILTERS = ['ALL', 'TEXT', 'IMAGE', 'VIDEO'] as const;
const STATUS_FILTERS = ['all', 'published', 'hidden'] as const;
const STATUS_LABELS: Record<(typeof STATUS_FILTERS)[number], string> = {
  all: 'All statuses',
  published: 'Published',
  hidden: 'Hidden'
};

function toPayload(values: ReviewFormValues) {
  const isMedia = values.type !== 'TEXT';
  return {
    type: values.type,
    customerName: values.customerName,
    location: values.location,
    instagramUrl: values.instagramUrl,
    rating: values.rating,
    content: values.content,
    mediaUrl: isMedia ? values.mediaUrl : null,
    thumbnailUrl: values.type === 'VIDEO' ? values.thumbnailUrl : null,
    productId: values.productId ? Number(values.productId) : null,
    isFeatured: values.isFeatured,
    isPublished: values.isPublished,
    sortOrder: values.sortOrder
  };
}

export default function ReviewsDashboardPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] =
    useState<(typeof TYPE_FILTERS)[number]>('ALL');
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<AdminReview | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewRes, productRes] = await Promise.all([
        fetch('/api/reviews?scope=all', { cache: 'no-store' }),
        fetch('/api/products', { cache: 'no-store' })
      ]);
      const reviewData = await reviewRes.json();
      if (!reviewRes.ok) throw new Error(reviewData.error);
      setReviews(reviewData.reviews ?? []);
      const productData = await productRes.json().catch(() => []);
      if (Array.isArray(productData)) {
        setProducts(
          productData.map((p: ProductOption) => ({ id: p.id, name: p.name }))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const published = reviews.filter(r => r.isPublished);
    const avg = published.length
      ? published.reduce((sum, r) => sum + r.rating, 0) / published.length
      : 0;
    return {
      total: reviews.length,
      published: published.length,
      featured: reviews.filter(r => r.isFeatured).length,
      average: avg ? avg.toFixed(1) : '—'
    };
  }, [reviews]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter(r => {
      if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
      if (statusFilter === 'published' && !r.isPublished) return false;
      if (statusFilter === 'hidden' && r.isPublished) return false;
      if (!q) return true;
      return [r.customerName, r.location, r.content, r.product?.name]
        .filter(Boolean)
        .some(v => v!.toLowerCase().includes(q));
    });
  }, [reviews, typeFilter, statusFilter, query]);

  const filtered =
    typeFilter !== 'ALL' || statusFilter !== 'all' || query.trim() !== '';

  const clearFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('all');
    setQuery('');
  };

  const save = async (values: ReviewFormValues) => {
    setSaving(true);
    const isNew = editing === 'new';
    try {
      const res = await fetch(
        isNew ? '/api/reviews' : `/api/reviews/${(editing as AdminReview).id}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toPayload(values))
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save review');
      setReviews(prev =>
        isNew
          ? [data.review, ...prev]
          : prev.map(r => (r.id === data.review.id ? data.review : r))
      );
      toast.success(isNew ? 'Review added' : 'Review updated');
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  const patch = async (review: AdminReview, data: Partial<AdminReview>) => {
    setBusyId(review.id);
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Update failed');
      setReviews(prev => prev.map(r => (r.id === review.id ? body.review : r)));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (target: AdminReview) => {
    setBusyId(target.id);
    try {
      const res = await fetch(`/api/reviews/${target.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Delete failed');
      }
      setReviews(prev => prev.filter(r => r.id !== target.id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Reviews'
        description='Curate customer reviews from Instagram — text, photos and videos — for the website.'
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus />
            Add review
          </Button>
        }
      />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-[126px] rounded-xl' />
          ))
        ) : (
          <>
            <StatCard
              label='Total reviews'
              value={String(stats.total)}
              icon={MessageSquareQuote}
              hint='Across text, image and video'
            />
            <StatCard
              label='Published'
              value={String(stats.published)}
              icon={Eye}
              hint={`${stats.total - stats.published} hidden`}
            />
            <StatCard
              label='Featured'
              value={String(stats.featured)}
              icon={Sparkles}
              hint='Shown first on the home page'
            />
            <StatCard
              label='Average rating'
              value={stats.average}
              icon={Star}
              hint='Published reviews only'
            />
          </>
        )}
      </div>

      <section className='overflow-hidden rounded-xl border bg-card shadow-xs'>
        <div className='flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:max-w-xs'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search name, text or product'
              aria-label='Search reviews'
              className='pl-9'
            />
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Tabs
              value={typeFilter}
              onValueChange={v =>
                setTypeFilter(v as (typeof TYPE_FILTERS)[number])
              }
            >
              <TabsList>
                {TYPE_FILTERS.map(t => (
                  <TabsTrigger key={t} value={t} className='px-3'>
                    {t === 'ALL' ? 'All types' : TYPE_META[t].label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Select
              value={statusFilter}
              onValueChange={v =>
                setStatusFilter(v as (typeof STATUS_FILTERS)[number])
              }
            >
              <SelectTrigger className='w-[150px]' aria-label='Filter by status'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_FILTERS.map(s => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className='flex flex-col divide-y'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 px-5 py-4'>
                <Skeleton className='size-10 rounded-md' />
                <div className='flex flex-1 flex-col gap-2'>
                  <Skeleton className='h-4 w-40' />
                  <Skeleton className='h-3 w-72 max-w-full' />
                </div>
                <Skeleton className='hidden h-4 w-20 sm:block' />
                <Skeleton className='hidden h-5 w-9 rounded-full md:block' />
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          filtered && reviews.length > 0 ? (
            <EmptyState
              icon={Search}
              title='No reviews match your filters'
              description='Try a different type, status or search term.'
              action={
                <Button variant='outline' size='sm' onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={MessageSquareQuote}
              title='No reviews yet'
              description='Add your first review from Instagram — a comment, a customer photo or a video.'
              action={
                <Button size='sm' onClick={() => setEditing('new')}>
                  <Plus />
                  Add review
                </Button>
              }
            />
          )
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[960px] text-sm'>
              <thead>
                <tr className='border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  <th className='px-5 py-2.5 font-medium'>Customer</th>
                  <th className='px-5 py-2.5 font-medium'>Review</th>
                  <th className='px-5 py-2.5 font-medium'>Rating</th>
                  <th className='px-5 py-2.5 font-medium'>Product</th>
                  <th className='px-5 py-2.5 font-medium'>Published</th>
                  <th className='px-5 py-2.5 font-medium'>Featured</th>
                  <th className='px-5 py-2.5 text-right font-medium'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {visible.map(review => (
                  <ReviewRow
                    key={review.id}
                    review={review}
                    busy={busyId === review.id}
                    onEdit={() => setEditing(review)}
                    onDelete={() => remove(review)}
                    onTogglePublish={() =>
                      patch(review, { isPublished: !review.isPublished })
                    }
                    onToggleFeature={() =>
                      patch(review, { isFeatured: !review.isFeatured })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <FormSheet
        open={editing !== null}
        onOpenChange={o => !o && setEditing(null)}
        title={editing === 'new' ? 'Add review' : 'Edit review'}
        description='Reviews appear on the home page, the Reviews page and the linked product page.'
      >
        {editing !== null && (
          <ReviewForm
            key={editing === 'new' ? 'new' : editing.id}
            initialValues={
              editing === 'new' ? EMPTY_REVIEW : toFormValues(editing)
            }
            products={products}
            submitting={saving}
            submitLabel={editing === 'new' ? 'Add review' : 'Save changes'}
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </FormSheet>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className='inline-flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          aria-hidden
          className={cn(
            'size-3.5',
            n <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
      <span className='sr-only'>{rating} out of 5</span>
    </span>
  );
}

function ReviewRow({
  review,
  busy,
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleFeature
}: {
  review: AdminReview;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  onToggleFeature: () => void;
}) {
  const { label: typeLabel, icon: TypeIcon } = TYPE_META[review.type];
  const preview =
    review.type === 'IMAGE' ? review.mediaUrl : review.thumbnailUrl;

  return (
    <tr className={cn('hover:bg-muted/30', !review.isPublished && 'bg-muted/20')}>
      <td className='px-5 py-3 align-top'>
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-foreground'>
            {review.customerName}
          </span>
          {review.location && (
            <span className='text-sm text-muted-foreground'>
              {review.location}
            </span>
          )}
          {review.instagramUrl && (
            <a
              href={review.instagramUrl}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex w-fit items-center gap-1 text-xs font-medium text-primary hover:underline'
            >
              <Instagram className='size-3' aria-hidden />
              Instagram post
            </a>
          )}
        </div>
      </td>
      <td className='px-5 py-3 align-top'>
        <div className='flex max-w-sm items-start gap-3'>
          {review.type !== 'TEXT' && (
            <span className='relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted text-muted-foreground'>
              {preview ? (
                <img
                  src={preview}
                  alt=''
                  loading='lazy'
                  className='absolute inset-0 size-full object-cover'
                />
              ) : (
                <TypeIcon className='size-4' aria-hidden />
              )}
              {review.type === 'VIDEO' && preview && (
                <span className='absolute inset-0 grid place-items-center bg-foreground/25 text-background'>
                  <Play className='size-3.5 fill-current' aria-hidden />
                </span>
              )}
            </span>
          )}
          <div className='flex min-w-0 flex-col gap-1.5'>
            <Badge variant='secondary'>
              <TypeIcon aria-hidden />
              {typeLabel}
            </Badge>
            {review.content ? (
              <p className='line-clamp-2 text-sm text-muted-foreground'>
                {review.content}
              </p>
            ) : (
              <p className='text-sm italic text-muted-foreground/70'>
                No caption
              </p>
            )}
          </div>
        </div>
      </td>
      <td className='whitespace-nowrap px-5 py-3 align-top'>
        <StarRating rating={review.rating} />
      </td>
      <td className='px-5 py-3 align-top text-sm text-muted-foreground'>
        {review.product?.name ?? '—'}
      </td>
      <td className='px-5 py-3 align-top'>
        <div className='flex items-center gap-2'>
          <Switch
            checked={review.isPublished}
            onCheckedChange={onTogglePublish}
            disabled={busy}
            aria-label={`Published: ${review.customerName}`}
          />
          <span className='text-xs text-muted-foreground'>
            {review.isPublished ? 'Live' : 'Hidden'}
          </span>
        </div>
      </td>
      <td className='px-5 py-3 align-top'>
        <Switch
          checked={review.isFeatured}
          onCheckedChange={onToggleFeature}
          disabled={busy}
          aria-label={`Featured: ${review.customerName}`}
        />
      </td>
      <td className='px-5 py-3 align-top'>
        <div className='flex justify-end gap-1'>
          <Button
            variant='ghost'
            size='icon-sm'
            onClick={onEdit}
            aria-label={`Edit review by ${review.customerName}`}
          >
            <Pencil />
          </Button>
          <ConfirmDelete
            title='Delete this review?'
            description={
              <>
                {review.customerName}&apos;s review will be removed from the
                website. This can&apos;t be undone — hide it instead if you
                might want it back.
              </>
            }
            confirmLabel='Delete review'
            onConfirm={onDelete}
          >
            <Button
              variant='ghost'
              size='icon-sm'
              disabled={busy}
              aria-label={`Delete review by ${review.customerName}`}
              className='text-muted-foreground hover:text-destructive'
            >
              <Trash2 />
            </Button>
          </ConfirmDelete>
        </div>
      </td>
    </tr>
  );
}
