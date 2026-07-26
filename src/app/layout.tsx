import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { LayoutWrapper } from '@/components/layout-wrapper';
import { getOrganizationSchema } from '@/lib/seo-utils';
import { JsonLd } from '@/components/json-ld';

export const viewport: Viewport = {
  themeColor: '#001f54',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hrat-india.org'),
  title: {
    default: 'Human Rights Affairs Trust (Justice Shield) | Official Website',
    template: '%s | Human Rights Affairs Trust (Justice Shield)',
  },
  description: 'Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India (Reg. No. WB/2025/0762605). Dedicated to constitutional literacy, legal aid, and social justice across all Indian states.',
  keywords: ['Human Rights India', 'Legal Aid India', 'Justice Shield', 'Constitutional Literacy', 'BNSS 2023', 'BNS 2023', 'NGO India', 'Human Rights Affairs Trust', 'Dhritiman Dey'],
  authors: [{ name: 'Human Rights Affairs Trust' }],
  creator: 'Human Rights Affairs Trust',
  publisher: 'Human Rights Affairs Trust',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.hrat-india.org',
    siteName: 'Human Rights Affairs Trust (Justice Shield)',
    title: 'Human Rights Affairs Trust (Justice Shield) | Upholding Justice',
    description: 'Central Government Registered Human Rights Organization providing affordable legal aid and constitutional awareness in India.',
    images: [
      {
        url: '/Human%20R2.jpeg',
        width: 1200,
        height: 630,
        alt: 'Human Rights Affairs Trust Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Human Rights Affairs Trust (Justice Shield)',
    description: 'Providing a robust shield against injustice through expert legal guidance and constitutional transparency.',
    images: ['/Human%20R2.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
        <JsonLd data={getOrganizationSchema()} />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <FirebaseErrorListener />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
