'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { products, peso } from '@/lib/products';
import { useRackSession } from './rack-session';

const shelves = [
  { id: 'shelf-01', label: 'Bracelets / first picks' },
  { id: 'shelf-02', label: 'Bracelets / a little extra' },
  { id: 'shelf-03', label: 'Beaded keychains' },
];

export default function RackMenu({ onSectionNavigate }: { onSectionNavigate: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const unlock = useRef<(() => void) | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const { saved, position } = useRackSession();
  const router = useRouter();

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    unlock.current?.();
  }, []);

  function openMenu() {
    const root = document.documentElement;
    root.classList.add('rack-menu-open');
    unlock.current = () => {
      root.classList.remove('rack-menu-open');
      unlock.current = null;
    };
    setOpen(true);
    dialog.current?.showModal();
  }

  function closeMenu(afterClose?: () => void) {
    if (closeTimer.current || !dialog.current?.open) return;
    const finish = () => {
      closeTimer.current = null;
      dialog.current?.close();
      unlock.current?.();
      setOpen(false);
      setClosing(false);
      trigger.current?.focus({ preventScroll: true });
      afterClose?.();
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else {
      setClosing(true);
      closeTimer.current = setTimeout(finish, 180);
    }
  }

  function jumpTo(id: string) {
    closeMenu(() => onSectionNavigate(id));
  }

  function containFocus(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = dialog.current?.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)');
    if (!controls?.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button ref={trigger} id="rack-menu-trigger" className="rack-menu-trigger" type="button"
        aria-haspopup="dialog" aria-expanded={open} aria-controls="rack-menu" onClick={openMenu}>
        <span aria-hidden="true">☰</span> Rack menu
      </button>
      <dialog ref={dialog} id="rack-menu" className={`rack-drawer${closing ? ' is-closing' : ''}`}
        aria-labelledby="rack-menu-title" onKeyDown={containFocus}
        onCancel={event => { event.preventDefault(); closeMenu(); }}
        onClick={event => {
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (event.clientX < bounds.left || event.clientX > bounds.right ||
              event.clientY < bounds.top || event.clientY > bounds.bottom) closeMenu();
        }}>
        <div className="drawer-header">
          <h2 id="rack-menu-title">Rack menu</h2>
          <button type="button" className="drawer-close" onClick={() => closeMenu()}>Close <span aria-hidden="true">×</span></button>
        </div>
        <nav aria-label="Rack navigation">
          <h3>Shelves</h3>
          {shelves.map(shelf => <a key={shelf.id} href={`#${shelf.id}`} onClick={event => {
            event.preventDefault();
            jumpTo(shelf.id);
          }}>{shelf.label}<span aria-hidden="true">→</span></a>)}
          <h3>Pieces in Drop 01</h3>
          {products.map(item => <Link key={item.slug} href={`/products/${item.slug}/`} onNavigate={event => {
            event.preventDefault();
            closeMenu(() => {
              position.current = {
                slug: item.slug,
                scrollY: window.scrollY,
                url: window.location.href,
                focusId: 'rack-menu-trigger',
              };
              router.push(`/products/${item.slug}/`);
            });
          }}><span>{item.name}<small>{item.type}</small></span><span>{peso(item.price)}</span></Link>)}
          <a className="drawer-wishlist" href="#cart" onClick={event => {
            event.preventDefault();
            jumpTo('cart');
          }}>Your cart <span className="count">{saved.length}</span></a>
        </nav>
      </dialog>
    </>
  );
}
