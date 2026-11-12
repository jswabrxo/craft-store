import { ProductMagnifier } from '@/components/product-magnifier';
import Link from 'next/link';
import { AddToCart } from '@/components/add-to-cart';
import { BackToRack } from '@/components/back-to-rack';
import { notFound } from 'next/navigation';
import { products, peso } from '@/lib/products';
export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }
export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = products.find(product => product.slug === slug);
  if (!item) notFound();
  return <main className="product-page mx-auto max-w-xl"><AddToCart slug={item.slug} name={item.name} /><BackToRack slug={item.slug} shelf={item.shelf} /><p className="eyebrow">ODD OBJECTS / DROP 01</p><ProductMagnifier type={item.type} /><h1>{item.name}</h1><p>{peso(item.price)} · Sample price</p><p>A beaded {item.type.toLowerCase()} with silver-tone charms and hardware. Sample piece for the Drop 01 preorder collection.</p><p className="muted">Online order submission is not available yet.</p><Link className="browse" href="/#collection">Browse the rack</Link></main>;
}
