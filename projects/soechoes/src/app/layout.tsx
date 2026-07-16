import type { Metadata } from 'next';
import { Instrument_Serif, Inter, Lora } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display-loaded',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body-loaded',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-memory-loaded',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://soechoes.vercel.app'),
  title: 'SoEchoes — A map of the places that changed us.',
  description: 'An anonymous memory archive of the places that shaped us during the strangest years of our lives.',
  openGraph: {
    title: 'SoEchoes',
    description: 'A map of the places that changed us.',
    type: 'website',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SoEchoes — A map of the places that changed us.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SoEchoes',
    description: 'A map of the places that changed us.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${inter.variable} ${lora.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
