'use client';

import { useState, useEffect } from 'react';
import { Coupon } from '@/lib/types/coupon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { CheckedState } from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { toast } from 'sonner';

type Props = {
  coupon?: Coupon | null;
  onClose: () => void;
  onSubmit: (coupon: Coupon) => void;
};

export default function CouponForm({ coupon, onClose, onSubmit }: Props) {
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [form, setForm] = useState({
    ...coupon,
    code: coupon?.code ?? '',
    discountType: coupon?.discountType ?? 'PERCENTAGE',
    discountValue: coupon?.discountValue ?? 0,
    minPurchase: coupon?.minPurchase ?? '',
    usageLimit: coupon?.usageLimit ?? '',
    productId: coupon?.productId ?? '',
    isActive: coupon?.isActive ?? true,
    validFrom: coupon?.validFrom
      ? dayjs(coupon.validFrom).format('YYYY-MM-DD')
      : '',
    validUntil: coupon?.validUntil
      ? dayjs(coupon.validUntil).format('YYYY-MM-DD')
      : ''
  });

  useEffect(() => {
    fetch('/api/products?limit=1000')
      .then(res => res.json())
      .then(data => {
        // API returns products array directly, not wrapped in an object
        const productsList = Array.isArray(data) ? data : data.products || [];
        setProducts(productsList);
      })
      .catch(err => {
        console.error('Failed to load products:', err);
        toast.error('Failed to load products');
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? ''
              : value
            : type === 'date'
              ? value
              : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...(coupon?.id && { id: coupon.id }),
      code: form.code,
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minPurchase: form.minPurchase ? Number(form.minPurchase) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      productId: form.productId ? Number(form.productId) : undefined,
      isActive: !!form.isActive,
      validFrom: form.validFrom ? dayjs(form.validFrom).toDate() : undefined,
      validUntil: form.validUntil ? dayjs(form.validUntil).toDate() : undefined
    };

    try {
      const method = coupon ? 'PUT' : 'POST';
      const res = await fetch('/api/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(
        coupon ? 'Coupon updated successfully' : 'Coupon created successfully'
      );
      onSubmit(data.coupon ?? data);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit' : 'Create'} Coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label>Code</Label>
            <Input
              name='code'
              value={form.code}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Discount Type</Label>
            <select
              name='discountType'
              value={form.discountType}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  discountType: e.target.value as 'PERCENTAGE' | 'FIXED'
                }))
              }
              required
              className='w-full rounded border px-2 py-1'
            >
              <option value='PERCENTAGE'>Percentage</option>
              <option value='FIXED'>Fixed Amount</option>
            </select>
          </div>
          <div>
            <Label>Discount Value</Label>
            <Input
              type='number'
              name='discountValue'
              value={form.discountValue ?? ''}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label>Minimum Purchase</Label>
            <Input
              type='number'
              name='minPurchase'
              value={form.minPurchase ?? ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Product (Optional - leave empty for all products)</Label>
            <select
              name='productId'
              value={form.productId ?? ''}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  productId: e.target.value ? Number(e.target.value) : ''
                }))
              }
              className='w-full rounded border px-2 py-1'
            >
              <option value=''>All Products</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='isActive'
              name='isActive'
              checked={!!form.isActive}
              onCheckedChange={(checked: CheckedState) =>
                setForm(prev => ({ ...prev, isActive: !!checked }))
              }
            />
            <Label htmlFor='isActive'>Active</Label>
          </div>
          <div>
            <Label>Usage Limit</Label>
            <Input
              type='number'
              name='usageLimit'
              value={form.usageLimit ?? ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Valid From</Label>
            <Input
              type='date'
              name='validFrom'
              value={form.validFrom ?? ''}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Valid Until</Label>
            <Input
              type='date'
              name='validUntil'
              value={form.validUntil ?? ''}
              onChange={handleChange}
            />
          </div>
          <DialogFooter className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit'>{coupon ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
