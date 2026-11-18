'use client';

import { useEffect, useState } from 'react';
import { useRackSession } from '@/components/rack-session';
import { ProductDetails } from '@/components/add-to-cart';
import { BackToRack } from '@/components/back-to-rack';

export default function CatalogItem() {
  const [slug, setSlug] = useState('');
  const { catalog } = useRackSession();
  useEffect(() => { setSlug(new URLSearchParams(location.search).get('product') ?? ''); }, []);
  const item = catalog?.products.find(product => product.slug === slug);
  return <main className="product-page mx-auto max-w-xl">
    <BackToRack slug={slug} shelf={item?.shelf ?? '01'} />
    {item ? <ProductDetails {...item} /> : <p>{catalog && slug ? 'This product is unavailable.' : 'Loading product…'}</p>}
  </main>;
}
