'use client';

import { useEffect } from 'react';

export function RackMotion({productKey}:{productKey:string}) {
  useEffect(() => {
    const images = document.querySelectorAll<HTMLElement>('#collection .profile-product-frame, #collection .rack-post:not(:has(.profile-product-frame)) .product-visual');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const cards=document.querySelectorAll<HTMLElement>('#collection .profile-product-frame, #collection .rack-visual:not(.profile-product-frame .rack-visual)');
    const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
      for(const entry of entries)if(entry.isIntersecting){
        if(!preference.matches && !entry.target.hasAttribute('data-revealed')){
          entry.target.setAttribute('data-revealed','');
          entry.target.animate([{opacity:.45,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:400,easing:'ease-out'});
        }
        observer?.unobserve(entry.target);
      }
    },{threshold:.15});
    cards.forEach(card=>observer?.observe(card));
    let previousY = window.scrollY;
    let lastScroll = 0;
    let previousFrame = 0;
    let offset = 0;
    let target = 0;
    let frame = 0;

    function draw(time: number) {
      const elapsed = previousFrame ? Math.min(32, time - previousFrame) : 16;
      previousFrame = time;
      if (time - lastScroll > 70) target = 0;
      offset += (target - offset) * (1 - Math.exp(-elapsed / 65));
      if (!target && Math.abs(offset) < 0.1) {
        images.forEach(image => image.style.removeProperty('transform'));
        offset = frame = previousFrame = 0;
        return;
      }
      const transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      images.forEach(image => { image.style.transform = transform; });
      frame = requestAnimationFrame(draw);
    }

    function onScroll() {
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;
      if (preference.matches || !delta || document.documentElement.classList.contains('rack-menu-open')) return;
      target = Math.max(-8, Math.min(8, -delta * 1.4));
      lastScroll = performance.now();
      if (!frame) frame = requestAnimationFrame(draw);
    }

    function reset() {
      cancelAnimationFrame(frame);
      offset = target = frame = previousFrame = 0;
      images.forEach(image => image.style.removeProperty('transform'));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    preference.addEventListener('change', reset);
    return () => {
      window.removeEventListener('scroll', onScroll);
      preference.removeEventListener('change', reset);
      observer?.disconnect();
      reset();
    };
  }, [productKey]);

  return null;
}
