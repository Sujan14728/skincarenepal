'use client';

import { useState } from 'react';
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
  const [form, setForm] = useState<Coupon>({
    ...coupon,
    code: coupon?.code ?? '',
    discountAmount: coupon?.discountAmount ?? 0,
    isPercentage: coupon?.isPercentage ?? false,
    active: coupon?.active ?? true,
    usageLimit: coupon?.usageLimit ?? null,
    validFrom: coupon?.validFrom
      ? dayjs(coupon.validFrom).format('YYYY-MM-DD')
      : '',
    validUntil: coupon?.validUntil
      ? dayjs(coupon.validUntil).format('YYYY-MM-DD')
      : ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
            ? value === ''
              ? null
              : parseInt(value, 10)
            : type === 'date'
              ? value
              : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      validFrom: form.validFrom ? dayjs(form.validFrom).toDate() : null,
      validUntil: form.validUntil ? dayjs(form.validUntil).toDate() : null
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
            <Label>Discount Amount</Label>
            <Input
              type='number'
              name='discountAmount'
              value={form.discountAmount}
              onChange={handleChange}
              required
            />
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='isPercentage'
              name='isPercentage'
              checked={form.isPercentage}
              onCheckedChange={(checked: CheckedState) =>
                setForm(prev => ({ ...prev, isPercentage: !!checked }))
              }
            />
            <Label htmlFor='isPercentage'>Is Percentage</Label>
          </div>
          <div className='flex items-center space-x-2'>
            <Checkbox
              id='active'
              name='active'
              checked={form.active}
              onCheckedChange={(checked: CheckedState) =>
                setForm(prev => ({ ...prev, active: !!checked }))
              }
            />
            <Label htmlFor='active'>Active</Label>
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
