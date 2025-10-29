// components/product/ProductImageGallery.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  hasDiscount?: boolean;
  discountedPercent?: number;
}

export const ProductImageGallery = ({
  images,
  productName,
  hasDiscount,
  discountedPercent = 0
}: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images[0]);

  return (
    <div className=''>
      {/* Main Image */}
      <div className='relative overflow-hidden rounded-xl bg-gray-100'>
        {hasDiscount && (
          <div className='absolute top-4 right-4 z-10 rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white uppercase'>
            {discountedPercent}% Off
          </div>
        )}
        <Image
          src={selectedImage}
          alt={productName}
          width={600}
          height={600}
          className='h-[32rem] w-full object-contain scale-[0.9]'
          priority
        />
      </div>

      {/* Thumbnail Gallery */}
      <div className='mt-4 flex gap-4'>
        {images.map((image, index) => (
          <div
            key={index}
            className={`w-24 cursor-pointer overflow-hidden rounded-xl border-2 transition-all duration-200 ${
              selectedImage === image
                ? 'border-green-500'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setSelectedImage(image)}
          >
            <Image
              src={image}
              alt={`${productName} thumbnail ${index + 1}`}
              width={100}
              height={100}
              className='h-full w-full object-cover'
            />
          </div>
        ))}
      </div>
    </div>
  );
};
