'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';

type PaymentSectionProps = {
  settings: { qrImageUrl: string | null } | null;
};

export default function PaymentSection({ settings }: PaymentSectionProps) {
  const [isQrOpen, setIsQrOpen] = useState(false);

  return (
    <Card className='space-y-3 p-4'>
      <div>
        <h2 className='text-lg font-semibold'>Payment</h2>
        <p className='text-sm text-muted-foreground'>
          Please scan the QR code below to make a payment.
        </p>
      </div>
      {settings?.qrImageUrl && (
        <>
          <div
            className='relative h-64 w-full cursor-pointer overflow-hidden rounded-md border'
            onClick={() => setIsQrOpen(true)}
          >
            <Image
              src={settings.qrImageUrl}
              alt='QR of Care And Clean Nepal'
              fill
              className='object-contain'
            />
          </div>

          {isQrOpen && (
            <div
              className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'
              onClick={() => setIsQrOpen(false)}
            >
              <div className='relative max-h-[90vh] max-w-[90vw] p-4'>
                <Image
                  src={settings.qrImageUrl}
                  alt='QR Enlarged'
                  width={600}
                  height={600}
                  className='rounded shadow-lg'
                />
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
