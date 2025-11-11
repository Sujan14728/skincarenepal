import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'Care and Clean Nepal',
  description:
    'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16' },
      { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32' },
      { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
      { rel: 'icon', url: '/android-chrome-512x512.png', sizes: '512x512' }
    ]
  },
  keywords: [
    'organic skincare',
    'face pack nepal',
    'natural beauty products',
    'Care and Clean Nepal'
  ],
  authors: [
    { name: 'Care and Clean Nepal', url: 'https://careandcleannp.com' }
  ],
  applicationName: 'Care and Clean Nepal',
  metadataBase: new URL('https://careandcleannp.com'),
  alternates: {
    canonical: 'https://careandcleannp.com'
  },
  openGraph: {
    title: 'Care and Clean Nepal',
    description:
      'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
    images: [{ url: '/logo.jpg', width: 800, height: 600 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Care and Clean Nepal',
    description:
      'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
    images: ['/logo.jpg']
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
