'use client';

import { useEffect, useRef, useState } from 'react';

const preference = 'odd-shop-chimes';

export function ShopChime() {
  const [enabled, setEnabled] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const last = useRef(0);

  useEffect(() => {
    try { setEnabled(localStorage.getItem(preference) === 'on'); } catch {}
    return () => { void audio.current?.close(); audio.current = null; };
  }, []);

  function ring(kind: 'tap' | 'purchase' | 'up' | 'down' = 'tap') {
    try {
      const context = audio.current ??= new AudioContext();
      if (context.currentTime - last.current < .08 && context.currentTime > .08) return;
      last.current = context.currentTime;
      void context.resume().catch(() => {});
      const start = context.currentTime;
      const pitches = { tap: [660, 990], purchase: [784, 1175], up: [1047], down: [392] };
      const duration = kind === 'up' || kind === 'down' ? .09 : .15;
      pitches[kind].forEach((pitch, index) => {
        const offset = start + index * .035;
        const tone = context.createOscillator();
        const envelope = context.createGain();
        tone.frequency.value = pitch;
        envelope.gain.setValueAtTime(.001, offset);
        envelope.gain.exponentialRampToValueAtTime(index ? .018 : .034, offset + .009);
        envelope.gain.exponentialRampToValueAtTime(.001, offset + duration);
        tone.connect(envelope).connect(context.destination);
        tone.start(offset);
        tone.stop(offset + duration + .01);
        tone.onended = () => { tone.disconnect(); envelope.disconnect(); };
      });
    } catch {}
  }

  useEffect(() => {
    if (!enabled) return;
    const play = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('button:not(:disabled), summary, a.product-dock-checkout');
      const chime = control?.getAttribute('data-chime');
      if (chime === 'up' || chime === 'down') {
        ring(chime);
      } else if (control?.matches('.color-chooser button, .save-button, .rack-menu-trigger, .checkout-actions button, .product-dock-checkout, .shopping-help summary')) {
        ring(control.matches('.save-button, .cart-checkout-primary, .product-dock-checkout') ? 'purchase' : 'tap');
      }
    };
    document.addEventListener('click', play, true);
    return () => document.removeEventListener('click', play, true);
  }, [enabled]);

  return <button className="shop-chime" type="button" aria-pressed={enabled} onClick={() => {
    const next = !enabled;
    setEnabled(next);
    try { localStorage.setItem(preference, next ? 'on' : 'off'); } catch {}
    if (next) ring();
  }}><span aria-hidden="true">♬</span> Sound {enabled ? 'on' : 'off'}</button>;
}
