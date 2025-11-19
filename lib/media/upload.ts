import { validateFile } from './imagekit';

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  useUniqueFileName?: boolean;
  tags?: string[];
  isPrivateFile?: boolean;
  customCoordinates?: string;
  responseFields?: string[];
}

export interface UploadResponse {
  fileId: string;
  name: string;
  size: number;
  versionInfo: {
    id: string;
    name: string;
  };
  filePath: string;
  url: string;
  fileType: string;
  height?: number;
  width?: number;
  thumbnailUrl?: string;
  AITags?: Array<{
    name: string;
    confidence: number;
  }>;
}

export interface UploadError {
  message: string;
  help?: string;
  reason?: string;
}

// Client-side upload function
export async function uploadToImageKit(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResponse> {
  try {
    // Validate file
    validateFile(file, file.type.startsWith('video/') ? 'video' : 'image');

    // Get authentication from our API
    const authResponse = await fetch('/api/media/auth');
    if (!authResponse.ok) {
      throw new Error('Failed to get upload authentication');
    }

    const authData = await authResponse.json();
    if (!authData.success) {
      throw new Error(authData.error || 'Authentication failed');
    }

    // Prepare upload data
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'publicKey',
      process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ''
    );
    formData.append('signature', authData.data.signature);
    formData.append('expire', authData.data.expire.toString());
    formData.append('token', authData.data.token);

    // Add optional parameters
    if (options.folder) {
      formData.append('folder', options.folder);
    }

    if (options.fileName) {
      formData.append('fileName', options.fileName);
    } else {
      // Generate a clean filename
      const timestamp = Date.now();
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      formData.append('fileName', `${timestamp}_${cleanName}`);
    }

    if (options.useUniqueFileName !== undefined) {
      formData.append(
        'useUniqueFileName',
        options.useUniqueFileName.toString()
      );
    }

    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    if (options.isPrivateFile !== undefined) {
      formData.append('isPrivateFile', options.isPrivateFile.toString());
    }

    // Upload to ImageKit
    const uploadResponse = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        body: formData
      }
    );

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await uploadResponse.json();
    return result as UploadResponse;
  } catch (error) {
    console.error('Upload error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Upload failed');
  }
}

// Generate thumbnail URL for images
export function getThumbnailUrl(
  originalUrl: string,
  size: number = 300
): string {
  if (!originalUrl || !originalUrl.includes('imagekit.io')) {
    return originalUrl;
  }

  // Add thumbnail transformation
  const url = new URL(originalUrl);
  const pathParts = url.pathname.split('/');

  // Insert transformation
  pathParts.splice(-1, 0, `tr:w-${size},h-${size},c-at_max,q-80,f-auto`);

  url.pathname = pathParts.join('/');
  return url.toString();
}

// Progress tracking for uploads
export class UploadProgress {
  private callbacks: Array<(_progress: number) => void> = [];

  onProgress(callback: (_progress: number) => void) {
    this.callbacks.push(callback);
  }

  updateProgress(progress: number) {
    this.callbacks.forEach(callback => callback(progress));
  }
}

// Batch upload with progress tracking
export async function batchUpload(
  files: File[],
  options: UploadOptions = {},
  onProgress?: (_fileIndex: number, _progress: number) => void
): Promise<UploadResponse[]> {
  const results: UploadResponse[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      onProgress?.(i, 0);
      const result = await uploadToImageKit(files[i], {
        ...options,
        folder: options.folder || 'articles/images'
      });
      results.push(result);
      onProgress?.(i, 100);
    } catch (error) {
      console.error(`Failed to upload file ${i + 1}:`, error);
      onProgress?.(i, -1); // Indicate error
      throw error;
    }
  }

  return results;
}
