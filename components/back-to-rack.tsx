'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRackSession } from './rack-session';

export function BackToRack({ slug, shelf }: { slug: string; shelf: string }) {
  const router = useRouter();
  const { position } = useRackSession();

  return (
    <Link href={`/#shelf-${shelf}`} onNavigate={event => {
      if (position.current?.slug === slug) {
        event.preventDefault();
        router.back();
      }
    }}>
      ← Back to the rack
    </Link>
  );
}
