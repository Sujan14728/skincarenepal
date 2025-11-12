import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
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
  title: {
    default: 'Care And Clean Nepal',
    template: '%s | Care And Clean Nepal'
  },
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
    'Care And Clean Nepal'
  ],
  authors: [
    { name: 'Care And Clean Nepal', url: 'https://careandcleannp.com' }
  ],
  applicationName: 'Care And Clean Nepal',
  metadataBase: new URL('https://careandcleannp.com'),
  alternates: {
    canonical: 'https://careandcleannp.com'
  },
  openGraph: {
    type: 'website',
    url: 'https://careandcleannp.com',
    siteName: 'Care And Clean Nepal',
    title: 'Care And Clean Nepal',
    description:
      'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
    images: [{ url: '/logo.jpg', width: 800, height: 600 }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Care And Clean Nepal',
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
  const imagekitEndpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    process.env.IMAGEKIT_URL_ENDPOINT ||
    '';
  return (
    <html lang='en'>
      <head>
        {imagekitEndpoint ? (
          <link rel='preconnect' href={imagekitEndpoint} />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Organization & Website JSON-LD */}
        <Script
          id='ld-org'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Care And Clean Nepal',
              url: 'https://careandcleannp.com',
              logo: 'https://careandcleannp.com/logo.jpg',
              sameAs: []
            })
          }}
        />
        <Script
          id='ld-website'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Care And Clean Nepal',
              url: 'https://careandcleannp.com',
              potentialAction: {
                '@type': 'SearchAction',
                target:
                  'https://careandcleannp.com/products?query={search_term_string}',
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
