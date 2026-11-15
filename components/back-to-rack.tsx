'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useRackSession } from './rack-session';

export function BackToRack({ slug, shelf }: { slug: string; shelf: string }) {
  const router = useRouter();
  const { position } = useRackSession();
  const link = useRef<HTMLAnchorElement>(null);
  const leaving = useRef(false);
  const href = `/#shelf-${shelf}`;

  return (
    <Link ref={link} href={href} onNavigate={event => {
      event.preventDefault();
      if (leaving.current) return;
      leaving.current = true;
      const panel = link.current?.closest('main');
      const navigate = () => {
        if (position.current?.slug === slug) router.back();
        else router.push(href);
      };
      if (!panel || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        navigate();
        return;
      }
      const exit = panel.animate(
        [{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(-64px)', opacity: 0 }],
        { duration: 230, easing: 'ease-in', fill: 'forwards' },
      );
      void exit.finished.then(() => { if (panel.isConnected) navigate(); }).catch(() => {});
    }}>
      ← Back to the rack
    </Link>
  );
}
