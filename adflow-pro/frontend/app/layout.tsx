// Frontend - Root Layout
import type { Metadata } from 'next';
import './styles/globals.css';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';

export const metadata: Metadata = {
  title: 'AdFlow Pro - Sponsored Listing Marketplace',
  description: 'Advertise your business and reach thousands of customers. Premium sponsored listings.',
  keywords: 'ads, marketplace, sponsored, listings, advertising',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
