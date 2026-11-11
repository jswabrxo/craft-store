'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { products, peso } from '@/lib/products';
import { useRackSession } from './rack-session';
import PixelTitle from './pixel-title';
import ProductMotion from './product-motion';
import RackMenu from './rack-menu';
export default function Rack() {
  const { saved, toggleSaved, position } = useRackSession();
  const [message, setMessage] = useState('');
  useEffect(() => {
    const previous = position.current;
    if (!previous || window.location.href !== previous.url) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(previous.focusId ?? `product-link-${previous.slug}`)?.focus({ preventScroll: true });
      window.scrollTo({ top: previous.scrollY, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [position]);

  function toggle(slug: string, name: string) {
    const exists = saved.includes(slug);
    toggleSaved(slug);
    setMessage(`${name} ${exists ? 'removed from' : 'added to'} your wishlist.`);
  }
  return <main className="mx-auto max-w-3xl">
    <Link className="skip" href="#collection">Skip to collection</Link>
    <nav className="topbar flex items-center justify-between" aria-label="Main"><RackMenu /><Link href="#wishlist">Wishlist <span className="count">{saved.length}</span></Link></nav>
    <header className="hero text-center">
      <p className="eyebrow">THE CLOUD RACK</p>
      <PixelTitle />
      <div className="drop-label">DROP 01 / SMALL PREORDER COLLECTION</div>
      <p className="intro">Beaded bracelets &amp; keychains.<br />Silver-tone charms. Little things to keep close.</p>
      <Link className="browse" href="#collection">Browse Drop 01 <span aria-hidden="true">↓</span></Link>
      <p className="sample">Sample pieces &amp; prices · Wishlist demo</p>
    </header>
    <div className="rack" id="collection">
      <div className="rack-heading flex justify-between items-center"><h2>Drop 01</h2><span className="mono">06 OBJECTS</span></div>
      {[['01', 'Bracelets / first picks', products.slice(0, 2)], ['02', 'Bracelets / a little extra', products.slice(2, 4)], ['03', 'Beaded keychains', products.slice(4, 6)]].map(([number, title, items]) => <section className="shelf" key={number as string} aria-labelledby={`shelf-${number}`}>
        <h3 id={`shelf-${number}`}><span className="shelf-number">{number as string}</span>{title as string}</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">{(items as typeof products[number][]).map(item => <article key={item.slug}>
          <ProductMotion slug={item.slug}><div className="image-box"><span className="object-id mono">OO—{String(products.indexOf(item) + 1).padStart(2, '0')}</span><span className={`shape ${item.type.toLowerCase()}`} aria-hidden="true" /><span>{item.type}</span></div></ProductMotion>
          <div className="nameplate"><Link id={`product-link-${item.slug}`} href={`/products/${item.slug}/`} onNavigate={() => { position.current = { slug: item.slug, scrollY: window.scrollY, url: window.location.href }; }}>{item.name}</Link><span>{peso(item.price)}</span></div>
          <button type="button" className="save-button" aria-pressed={saved.includes(item.slug)} aria-label={`${saved.includes(item.slug) ? 'Remove' : 'Save'} ${item.name} ${saved.includes(item.slug) ? 'from' : 'to'} wishlist`} onClick={() => toggle(item.slug, item.name)}>{saved.includes(item.slug) ? '✓ Saved · Remove' : '+ Save to wishlist'}</button>
        </article>)}</div><div className="shelf-edge" aria-hidden="true" />
      </section>)}
      <section className="shelf wishlist" id="wishlist" aria-labelledby="wishlist-title">
        <h3 id="wishlist-title"><span className="shelf-number">04</span>Your wishlist tray <span className="count">{saved.length}</span></h3>
        <div className="tray"><span className="cart-shape" aria-hidden="true">♡</span>{saved.length === 0 ? <div><p>Your little collection starts here.</p><p className="muted">Tap “Save to wishlist” on a piece above.</p></div> : <ul>{products.filter(item => saved.includes(item.slug)).map(item => <li key={item.slug}><div>{item.name}<span className="muted">{item.type} · {peso(item.price)}</span></div><button onClick={() => toggle(item.slug, item.name)} aria-label={`Remove ${item.name} from tray`}>Remove</button></li>)}</ul>}</div>
        <p className="tray-note">Saved for this visit. Refreshing clears your tray.</p><div className="shelf-edge" aria-hidden="true" />
      </section>
    </div>
    <footer className="flex justify-between"><span className="mono">ODD OBJECTS</span><span>Drop 01 · Prototype only</span></footer>
    <p className="sr-only" role="status" aria-live="polite">{message}</p>
  </main>;
}
