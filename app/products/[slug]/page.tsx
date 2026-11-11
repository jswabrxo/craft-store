import Link from 'next/link';
import { BackToRack } from '@/components/back-to-rack';
import { notFound } from 'next/navigation';
import { products, peso } from '@/lib/products';
export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }
export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = products.find(product => product.slug === slug);
  if (!item) notFound();
  return <main className="product-page mx-auto max-w-xl"><BackToRack slug={item.slug} shelf={item.shelf} /><p className="eyebrow">ODD OBJECTS / DROP 01</p><div className="image-box"><span className={`shape ${item.type.toLowerCase()}`} aria-hidden="true" />{item.type}</div><h1>{item.name}</h1><p>{peso(item.price)} · Sample price</p><p>A beaded {item.type.toLowerCase()} with silver-tone charms and hardware. Sample piece for the Drop 01 preorder collection.</p><p className="muted">Prototype only. Orders are not open.</p><Link className="browse" href="/#collection">Browse the wishlist rack</Link></main>;
}
