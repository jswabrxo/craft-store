'use client';
import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { products, peso } from '@/lib/products';
import { useRackSession } from './rack-session';
import PixelTitle from './pixel-title';
import { RackMotion } from './product-motion';
import RackMenu from './rack-menu';
export default function Rack() {
  const { saved, toggleSaved, position: positionRef } = useRackSession();
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState<{ name: string; id: number } | null>(null);
  const [compactTitle, setCompactTitle] = useState(false);
  const cartItems = products.filter(item => saved.includes(item.slug));

  useEffect(() => {
    const label = document.querySelector('.drop-label');
    const bar = document.querySelector('.topbar');
    if (!label || !bar) return;
    const observer = new IntersectionObserver(([entry]) => {
      setCompactTitle(entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0));
    }, { rootMargin: `-${Math.ceil(bar.getBoundingClientRect().bottom)}px 0px 0px` });
    observer.observe(label);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(null), 2300);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    const previous = positionRef.current;
    if (!previous || window.location.href !== previous.url) return;

    const frame = requestAnimationFrame(() => {
      document.getElementById(previous.focusId ?? `product-link-${previous.slug}`)?.focus({ preventScroll: true });
      window.scrollTo({ top: previous.scrollY, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [positionRef]);

  function scrollToSection(id: string) {
    positionRef.current = null;
    const target = document.getElementById(id);
    if (!target) return;
    const hash = `#${id}`;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const top = window.scrollY + target.getBoundingClientRect().top - margin;
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    target.focus({ preventScroll: true });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  function followSection(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    scrollToSection(id);
  }

  function toggle(slug: string, name: string) {
    const exists = saved.includes(slug);
    toggleSaved(slug);
    setMessage(`${name} ${exists ? 'was removed from your cart' : 'was added'}.`);
    if (!exists) setNotice(previous => ({ name, id: (previous?.id ?? 0) + 1 }));
    else if (notice?.name === name) setNotice(null);
  }
  return <main className="mx-auto max-w-3xl">
    <a className="skip" href="#collection" onClick={event => followSection(event, 'collection')}>Skip to collection</a>
    <nav className="topbar flex items-center justify-between" aria-label="Main"><a href="#cart" onClick={event => followSection(event, 'cart')}>Cart <span className="count">{saved.length}</span></a><span className={`compact-drop${compactTitle ? ' is-visible' : ''}`} aria-hidden="true">DROP 01</span>
      {notice && <span key={notice.id} className="cart-notice" aria-hidden="true"><span>+</span> {notice.name} was added</span>}
      <RackMenu onSectionNavigate={scrollToSection} /></nav>
    <header className="hero text-center">
      <p className="eyebrow">THE CLOUD RACK</p>
      <PixelTitle />
      <div className="drop-label">DROP 01 / SMALL PREORDER COLLECTION</div>
      <p className="intro">Beaded bracelets &amp; keychains.<br />Silver-tone charms. Little things to keep close.</p>
      <a className="browse" href="#collection" onClick={event => followSection(event, 'collection')}>Browse Drop 01 <span aria-hidden="true">↓</span></a>
      <p className="sample">Sample pieces &amp; prices</p>
    </header>
    <div className="rack" id="collection" tabIndex={-1}>
      <RackMotion />
      <div className="rack-heading flex justify-between items-center"><h2>Drop 01</h2><span className="mono">06 OBJECTS</span></div>
      {[['01', 'Bracelets / first picks', products.slice(0, 2)], ['02', 'Bracelets / a little extra', products.slice(2, 4)], ['03', 'Beaded keychains', products.slice(4, 6)]].map(([number, title, items]) => <section className="shelf" key={number as string} aria-labelledby={`shelf-${number}`}>
        <h3 id={`shelf-${number}`} tabIndex={-1}><span className="shelf-number">{number as string}</span>{title as string}</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">{(items as typeof products[number][]).map(item => <article key={item.slug}>
          <div className="product-visual"><div className="image-box"><span className="object-id mono">OO—{String(products.indexOf(item) + 1).padStart(2, '0')}</span><span className={`shape ${item.type.toLowerCase()}`} aria-hidden="true" /><span>{item.type}</span></div></div>
          <div className="nameplate"><Link id={`product-link-${item.slug}`} href={`/products/${item.slug}/`} onNavigate={() => { positionRef.current = { slug: item.slug, scrollY: window.scrollY, url: window.location.href }; }}>{item.name}</Link><span>{peso(item.price)}</span></div>
          <button type="button" className="save-button" aria-pressed={saved.includes(item.slug)} aria-label={`${saved.includes(item.slug) ? 'Remove' : 'Save'} ${item.name} ${saved.includes(item.slug) ? 'from' : 'to'} cart`} onClick={() => toggle(item.slug, item.name)}>{saved.includes(item.slug) ? '✓ In cart · Remove' : '+ Add to cart'}</button>
        </article>)}</div><div className="shelf-edge" aria-hidden="true" />
      </section>)}
      <section className="shelf wishlist" id="cart" tabIndex={-1} aria-labelledby="cart-title">
        <h3 id="cart-title"><span className="shelf-number">04</span>Your cart <span className="count">{saved.length}</span></h3>
        <div className="tray"><span className="cart-shape" aria-hidden="true">♡</span>{saved.length === 0 ? <div><p>Your cart is empty.</p><p className="muted">Tap “Add to cart” on a piece above.</p></div> : <ul>{cartItems.map(item => <li key={item.slug}><div>{item.name}<span className="muted">{item.type} · {peso(item.price)}</span></div><button onClick={() => toggle(item.slug, item.name)} aria-label={`Remove ${item.name} from cart`}>Remove</button></li>)}</ul>}</div>
        {cartItems.length > 0 && <p className="cart-total">Subtotal <strong>{peso(cartItems.reduce((total, item) => total + item.price, 0))}</strong></p>}
        <p className="tray-note">Cart is saved for this visit. Online order submission is not available yet.</p><div className="shelf-edge" aria-hidden="true" />
      </section>
    </div>
    <footer className="flex justify-between"><span className="mono">ODD OBJECTS</span><span>Drop 01 · Prototype only</span></footer>
    <p className="sr-only" role="status" aria-live="polite">{message}</p>
  </main>;
}
