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
  const [loading, setLoading] = useState(true);
  const [hasShownOnce, setHasShownOnce] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    async function fetchPopup() {
      setLoading(true);
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
      } finally {
        setLoading(false);
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
    }, 3500); // Increased from 2000ms to 3500ms for better viewing
    return () => clearInterval(interval);
  }, [popupData]);

  // Show skeleton while loading
  if (loading) {
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

  // Don't show popup if no data after loading
  if (!popupData) {
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
                <DialogTitle className='text-center text-2xl font-bold text-primary'>
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
                    {/* Previous Button */}
                    {popupData.products.length > 1 && (
                      <button
                        onClick={() =>
                          setCurrentIndex(prev =>
                            prev === 0
                              ? popupData.products.length - 1
                              : prev - 1
                          )
                        }
                        className='absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70'
                        aria-label='Previous image'
                      >
                        ←
                      </button>
                    )}

                    <Image
                      src={popupData.products[currentIndex].image}
                      alt={popupData.products[currentIndex].name}
                      fill
                      className='rounded-xl object-contain transition-all duration-700 ease-in-out'
                    />

                    {/* Next Button */}
                    {popupData.products.length > 1 && (
                      <button
                        onClick={() =>
                          setCurrentIndex(prev =>
                            prev === popupData.products.length - 1
                              ? 0
                              : prev + 1
                          )
                        }
                        className='absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70'
                        aria-label='Next image'
                      >
                        →
                      </button>
                    )}
                  </div>

                  <p className='mt-3 text-center text-lg font-semibold text-gray-600'>
                    {popupData.products[currentIndex].name}
                  </p>

                  {/* Dot Indicators - Now Clickable */}
                  {popupData.products.length > 1 && (
                    <div className='mt-3 flex space-x-2'>
                      {popupData.products.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentIndex(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            i === currentIndex
                              ? 'w-6 bg-[var(--primary)]'
                              : 'w-2 bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Image Counter */}
                  {popupData.products.length > 1 && (
                    <p className='mt-2 text-sm text-gray-500'>
                      {currentIndex + 1} / {popupData.products.length}
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
