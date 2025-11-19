'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CustomerFormValues } from '@/lib/types/checkout';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

type Props = {
  form: ReturnType<typeof useForm<CustomerFormValues>>;
  paymentImage: File | null;
  setPaymentImage: (_f: File | null) => void;
};

export default function CustomerDetails({
  form,
  paymentImage,
  setPaymentImage
}: Props) {
  const paymentMethod = form.watch('paymentMethod');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(() => {})} className='space-y-3'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder='eg. Ram Joshi' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} placeholder='eg. ram12@gmail.com' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder='eg. 9812345678' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='shippingAddress'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping address</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder='eg. Near KKFC, Maitidevi, Kathmandu'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='note'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note (optional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ''}
                  placeholder='eg. Deliver within 4 days if possible'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='paymentMethod'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment method</FormLabel>
              <FormControl>
                <div className='flex gap-4'>
                  <label className='flex items-center gap-2'>
                    <input
                      {...field}
                      type='radio'
                      value='COD'
                      checked={field.value === 'COD'}
                      onChange={() => field.onChange('COD')}
                    />
                    COD
                  </label>
                  <label className='flex items-center gap-2'>
                    <input
                      {...field}
                      type='radio'
                      value='ONLINE'
                      checked={field.value === 'ONLINE'}
                      onChange={() => field.onChange('ONLINE')}
                    />
                    ONLINE
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {paymentMethod === 'ONLINE' && (
          <div className='flex flex-col gap-2'>
            <FormLabel>Payment slip (optional)</FormLabel>
            <input
              type='file'
              accept='image/*,application/pdf'
              onChange={e => setPaymentImage(e.target.files?.[0] ?? null)}
            />
            {paymentImage && (
              <div className='mt-2'>
                {paymentImage.type.startsWith('image/') ? (
                  <Image
                    width={192}
                    height={192}
                    src={URL.createObjectURL(paymentImage)}
                    alt='Payment slip preview'
                    className='max-h-48 rounded'
                  />
                ) : (
                  <p>{paymentImage.name}</p>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}
