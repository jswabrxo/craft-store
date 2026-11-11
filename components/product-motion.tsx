'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRackSession } from './rack-session';

export default function ProductMotion({ slug, children }: { slug: string; children: ReactNode }) {
  const element = useRef<HTMLDivElement>(null);
  const { liftedProducts } = useRackSession();

  useEffect(() => {
    const target = element.current;
    if (!target || liftedProducts.current.has(slug)) return;

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      liftedProducts.current.add(slug);
      observer.disconnect();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        target.classList.add('is-lifting');
      }
    }, { threshold: 0.35 });

    observer.observe(target);
    return () => observer.disconnect();
  }, [slug, liftedProducts]);

  return (
    <div ref={element} className="product-visual" onAnimationEnd={event => {
      if (event.target === event.currentTarget) event.currentTarget.classList.remove('is-lifting');
    }}>
      {children}
    </div>
  );
}
