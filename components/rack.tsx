'use client';
import { useEffect, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { peso } from '@/lib/products';
import { CartControls, ColorArt, ColorChooser } from './color-controls';
import { useProductColor, useRackSession } from './rack-session';
import { DemoCheckout } from './demo-checkout';
import { CartIcon } from './cart-icon';

import { RackMotion } from './product-motion';
import RackMenu from './rack-menu';
export default function Rack() {
  const { catalog, catalogError, cart, count, changeQuantity, position: positionRef } = useRackSession();
  const products=catalog?.products??[];
  const drop=catalog?.drop;
  const [compactTitle, setCompactTitle] = useState(false);
  const cartItems = cart.flatMap(line => {
    const item = products.find(product => product.slug === line.slug);
    return item ? [{ ...line, item }] : [];
  });

  const subtotal = cartItems.reduce((total, line) => total + line.item.price * line.quantity, 0);

  useEffect(() => {
    const about = document.getElementById('about');
    if (!about || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      about.dataset.revealed = String(entry.intersectionRatio > 0.5);
    }, { threshold: 0.501 });
    observer.observe(about);
    return () => observer.disconnect();
  }, []);

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

  function removeLine(event: MouseEvent<HTMLButtonElement>, remove: () => void) {
    const button = event.currentTarget;
    const row = button.closest('li');
    if (!row || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      remove();
      return;
    }
    if (row.dataset.removing) return;
    row.dataset.removing = 'true';
    row.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 130, fill: 'forwards' })
      .finished.then(() => {
        const height = row.getBoundingClientRect().height;
        return row.animate([
          { height: `${height}px` },
          { height: '0px', paddingBlock: 0, borderBottomWidth: 0 },
        ], { duration: 200, easing: 'ease-out', fill: 'forwards' }).finished;
      }).then(remove).catch(() => {});
  }

  return <main className="mx-auto max-w-3xl">
    <a className="skip" href="#collection" onClick={event => followSection(event, 'collection')}>Skip to collection</a>
    <nav className="topbar flex items-center justify-between" aria-label="Main"><a href="#cart" onClick={event => followSection(event, 'cart')}><CartIcon className="nav-cart-icon" /> Cart <span className="count">{count}</span></a><span className={`compact-drop${compactTitle ? ' is-visible' : ''}`} aria-hidden="true"><span className="dynamic-title">{drop?.title}</span></span>
      <RackMenu onSectionNavigate={scrollToSection} /></nav>
    <header className="hero text-center">
      <p className="eyebrow">{drop?.hero_eyebrow??"Loading collection…"}</p>
      <h1 className="dynamic-title">{drop?.title??"ODD OBJECTS"}</h1>
      <div className="drop-label">{drop?.preorder_details}</div>
      <p className="intro">{drop?.hero_copy}</p>
      <a className="browse" href="#collection" onClick={event => followSection(event, 'collection')}>Browse {drop?.title??"collection"} <span aria-hidden="true">↓</span></a>
      <a className="browse about-link" href="#about" onClick={event => followSection(event, 'about')}>About <span aria-hidden="true">↓</span></a>
    </header>
    <div className="rack" id="collection" tabIndex={-1}>
      <RackMotion />{catalogError&&<p role="status">{catalogError}</p>}
      <div className="rack-heading flex justify-between items-center"><h2>{drop?.title}</h2><span className="mono">{String(products.length).padStart(2,'0')} OBJECTS</span></div>
      {(catalog?.shelves??[]).map(shelf=>[shelf.shelf_code,shelf.title,products.filter(p=>p.shelf===shelf.shelf_code)]).map(([number, title, items]) => <section className="shelf" key={number as string} aria-labelledby={`shelf-${number}`}>
        <h3 id={`shelf-${number}`} tabIndex={-1}><span className="shelf-number">{number as string}</span>{title as string}</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {(items as import('@/lib/catalog').Product[]).map(item => <RackCard key={item.slug} item={item} />)}
        </div>
        <div className="shelf-edge" aria-hidden="true" />
      </section>)}
      <section className="shelf wishlist" id="cart" tabIndex={-1} aria-labelledby="cart-title">
        <h3 id="cart-title"><span className="shelf-number">04</span>Your cart <span className="count">{count}</span></h3>
        <div className="tray">
          <CartIcon className="tray-cart-icon" />
          {cartItems.length === 0 ? <div><p>Your cart is empty.</p><p className="muted">Tap “Add to cart” on a piece above.</p></div> :
            <ul>{cartItems.map(({ item, color, quantity }) => (
              <li className="cart-line" key={`${item.slug}:${color.slug}`}>
                <div className="cart-thumb"><ColorArt type={item.type} color={color} decorative /></div>
                <div className="cart-line-info"><strong>{item.name}</strong>
                  <span><i aria-hidden="true" style={{ color: color.swatch_hex }}>★</i> {color.name} · ×{quantity}</span>
                </div>
                <strong>{peso(item.price * quantity)}</strong>
                <button type="button" aria-label={`Remove ${item.name}, ${color.name}`}
                  onClick={event => removeLine(event, () => changeQuantity(item.slug, color, -quantity))}>Remove</button>
              </li>
            ))}</ul>}
        </div>
        {cartItems.length > 0 && <p className="cart-total">Subtotal <strong>{peso(subtotal)}</strong></p>}
        <DemoCheckout total={subtotal} />
        <p className="tray-note">{drop?.sample_notice}</p><div className="shelf-edge" aria-hidden="true" />
      </section>
    </div>
    <section className="about-panel" id="about" tabIndex={-1} aria-labelledby="about-title">
      <h2 id="about-title" className="dynamic-title">About {drop?.brand_name}</h2>
      <p>{drop?.about_copy}</p>
      <p>{drop?.sample_notice}</p>
    </section>
    <footer className="flex justify-between"><span className="mono">ODD OBJECTS</span><span>{drop?.title} · Sample store</span></footer>
  </main>;
}

