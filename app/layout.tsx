import type { Metadata } from 'next';
import './globals.css';
import { RackSessionProvider } from '@/components/rack-session';
export const metadata: Metadata = { title: 'ODD OBJECTS | Drop 01', description: 'A small preorder collection of beaded bracelets and keychains with silver-tone charms. Sample wishlist prototype.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><RackSessionProvider>{children}</RackSessionProvider></body></html>;
}
