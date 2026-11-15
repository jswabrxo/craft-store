'use client';

import { useState, type PointerEvent } from 'react';
import { ColorArt } from './color-controls';
import type { ProductColor } from '@/lib/colors';

export function ProductMagnifier({ type, color }: { type: string; color?: ProductColor }) {
  const [enabled, setEnabled] = useState(false);

  function moveLens(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || (event.target as HTMLElement).closest('button')) return;
    const image = event.currentTarget;
    const bounds = image.getBoundingClientRect();
    image.style.setProperty('--lens-x', `${event.clientX - bounds.left - image.clientLeft}px`);
    image.style.setProperty('--lens-y', `${event.clientY - bounds.top - image.clientTop}px`);
  }

  return (
    <div className="image-box magnifier" data-magnifying={enabled || undefined}
      onPointerMove={moveLens} onPointerDown={moveLens}>
      <div className="magnifier-art"><ColorArt type={type} color={color} /></div>
      <div className="magnifier-window" aria-hidden="true">
        <div className="magnifier-art magnifier-zoom"><ColorArt type={type} color={color} decorative /></div>
      </div>
      <div className="magnifier-ring" aria-hidden="true" />
      <button type="button" className="lens-toggle" aria-pressed={enabled}
        onClick={() => setEnabled(value => !value)}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" />
        </svg> Zoom
      </button>
    </div>
  );
}
