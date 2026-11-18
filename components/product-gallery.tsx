'use client';

import { useEffect, useState } from 'react';
import { colorImageUrl, type ProductColor } from '@/lib/colors';
import { ProductMagnifier } from './product-magnifier';
import { StockBadge } from './stock-badge';

export function ProductGallery({ color, type }: { color?: ProductColor; type: string }) {
  const [lifestyle, setLifestyle] = useState(false);
  const [paused, setPaused] = useState(false);
  const hasLifestyle = !!(color?.image_path && color.lifestyle_path);
  useEffect(() => {
    if (!hasLifestyle || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setLifestyle(value => !value), 4500);
    return () => clearInterval(timer);
  }, [hasLifestyle, paused]);
  const main = color && lifestyle && color.lifestyle_path
    ? { ...color, image_path: color.lifestyle_path, image_alt: type === 'Bracelet' ? 'Bracelet shown on a wrist' : 'Keychain shown clipped to a bag' }
    : color;

  const frame = <div className="stock-frame"><ProductMagnifier type={type} color={main} animate={hasLifestyle} />
    {hasLifestyle && <button className="lens-toggle gallery-playback" type="button"
      aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
      onClick={() => setPaused(value => !value)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {paused ? <path d="M8 4l13 8-13 8z" /> : <path d="M7 5v14M17 5v14" />}
      </svg>
    </button>}<StockBadge color={color} /></div>;
  if (!color?.image_path || !color.lifestyle_path) return frame;
  return <div className="product-gallery">
    <div className="gallery-rail" aria-label="Product photos">
      {[color.image_path, color.lifestyle_path].map((path, index) => <button key={path} type="button"
        aria-label={index ? 'Lifestyle photo' : 'Product photo'} aria-pressed={lifestyle === Boolean(index)}
        onClick={() => { setLifestyle(Boolean(index)); setPaused(true); }}>
        <img src={colorImageUrl(path)} alt="" />
      </button>)}
    </div>
    {frame}
  </div>;
}
