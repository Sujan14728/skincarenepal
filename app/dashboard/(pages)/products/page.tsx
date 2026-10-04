'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  AlertTriangle,
  CheckCircle2,
  ImageOff,
  Package,
  PackageX,
  Pencil,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import ConfirmDelete from '@/components/dashboard/ConfirmDelete';
import EmptyState from '@/components/dashboard/EmptyState';
import FormSheet from '@/components/dashboard/FormSheet';
import PageHeader from '@/components/dashboard/PageHeader';
import ProductForm from '@/components/dashboard/ProductForm';
import StatCard from '@/components/dashboard/StatCard';
import { formatNPR, formatNumber } from '@/components/dashboard/format';
import { ProductStatus } from '@/lib/enum/product';
import { Product } from '@/lib/types/product';
import { cn } from '@/lib/utils';

const LOW_STOCK_THRESHOLD = 20;

const STATUS_META: Record<
  ProductStatus,
  { label: string; variant: 'success' | 'red' | 'blue' | 'secondary' }
> = {
  IN_STOCK: { label: 'In stock', variant: 'success' },
  OUT_OF_STOCK: { label: 'Out of stock', variant: 'red' },
  COMING_SOON: { label: 'Coming soon', variant: 'blue' },
  DISCONTINUED: { label: 'Discontinued', variant: 'secondary' }
};

type StatusFilter = 'ALL' | ProductStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'IN_STOCK', label: 'In stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
  { value: 'COMING_SOON', label: 'Coming soon' },
  { value: 'DISCONTINUED', label: 'Discontinued' }
];

