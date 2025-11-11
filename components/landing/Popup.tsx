'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupDetail {
  id: number;
  name: string;
  image: string;
}

interface Popup {
  id: number;
  title: string;
  description: string;
  PopupDetails?: PopupDetail[];
}

interface PopupResponse {
  popups: Popup[];
}

interface Product {
  id: number;
  name: string;
  image: string;
}

interface PopupData {
  title: string;
  description: string;
  products: Product[];
}

export default function GlobalPopupDialog() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    async function fetchPopup() {
      try {
        const res = await fetch('/api/popup');
        const data: PopupResponse = await res.json();

        if (Array.isArray(data.popups) && data.popups.length > 0) {
          const firstPopup = data.popups[0];
          setPopupData({
            title: firstPopup.title,
            description: firstPopup.description,
            products:
              firstPopup.PopupDetails?.map((d: PopupDetail) => ({
                id: d.id,
                name: d.name,
                image: d.image
              })) || []
          });

          // Only open automatically if not shown before
          if (!hasShownOnce) {
            setOpen(true);
            setHasShownOnce(true);
          }
        } else {
          console.warn('No popup data found');
        }
      } catch (err) {
        console.error('Error fetching popup data', err);
      }
    }

    fetchPopup();
  }, [pathname, hasShownOnce]);

  // Auto-slide
  useEffect(() => {
    if (!popupData?.products?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        prev === popupData.products.length - 1 ? 0 : prev + 1
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [popupData]);

  if (!popupData) {
    // Show skeleton only if we're still loading and should show popup
    if (!hasShownOnce) {
      return (
        <AnimatePresence>
          <Dialog open={true} onOpenChange={() => {}}>
            <DialogContent className='overflow-hidden rounded-2xl bg-white p-6 shadow-xl sm:max-w-[450px]'>
              <DialogHeader>
                <DialogTitle className='text-center text-2xl font-bold'>
                  <span className='inline-block h-6 w-3/4 animate-pulse rounded bg-gray-200' />
                </DialogTitle>
                <DialogDescription className='px-8 text-center'>
                  <span className='inline-block h-4 w-5/6 animate-pulse rounded bg-gray-200' />
                </DialogDescription>
              </DialogHeader>
              <div className='animate-pulse space-y-4'>
                <div className='mx-auto mt-6 h-64 w-64 rounded-xl bg-gray-200' />
                <div className='mx-auto h-4 w-1/2 rounded bg-gray-200' />
              </div>
            </DialogContent>
          </Dialog>
        </AnimatePresence>
      );
    }
    return null;
  }

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className='overflow-hidden rounded-2xl bg-white p-6 shadow-xl sm:max-w-[450px]'>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            >
              <DialogHeader>
                <DialogTitle className='text-primary text-center text-2xl font-bold'>
                  {popupData.title}
                </DialogTitle>
                <DialogDescription className='px-8 text-center font-semibold text-gray-600'>
                  {popupData.description}
                </DialogDescription>
              </DialogHeader>

              {/* Carousel */}
              {popupData.products.length > 0 && (
                <div className='mt-6 flex flex-col items-center justify-center'>
                  <div className='relative h-64 w-64 overflow-hidden rounded-xl shadow-md'>
                    <Image
                      src={popupData.products[currentIndex].image}
                      alt={popupData.products[currentIndex].name}
                      fill
                      className='rounded-xl object-contain transition-all duration-700 ease-in-out'
                    />
                  </div>
                  <p className='mt-3 text-center text-lg font-semibold text-gray-600'>
                    {popupData.products[currentIndex].name}
                  </p>

                  <div className='mt-3 flex space-x-2'>
                    {popupData.products.map((_, i) => (
                      <span
                        key={i}
                        className={`h-2 w-2 rounded-full transition-all duration-300 ${
                          i === currentIndex
                            ? 'w-2 bg-[var(--primary)]'
                            : 'bg-gray-300'
                        }`}
                      ></span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
