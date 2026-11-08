import './globals.css';
import Script from 'next/script';
import type { Metadata, Viewport } from 'next';
import { BcvProvider } from './context/BcvContext';

export const metadata: Metadata = {
  title: 'Bukea — Reserva con estatus',
  description: 'Reservas exclusivas, inmersión 360°, menús en Realidad Aumentada y pases digitales para comensales en Margarita.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Story+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-[#0A0A0A] min-h-screen font-text selection:bg-neutral-900 selection:text-white">
        <BcvProvider>
          {children}
        </BcvProvider>
        <Script
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
