'use client';

import { useEffect, useState } from 'react';
import { colorImageUrl, type ProductColor } from '@/lib/colors';
import { ProductMagnifier } from './product-magnifier';
import { StockBadge } from './stock-badge';

export function ProductGallery({ color, type }: { color?: ProductColor; type: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const mockups = color?.mockup_paths?.filter(Boolean).slice(0, 4) ?? [];
  const paths = mockups.length ? [color?.lifestyle_path, ...mockups] : [color?.image_path, color?.lifestyle_path];
  const photos = [...new Set(paths.filter((path): path is string => !!path))];
  const photoCount = photos.length;
  const hasLifestyle = photoCount > 1;
  const selected = index % Math.max(photoCount, 1);
  useEffect(() => {
    if (photoCount < 2 || paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex(value => (value + 1) % photoCount), 4500);
    return () => clearInterval(timer);
  }, [photoCount, paused]);
  const main = color && photos[selected]
    ? { ...color, image_path: photos[selected], image_alt: selected ? 'Product view '+(selected+1) : color.image_alt }
    : color;

  const frame = <div className="stock-frame"><ProductMagnifier type={type} color={main} animate={hasLifestyle} />
    {hasLifestyle && <button className="lens-toggle gallery-playback" type="button"
      aria-label={paused ? 'Play slideshow' : 'Pause slideshow'}
      onClick={() => setPaused(value => !value)}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {paused ? <path d="M8 4l13 8-13 8z" /> : <path d="M7 5v14M17 5v14" />}
      </svg>
    </button>}<StockBadge color={color} /></div>;
  if (!hasLifestyle) return frame;
  return <div className="product-gallery" data-photos={photoCount}>
    <div className="gallery-rail" aria-label="Product photos">
      {photos.map((path, index) => <button key={index} type="button"
        aria-label={'Product view '+(index+1)} aria-pressed={selected === index}
        onClick={() => { setIndex(index); setPaused(true); }}>
        <img src={colorImageUrl(path)} alt="" />
      </button>)}
    </div>
    {frame}
  </div>;
}
