'use client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PaymentMethod } from '@/lib/enum/product';
import { useEffect, useState } from 'react';

interface CustomerDetailsProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  shippingAddress: string;
  setShippingAddress: (address: string) => void;
  note: string;
  setNote: (note: string) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  paymentImage: File | null;
  setPaymentImage: (file: File | null) => void;
}

export default function CustomerDetails({
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  shippingAddress,
  setShippingAddress,
  note,
  setNote,
  paymentMethod,
  setPaymentMethod,
  paymentImage,
  setPaymentImage
}: CustomerDetailsProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (paymentImage) {
      const url = URL.createObjectURL(paymentImage);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [paymentImage]);

  return (
    <div>
      <h2 className='mb-2 text-lg font-semibold'>Customer Details</h2>
      <div className='mb-2 flex flex-col gap-2'>
        <label>Name</label>
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder='eg. Ram Joshi'
        />
      </div>

      <div className='mb-2 flex flex-col gap-2'>
        <label>Email</label>
        <Input
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='eg. ram12@gmail.com'
        />
      </div>

      <div className='mb-2 flex flex-col gap-2'>
        <label>Phone</label>
        <Input
          type='tel'
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder='eg. 9808800808'
        />
      </div>

      <div className='mb-2 flex flex-col gap-2'>
        <label>Shipping Address</label>
        <Textarea
          value={shippingAddress}
          onChange={e => setShippingAddress(e.target.value)}
          placeholder='eg. Near KKFC, Maitidevi, Kathmandu'
        />
      </div>

      <div className='mb-2 flex flex-col gap-2'>
        <label>Note</label>
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder='eg. Deliver within 4 days if possible!'
        />
      </div>

      <div className='mb-2 flex flex-col gap-2'>
        <label>Payment Method</label>
        <Select
          defaultValue={paymentMethod}
          onValueChange={value => setPaymentMethod(value as PaymentMethod)}
        >
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Payment Method' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='COD'>Cash on Delivery</SelectItem>
            <SelectItem value='ONLINE'>Online Payment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paymentMethod === 'ONLINE' && (
        <div className='flex flex-col gap-0'>
          <label>Payment Slip Image</label>
          <p className='text-xs text-muted-foreground'>
            (Scan the QR code above and upload the payment slip here)
          </p>
          <Input
            className='mt-2'
            type='file'
            accept='image/*'
            onChange={e => setPaymentImage(e.target.files?.[0] || null)}
          />
          {previewUrl && (
            <img
              src={previewUrl}
              alt='Payment Preview'
              className='mt-2 max-h-48 max-w-xs rounded border object-contain'
            />
          )}
        </div>
      )}
    </div>
  );
}
