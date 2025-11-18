'use client';

import { useEffect, useState } from 'react';
import { Coupon } from '@/lib/types/coupon';
import CouponForm from '@/components/dashboard/coupons/CouponForm';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import dayjs from 'dayjs';
import { toast } from 'sonner';

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || 'Failed to load coupons');
        setCoupons([]);
        return;
      }
      const list = Array.isArray(data?.coupons)
        ? data.coupons
        : Array.isArray(data)
          ? data
          : [];
      setCoupons(list);
    } catch (err) {
      console.error('Load coupons failed:', err);
      toast.error('Failed to load coupons');
      setCoupons([]);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    await fetch(`/api/coupons?id=${id}`, { method: 'DELETE' });
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const handleEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditing(null);
    setShowForm(false);
  };

  const handleFormSubmit = () => {
    fetchCoupons();
    handleFormClose();
  };

  return (
    <div className='p-6'>
      <h1 className='mb-4 text-2xl font-bold'>Coupons</h1>

      <Button onClick={() => setShowForm(true)} className='mb-4'>
        Create Coupon
      </Button>

      {showForm && (
        <CouponForm
          coupon={editing}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Usage Limit</TableHead>
            <TableHead>Used Count</TableHead>
            <TableHead>Valid From</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons?.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.code}</TableCell>
              <TableCell>{c.discountValue}</TableCell>
              <TableCell>
                {c.discountType === 'PERCENTAGE' ? '%' : 'Fixed'}
              </TableCell>
              <TableCell>{c.isActive ? 'Yes' : 'No'}</TableCell>
              <TableCell>{c.usageLimit ?? 'Unlimited'}</TableCell>
              <TableCell>{c.usedCount ?? 0}</TableCell>
              <TableCell>
                {c.validFrom ? dayjs(c.validFrom).format('MMM DD, YYYY') : '-'}
              </TableCell>
              <TableCell>
                {c.validUntil
                  ? dayjs(c.validUntil).format('MMM DD, YYYY')
                  : '-'}
              </TableCell>
              <TableCell className='space-x-2'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => handleEdit(c)}
                >
                  Edit
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => handleDelete(c.id!)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
