'use client';

import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import { useRackSession } from '@/components/rack-session';
import { ProductDetails } from '@/components/add-to-cart';
import { BackToRack } from '@/components/back-to-rack';

export default function CatalogItem() {
 return <Suspense fallback={<p>Loading product…</p>}><ItemContent/></Suspense>;
}
function ItemContent(){
  const slug=useSearchParams().get('product')??'';
  const { catalog } = useRackSession();

  const item = catalog?.products.find(product => product.slug === slug);
  return <main className="product-page mx-auto max-w-xl">
    <BackToRack slug={slug} shelf={item?.shelf ?? '01'} />
    {item ? <ProductDetails key={item.slug} {...item} /> : <p>{catalog && slug ? 'This product is unavailable.' : 'Loading product…'}</p>}
  </main>;
}
