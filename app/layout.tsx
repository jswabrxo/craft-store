import type { Metadata } from 'next';
import './globals.css';
import { RackSessionProvider } from '@/components/rack-session';
export const metadata: Metadata = { title: 'ODD OBJECTS | Drop 01', description: 'A small preorder collection of beaded bracelets and keychains with silver-tone charms. Browse Drop 01 and build your cart.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><div className="cloud-sky" aria-hidden="true"><i /><i /><i /></div><RackSessionProvider>{children}</RackSessionProvider></body></html>;
}