function RackCard({ item }: { item: import('@/lib/catalog').Product }) {
  const { options, color, select } = useProductColor(item.slug);
  const { position: positionRef } = useRackSession();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const preview = previewIndex === null ? color : (options[previewIndex] ?? color);
  const previewing = previewIndex !== null;
  const colorCount = options.length;

  useEffect(() => {
    if (!previewing || colorCount < 2) return;
    const timer = window.setInterval(() => {
      setPreviewIndex(current => current === null ? null : (current + 1) % colorCount);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [previewing, colorCount]);

  const href = `/products/${item.slug}/`;
  const linkId = `product-link-${item.slug}`;
  const imageId = `product-image-${item.slug}`;

  function rememberPosition(focusId: string) {
    positionRef.current = { slug: item.slug, scrollY: window.scrollY, url: window.location.href, focusId };
  }

  return <article onPointerEnter={event => {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches || colorCount < 2) return;
    setPreviewIndex(Math.max(0, options.findIndex(option => option.slug === color?.slug)));
  }} onPointerLeave={() => setPreviewIndex(null)}>
    <div className="rack-visual">
      <span className="object-id mono">{item.object_code??item.slug}</span>
      <div className="product-visual">
        <Link className="image-box image-button" id={imageId} href={href}
          aria-label={`View ${item.name}`} onNavigate={() => rememberPosition(imageId)}>
          <div className={previewing && preview?.slug !== color?.slug ? 'rack-color-slide is-preview' : 'rack-color-slide'} key={preview?.slug}>
            <ColorArt type={item.type} color={preview} decorative />
          </div>
        </Link>
      </div>
      <div className="rack-colors"><ColorChooser slug={item.slug} name={item.name} options={options} color={preview} select={slug => { setPreviewIndex(null); select(slug); }} /></div>
    </div>
    <div className="nameplate">
      <Link id={linkId} href={href} onNavigate={() => rememberPosition(linkId)}>{item.name}</Link>
      <span>{peso(item.price)}</span>
    </div>
    <CartControls slug={item.slug} name={item.name} color={color} />
  </article>;
}
