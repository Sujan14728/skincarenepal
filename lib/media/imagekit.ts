import ImageKit from 'imagekit';

// Server-side ImageKit instance (with private key)
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

// Client-side configuration (without private key)
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || ''
};

// Upload authentication for client-side uploads
export async function getUploadAuth() {
  try {
    const authResponse = await imagekit.getAuthenticationParameters();
    return {
      signature: authResponse.signature,
      expire: authResponse.expire,
      token: authResponse.token
    };
  } catch (error) {
    console.error('Error getting ImageKit auth:', error);
    throw new Error('Failed to get upload authentication');
  }
}

// Helper function to generate optimized image URLs
export function getOptimizedImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max';
    focus?: 'auto' | 'face' | 'center';
  } = {}
) {
  if (!src || !process.env.IMAGEKIT_URL_ENDPOINT) {
    return src;
  }

  // If it's already an ImageKit URL, return as is
  if (src.includes('imagekit.io')) {
    return src;
  }

  // Build transformation parameters
  const transformations: string[] = [];

  if (options.width) transformations.push(`w-${options.width}`);
  if (options.height) transformations.push(`h-${options.height}`);
  if (options.quality) transformations.push(`q-${options.quality}`);
  if (options.format) transformations.push(`f-${options.format}`);
  if (options.crop) transformations.push(`c-${options.crop}`);
  if (options.focus) transformations.push(`fo-${options.focus}`);

  const transformationString =
    transformations.length > 0 ? `tr:${transformations.join(',')}` : '';

  // Construct optimized URL
  const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT;
  return transformationString
    ? `${baseUrl}/${transformationString}/${src}`
    : `${baseUrl}/${src}`;
}

// Validation helpers
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export function validateFile(file: File, type: 'image' | 'video' = 'image') {
  const allowedTypes =
    type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
  }

  return true;
}
