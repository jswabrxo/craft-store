'use client';

/* Supabase product photos are already sized and served by Storage. */
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { colorImageUrl, type ProductColor } from '@/lib/colors';
import { useRackSession } from './rack-session';

export function ColorChooser({ slug, name, options, color, select }: {
  slug: string;
  name: string;
  options: ProductColor[];
  color?: ProductColor;
  select: (slug: string) => void;
}) {
  const { cart, catalog } = useRackSession();
  if (!color) return null;
  const variantLabel = catalog?.drop.theme['variant-label-'+slug]?.trim();
  const sharesSwatch = (option: ProductColor) => options.some(other =>
    other.slug !== option.slug && other.swatch_hex.toLowerCase() === option.swatch_hex.toLowerCase());
  const label = variantLabel || (options.some(sharesSwatch) ? 'Style' : 'Color');
  return <fieldset className="color-chooser" aria-label={`${name} ${label.toLowerCase()}`}>
    {options.map(option => {
      const count = cart.find(line => line.slug === slug && line.color.slug === option.slug)?.quantity ?? 0;
      return <button type="button" key={option.slug}
        style={{ '--swatch': option.swatch_hex } as CSSProperties}
        aria-label={count ? `${option.name}, ${count} in cart` : option.name} title={option.name} aria-pressed={option.slug === color.slug}
        onClick={() => select(option.slug)}>
        <span aria-hidden="true">{variantLabel || sharesSwatch(option) ? '◆' : '★'}</span>{count > 0 && <span className="swatch-count" aria-hidden="true">{count}</span>}
      </button>;
    })}
    <span className="color-caption">{label}: {color.name}</span>
  </fieldset>;
}

export function ColorArt({ type, color, decorative = false }: {
  type: string; color?: ProductColor; decorative?: boolean;
}) {
  const path = color?.image_path;
  const [failed, setFailed] = useState<string>();
  if (path && failed !== path) {
    return <img className="color-photo" src={colorImageUrl(path)} draggable={false}
      onError={() => setFailed(path)}
      alt={decorative ? '' : (color.image_alt || `${color.name} ${type.toLowerCase()}`)} />;
  }
  return <span className={`shape ${type.toLowerCase()}`} aria-hidden="true"
    style={color ? { borderColor: color.swatch_hex } : undefined} />;
}

export function CartControls({ slug, name, color, showQuantity = true }: {
  slug: string; name: string; color?: ProductColor; showQuantity?: boolean;
}) {
  const { cart, changeQuantity } = useRackSession();
  const [notice, setNotice] = useState<{ x: number; y: number; label: string; id: number }>();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(undefined), 2300);
    return () => clearTimeout(timer);
  }, [notice]);
  if (!color) return <button type="button" className="save-button" disabled>Add to cart</button>;
  const label = `${name}, ${color.name}`;
  const quantity = cart.find(line => line.slug === slug && line.color.slug === color.slug)?.quantity ?? 0;

  const atLimit = quantity >= Math.min(20, color.stock_quantity ?? 20, color.preorder_limit ?? 20);

  function change(delta: number, event: MouseEvent<HTMLButtonElement>) {
    if (!color) return;
    changeQuantity(slug, color, delta);
    if (delta <= 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail ? event.clientX : bounds.left + bounds.width / 2;
    const y = event.detail ? event.clientY : bounds.top + bounds.height / 2;
    const pageY = window.scrollY + Math.max(8, y - 48);
    setNotice({ x, y: pageY, label: `${name} (${color.name}) added`, id: performance.now() });
  }

  return <div className="cart-controls">
    {showQuantity && <div className="quantity" role="group" aria-label={`${label} quantity in cart`}>
      <button type="button" disabled={quantity === 0} aria-label={`Decrease ${label} quantity`} onClick={event => change(-1, event)}>−</button>
      <output aria-label="Quantity">{quantity}</output>
      <button type="button" disabled={atLimit} aria-label={`Increase ${label} quantity`} onClick={event => change(1, event)}>+</button>
    </div>}
    <button type="button" className="save-button" disabled={atLimit} onClick={event => change(1, event)}>{color.stock_quantity === 0 ? 'Sold out' : '+ Add to cart'}</button>
    <span className="sr-only" role="status">{notice?.label}</span>
    {notice && createPortal(
      <span key={notice.id} className="cart-notice" aria-hidden="true"
        style={{ '--notice-x': `${notice.x}px`, '--notice-y': `${notice.y}px` } as CSSProperties}>
        + {notice.label}
      </span>, document.body)}
  </div>;
}
