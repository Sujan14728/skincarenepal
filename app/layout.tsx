import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['ui-monospace', 'Menlo', 'Monaco', 'Courier New', 'monospace']
});

// Admin display face; not preloaded so the storefront never downloads it.
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  preload: false,
  display: 'swap'
});

/* -------------------------------------------------
   METADATA – Next.js injects the <link> tags for us
   ------------------------------------------------- */
export const metadata: Metadata = {
  title: {
    default: 'Care And Clean ',
    template: '%s | Care And Clean '
  },
  description:
    'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
  metadataBase: new URL('https://careandcleannp.com'),

  /* ---------- ICONS (order matters) ---------- */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' }, // primary, .ico → Google loves this
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ],
    shortcut: '/favicon.ico',
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' }
  },
  manifest: '/site.webmanifest',

  keywords: [
    'organic skincare',
    'face pack nepal',
    'natural beauty products',
    'Care And Clean'
  ],
  authors: [{ name: 'Care And Clean ', url: 'https://careandcleannp.com' }],
  applicationName: 'Care And Clean',
  alternates: { canonical: 'https://careandcleannp.com' },

  openGraph: {
    type: 'website',
    url: 'https://careandcleannp.com',
    siteName: 'Care And Clean ',
    title: 'Care And Clean',
    description:
      'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
    images: [
      { url: '/images/design/hero-collection.jpg', width: 1303, height: 1600 }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Care And Clean',
    description:
      'Shop 100% natural organic face packs in Nepal. Free delivery and best prices.',
    images: ['/images/design/hero-collection.jpg']
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff'
};

/* -------------------------------------------------
   LAYOUT
   ------------------------------------------------- */
export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const imagekitEndpoint =
    process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ||
    process.env.IMAGEKIT_URL_ENDPOINT ||
    '';

  return (
    <html lang='en'>
      <head>
        {/* Pre-connect to ImageKit (if you use it) */}
        {imagekitEndpoint && <link rel='preconnect' href={imagekitEndpoint} />}
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} antialiased`}
      >
        {/* JSON-LD scripts */}
        <Script
          id='ld-org'
          type='application/ld+json'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Care And Clean ',
              url: 'https://careandcleannp.com',
              logo: 'https://careandcleannp.com/android-chrome-512x512.png',
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
              name: 'Care And Clean',
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
