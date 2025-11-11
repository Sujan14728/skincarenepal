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

  useEffect(() => {
    const STORAGE_KEY_DATA = 'ccnp_popup_data_v1';
    const STORAGE_KEY_SHOWN = 'ccnp_popup_shown_v1';

    // Always show on each reload/navigation: remove suppression logic by ignoring STORAGE_KEY_SHOWN
    // Clear any previous flag so legacy sessions don't block display
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY_SHOWN);
      } catch {}
    }

    // Try cached data for instant display
    let cached: PopupData | null = null;
    if (typeof window !== 'undefined') {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY_DATA);
        cached = raw ? (JSON.parse(raw) as PopupData) : null;
      } catch {
        cached = null;
      }
    }
    if (cached) {
      setPopupData(cached);
      setOpen(true);
      setLoading(false);
      // Do not set a 'shown' flag; allow re-show every navigation
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/popup', { signal: controller.signal });
        if (!res.ok) throw new Error('Popup API failed');
        const data: PopupResponse = await res.json();
        if (Array.isArray(data.popups) && data.popups.length > 0) {
          const first = data.popups[0];
          const normalized: PopupData = {
            title: first.title,
            description: first.description,
            products:
              first.PopupDetails?.map(d => ({
                id: d.id,
                name: d.name,
                image: d.image
              })) || []
          };
          setPopupData(normalized);
          // cache
          try {
            sessionStorage.setItem(
              STORAGE_KEY_DATA,
              JSON.stringify(normalized)
            );
          } catch {}
          // preload first image
          if (normalized.products[0]?.image) {
            const img = document?.createElement('img');
            if (img) img.src = normalized.products[0].image;
          }
          setOpen(true);
          // Do not set a 'shown' flag; allow re-show every navigation
        } else {
          setOpen(false);
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          console.error('Error fetching popup data', err);
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    })();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Auto-slide
  useEffect(() => {
    if (!popupData?.products?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        popupData.products && prev === popupData.products.length - 1
          ? 0
          : prev + 1
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [popupData]);

  // While loading, render nothing to avoid a blocking skeleton overlay
  if (loading) return null;

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
              transition={{ duration: 0.25, ease: 'easeOut' }}
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
                    {/* {popupData.products.length > 1 && (
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
                    )} */}

                    <Image
                      src={popupData.products[currentIndex].image}
                      alt={popupData.products[currentIndex].name}
                      priority={currentIndex === 0}
                      sizes='256px'
                      fill
                      className='rounded-xl object-contain transition-all duration-700 ease-in-out'
                    />

                    {/* Next Button */}
                    {/* {popupData.products.length > 1 && (
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
                    )} */}
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
                              ? 'w-2 bg-[var(--primary)]'
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
