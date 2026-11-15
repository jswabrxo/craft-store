import Link from 'next/link';
import { ProductDetails } from '@/components/add-to-cart';
import { BackToRack } from '@/components/back-to-rack';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
export function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }
export default async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = products.find(product => product.slug === slug);
  if (!item) notFound();
  return <main className="product-page mx-auto max-w-xl">
    <BackToRack slug={item.slug} shelf={item.shelf} />
    <p className="eyebrow">ODD OBJECTS / COLLECTION</p>
    <ProductDetails {...item} />
    <Link className="browse" href="/#collection">Browse the rack</Link>
  </main>;
}
