'use client';

import { useState, useEffect } from 'react';
import { Loader2, Percent, Wallet } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { Coupon } from '@/lib/types/coupon';
import {
  Field,
  FieldRow,
  FormBody,
  FormFooter,
  FormSection,
  SwitchField
} from '@/components/dashboard/form';
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
import { cn } from '@/lib/utils';

type Props = {
  coupon?: Coupon | null;
  onClose: () => void;
  onSubmit: (_coupon: Coupon) => void;
};

const ALL_PRODUCTS = 'all';

const DISCOUNT_TYPES = [
  {
    value: 'PERCENTAGE',
    label: 'Percentage',
    hint: 'e.g. 15% off',
    icon: Percent
  },
  {
    value: 'FIXED',
    label: 'Fixed amount',
    hint: 'e.g. Rs. 200 off',
    icon: Wallet
  }
] as const;

export default function CouponForm({ coupon, onClose, onSubmit }: Props) {
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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

    setSaving(true);
    try {
      const method = coupon ? 'PUT' : 'POST';
      const res = await fetch('/api/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(coupon ? 'Coupon updated' : 'Coupon created');
      onSubmit(data.coupon ?? data);
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error && err.message
          ? err.message
          : 'Could not save the coupon. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const isPercent = form.discountType === 'PERCENTAGE';

  return (
    <form onSubmit={handleSubmit} className='flex min-h-0 flex-1 flex-col'>
      <FormBody>
        <FormSection
          title='Discount'
          description='The code customers enter at checkout and what it takes off.'
        >
          <Field
            label='Coupon code'
            htmlFor='code'
            required
            hint='Customers must type the code exactly as shown.'
          >
            <Input
              id='code'
              name='code'
              value={form.code}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  code: e.target.value.toUpperCase().replace(/\s+/g, '')
                }))
              }
              placeholder='e.g. GLOW15'
              autoComplete='off'
              spellCheck={false}
              className='font-mono uppercase tracking-wide'
              required
            />
          </Field>

          <Field label='Discount type' required>
            <div
              role='radiogroup'
              aria-label='Discount type'
              className='grid grid-cols-2 gap-2'
            >
              {DISCOUNT_TYPES.map(({ value, label, hint, icon: Icon }) => {
                const active = form.discountType === value;
                return (
                  <label
                    key={value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                      active
                        ? 'border-primary bg-accent ring-1 ring-primary'
                        : 'hover:border-primary/40 hover:bg-muted/40'
                    )}
                  >
                    <input
                      type='radio'
                      name='discountType'
                      value={value}
                      checked={active}
                      onChange={() =>
                        setForm(prev => ({ ...prev, discountType: value }))
                      }
                      className='sr-only'
                    />
                    <Icon
                      aria-hidden
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        active ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                    <span className='flex flex-col gap-0.5'>
                      <span className='text-sm font-medium text-foreground'>
                        {label}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Field>

          <Field
            label='Discount value'
            htmlFor='discountValue'
            required
            hint={
              isPercent
                ? 'Percentage taken off the order subtotal.'
                : 'Amount in rupees taken off the order subtotal.'
            }
          >
            <div className='relative sm:max-w-[220px]'>
              {!isPercent && (
                <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                  Rs.
                </span>
              )}
              <Input
                id='discountValue'
                type='number'
                name='discountValue'
                inputMode='numeric'
                min={0}
                max={isPercent ? 100 : undefined}
                value={form.discountValue ?? ''}
                onChange={handleChange}
                className={cn('tabular-nums', isPercent ? 'pr-8' : 'pl-10')}
                required
              />
              {isPercent && (
                <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                  %
                </span>
              )}
            </div>
          </Field>
        </FormSection>

        <FormSection
          title='Conditions'
          description='Limit when and how often the coupon can be used.'
        >
          <FieldRow>
            <Field
              label='Minimum purchase'
              htmlFor='minPurchase'
              optional
              hint='Leave empty for no minimum.'
            >
              <div className='relative'>
                <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>
                  Rs.
                </span>
                <Input
                  id='minPurchase'
                  type='number'
                  name='minPurchase'
                  inputMode='numeric'
                  min={0}
                  value={form.minPurchase ?? ''}
                  onChange={handleChange}
                  className='pl-10 tabular-nums'
                />
              </div>
            </Field>
            <Field
              label='Usage limit'
              htmlFor='usageLimit'
              optional
              hint='Total redemptions allowed. Empty means unlimited.'
            >
              <Input
                id='usageLimit'
                type='number'
                name='usageLimit'
                inputMode='numeric'
                min={0}
                value={form.usageLimit ?? ''}
                onChange={handleChange}
                placeholder='Unlimited'
                className='tabular-nums'
              />
            </Field>
          </FieldRow>
          <Field
            label='Product'
            optional
            hint='Restrict the coupon to one product, or leave it on all products.'
          >
            <Select
              value={form.productId ? String(form.productId) : ALL_PRODUCTS}
              onValueChange={v =>
                setForm(prev => ({
                  ...prev,
                  productId: v === ALL_PRODUCTS ? '' : Number(v)
                }))
              }
            >
              <SelectTrigger className='w-full' aria-label='Product'>
                <SelectValue placeholder='All products' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={ALL_PRODUCTS}>All products</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FormSection>

        <FormSection
          title='Schedule'
          description='Leave the dates empty to start now and never expire.'
        >
          <FieldRow>
            <Field label='Valid from' htmlFor='validFrom' optional>
              <Input
                id='validFrom'
                type='date'
                name='validFrom'
                value={form.validFrom ?? ''}
                onChange={handleChange}
              />
            </Field>
            <Field label='Valid until' htmlFor='validUntil' optional>
              <Input
                id='validUntil'
                type='date'
                name='validUntil'
                min={form.validFrom || undefined}
                value={form.validUntil ?? ''}
                onChange={handleChange}
              />
            </Field>
          </FieldRow>
        </FormSection>

        <FormSection title='Status'>
          <SwitchField
            label='Active'
            description='Inactive coupons are rejected at checkout, even within their dates.'
            checked={!!form.isActive}
            onCheckedChange={checked =>
              setForm(prev => ({ ...prev, isActive: checked }))
            }
          />
        </FormSection>
      </FormBody>

      <FormFooter>
        <Button type='button' variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button type='submit' disabled={saving}>
          {saving && <Loader2 className='animate-spin' />}
          {coupon ? 'Save changes' : 'Create coupon'}
        </Button>
      </FormFooter>
    </form>
  );
}
