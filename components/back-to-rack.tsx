'use client';

import { dropPath } from '@/lib/catalog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { ClickDecoration } from './decorations';
import { useRackSession } from './rack-session';

export function BackToRack({ slug, shelf }: { slug: string; shelf: string }) {
  const router = useRouter();
  const { position,catalog } = useRackSession();
  const link = useRef<HTMLAnchorElement>(null);
  const leaving = useRef(false);
  const href = `${dropPath(catalog?.drop)}#shelf-${shelf}`;

  return (
    <>
    <ClickDecoration theme={catalog?.drop.theme} />
    <Link className="back-to-rack" ref={link} href={href} onNavigate={event => {
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
      <span aria-hidden="true">←</span> Back to the rack
    </Link>
    </>
  );
}
