'use client';

import { useState } from 'react';
import { useRackSession } from './rack-session';

export function AddToCart({ slug, name }: { slug: string; name: string }) {
  const { saved, toggleSaved } = useRackSession();
  const [message, setMessage] = useState('');
  const inCart = saved.includes(slug);

  return (
    <div className="product-cart">
      <button className="browse product-cart-button" type="button" aria-pressed={inCart}
        onClick={() => {
          toggleSaved(slug);
          setMessage(inCart ? `${name} was removed` : `${name} was added`);
        }}>
        {inCart ? '✓ In cart · Remove' : '+ Add to cart'}
      </button>
      <span className="product-cart-status" role="status">{message}</span>
    </div>
  );
}
