import { projectUrl, publishableKey } from './supabase';


export type ProductColor = {
  slug: string;
  name: string;
  swatch_hex: string;
  image_path: string | null;
  image_alt: string | null;
};

export const placeholderColors: ProductColor[] = [
  { slug: 'silver', name: 'Silver', swatch_hex: '#9BA4BA', image_path: null, image_alt: null },
  { slug: 'bubblegum', name: 'Bubblegum', swatch_hex: '#E489BA', image_path: null, image_alt: null },
  { slug: 'lilac', name: 'Lilac', swatch_hex: '#A78BE0', image_path: null, image_alt: null },
];

export function colorImageUrl(path: string) {
  if (path.startsWith('/images/')) return path;
  return projectUrl + '/storage/v1/object/public/product-images/' +
    path.split('/').map(encodeURIComponent).join('/');
}

export async function loadColors(signal: AbortSignal) {
  const response = await fetch(projectUrl + '/rest/v1/product_colors?select=product_slug,slug,name,swatch_hex,image_path,image_alt&order=display_order', {
    headers: { apikey: publishableKey }, cache: 'no-store', signal,
  });
  if (!response.ok) throw new Error('Unable to load product colors');
  const rows: (ProductColor & { product_slug: string })[] = await response.json();
  const grouped: Record<string, ProductColor[]> = {};
  for (const row of rows) (grouped[row.product_slug] ??= []).push(row);
  return grouped;
}