/** Plain-text summary for the table: excerpt first, else the rich description stripped of HTML. */
const summaryOf = (product: Product) => {
  const text =
    product.excerpt?.trim() ||
    (product.description ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  return text;
};

function TableSkeleton() {
  return (
    <ul className='divide-y'>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className='flex items-center gap-4 px-5 py-3'>
          <Skeleton className='size-11 shrink-0 rounded-lg' />
          <div className='flex flex-1 flex-col gap-2'>
            <Skeleton className='h-4 w-48' />
            <Skeleton className='h-3 w-72 max-w-full' />
          </div>
          <Skeleton className='hidden h-4 w-20 sm:block' />
          <Skeleton className='hidden h-4 w-12 sm:block' />
          <Skeleton className='h-5 w-20 rounded-md' />
        </li>
      ))}
    </ul>
  );
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error('Products could not be loaded. Refresh the page to try again.');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Products could not be loaded. Check your connection and refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter(p => p.status === 'IN_STOCK' && p.stock > 0)
        .length,
      lowStock: products.filter(
        p =>
          p.status !== 'DISCONTINUED' &&
          p.stock > 0 &&
          p.stock <= LOW_STOCK_THRESHOLD
      ).length,
      outOfStock: products.filter(
        p => p.stock === 0 || p.status === 'OUT_OF_STOCK'
      ).length
    }),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter(product => {
      if (statusFilter !== 'ALL' && product.status !== statusFilter) {
        return false;
      }
      if (!term) return true;
      return (
        product.name.toLowerCase().includes(term) ||
        (product.excerpt ?? '').toLowerCase().includes(term) ||
        (product.description ?? '').toLowerCase().includes(term)
      );
    });
  }, [products, searchTerm, statusFilter]);

  const handleDelete = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Product deleted');
        fetchProducts();
      } else {
        // Surface the server's reason (e.g. the product has been ordered).
        const data = await response.json().catch(() => null);
        toast.error(data?.error || 'Product could not be deleted. Try again.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Product could not be deleted. Check your connection and try again.');
    }
  };

  const openCreate = () => {
    setSelectedProduct(null);
    setSheetOpen(true);
  };

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setSheetOpen(true);
  };

  const handleSuccess = () => {
    setSheetOpen(false);
    fetchProducts();
  };

  const isFiltering = searchTerm.trim() !== '' || statusFilter !== 'ALL';

  return (
    <div className='flex flex-col gap-6'>
      <PageHeader
        title='Products'
        description='Manage your catalogue, pricing and stock levels.'
        actions={
          <Button onClick={openCreate}>
            <Plus />
            Add product
          </Button>
        }
      />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Total products'
          value={loading ? '–' : formatNumber(stats.total)}
          icon={Package}
          hint='Every product in the catalogue'
        />
        <StatCard
          label='In stock'
          value={loading ? '–' : formatNumber(stats.inStock)}
          icon={CheckCircle2}
          hint='Available to order now'
        />
        <StatCard
          label='Low stock'
          value={loading ? '–' : formatNumber(stats.lowStock)}
          icon={AlertTriangle}
          hint={`${LOW_STOCK_THRESHOLD} or fewer units left`}
        />
        <StatCard
          label='Out of stock'
          value={loading ? '–' : formatNumber(stats.outOfStock)}
          icon={PackageX}
          hint='No units left or marked out of stock'
        />
      </div>

      <section className='rounded-xl border bg-card shadow-xs'>
        <div className='flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center'>
          <div className='relative flex-1'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              type='search'
              placeholder='Search by name or description'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-9'
              aria-label='Search products'
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger
              className='w-full sm:w-44'
              aria-label='Filter by status'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {STATUS_FILTERS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filteredProducts.length === 0 ? (
          isFiltering ? (
            <EmptyState
              icon={Search}
              title='No products match your filters'
              description='Try a different search term or status.'
              action={
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title='No products yet'
              description='Add your first product to start selling.'
              action={
                <Button size='sm' onClick={openCreate}>
                  <Plus />
                  Add product
                </Button>
              }
            />
          )
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[720px] text-sm'>
              <thead>
                <tr className='border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                  <th className='px-5 py-2.5 font-medium'>Product</th>
                  <th className='px-5 py-2.5 text-right font-medium'>Price</th>
                  <th className='px-5 py-2.5 text-right font-medium'>Stock</th>
                  <th className='px-5 py-2.5 font-medium'>Status</th>
                  <th className='px-5 py-2.5 text-right font-medium'>
                    <span className='sr-only'>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {filteredProducts.map(product => {
                  const onSale =
                    product.salePrice != null &&
                    product.salePrice > 0 &&
                    product.salePrice < product.price;
                  const lowStock = product.stock <= LOW_STOCK_THRESHOLD;
                  const status = STATUS_META[product.status] ?? {
                    label: product.status,
                    variant: 'secondary' as const
                  };
                  const summary = summaryOf(product);

                  return (
                    <tr key={product.id} className='hover:bg-muted/30'>
                      <td className='px-5 py-3'>
                        <div className='flex items-center gap-3'>
                          <span className='relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted text-muted-foreground'>
                            {product.images[0] ? (
                              <Image
                                src={product.images[0]}
                                alt=''
                                fill
                                sizes='44px'
                                className='object-cover'
                              />
                            ) : (
                              <ImageOff className='size-4' aria-hidden />
                            )}
                          </span>
                          <div className='flex min-w-0 flex-col gap-0.5'>
                            <span className='truncate font-medium text-foreground'>
                              {product.name}
                            </span>
                            {summary && (
                              <span className='line-clamp-1 max-w-md text-sm text-muted-foreground'>
                                {summary}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='whitespace-nowrap px-5 py-3 text-right tabular-nums'>
                        {onSale ? (
                          <div className='flex flex-col items-end gap-0.5'>
                            <span className='font-medium text-foreground'>
                              {formatNPR(product.salePrice as number)}
                            </span>
                            <span className='text-xs text-muted-foreground line-through'>
                              {formatNPR(product.price)}
                            </span>
                          </div>
                        ) : (
                          <span className='font-medium text-foreground'>
                            {formatNPR(product.price)}
                          </span>
                        )}
                      </td>
                      <td className='whitespace-nowrap px-5 py-3 text-right'>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 tabular-nums',
                            lowStock
                              ? 'font-semibold text-red-700'
                              : 'text-foreground'
                          )}
                        >
                          {lowStock && (
                            <AlertTriangle
                              className='size-3.5'
                              aria-label='Low stock'
                            />
                          )}
                          {formatNumber(product.stock)}
                        </span>
                      </td>
                      <td className='px-5 py-3'>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className='px-5 py-3'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            variant='ghost'
                            size='icon-sm'
                            onClick={() => openEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil />
                          </Button>
                          <ConfirmDelete
                            title='Delete product?'
                            description={
                              <>
                                &ldquo;{product.name.trim()}&rdquo; will be removed
                                from your store. This can&rsquo;t be undone.
                              </>
                            }
                            confirmLabel='Delete product'
                            onConfirm={() => handleDelete(product.id)}
                          >
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              className='text-muted-foreground hover:text-destructive'
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 />
                            </Button>
                          </ConfirmDelete>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        size='lg'
        title={selectedProduct ? 'Edit product' : 'Add product'}
        description={
          selectedProduct
            ? `Update details, pricing and stock for ${selectedProduct.name.trim()}.`
            : 'Add a new product to your store.'
        }
      >
        <ProductForm
          key={selectedProduct?.id ?? 'new'}
          product={selectedProduct ?? undefined}
          onSuccess={handleSuccess}
          onCancel={() => setSheetOpen(false)}
        />
      </FormSheet>
    </div>
  );
};

export default ProductsPage;
