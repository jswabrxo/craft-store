'use client';

import type { PointerEvent } from 'react';

export function ProductMagnifier({ type }: { type: string }) {
  const shape = <span className={`shape ${type.toLowerCase()}`} aria-hidden="true" />;

  function moveLens(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const image = event.currentTarget;
    const bounds = image.getBoundingClientRect();
    image.style.setProperty('--lens-x', `${event.clientX - bounds.left - image.clientLeft}px`);
    image.style.setProperty('--lens-y', `${event.clientY - bounds.top - image.clientTop}px`);
    image.dataset.magnifying = 'true';
  }

  return (
    <div className="image-box magnifier" onPointerMove={moveLens}
      onPointerLeave={event => { delete event.currentTarget.dataset.magnifying; }}>
      <div className="magnifier-art">{shape}{type}</div>
      <div className="magnifier-window" aria-hidden="true">
        <div className="magnifier-art magnifier-zoom">{shape}{type}</div>
      </div>
      <div className="magnifier-ring" aria-hidden="true" />
    </div>
  );
}
