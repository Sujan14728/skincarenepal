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

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = async () => {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setCoupons(data.coupons ?? data);
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

  const handleFormSubmit = (coupon: Coupon) => {
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
          {coupons.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.code}</TableCell>
              <TableCell>{c.discountAmount}</TableCell>
              <TableCell>{c.isPercentage ? '%' : 'Fixed'}</TableCell>
              <TableCell>{c.active ? 'Yes' : 'No'}</TableCell>
              <TableCell>{c.usageLimit ?? 'Unlimited'}</TableCell>
              <TableCell>{c.usedCount ?? 0}</TableCell>
              <TableCell>
                {dayjs(c.validFrom).format('MMM DD, YYYY') ?? '-'}
              </TableCell>
              <TableCell>
                {dayjs(c.validUntil).format('MMM DD, YYYY') ?? '-'}
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
