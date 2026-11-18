'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { parseGoogleFont } from '@/lib/theme-fonts';
import { loadCatalog, type Drop, type Shelf, type Product } from '@/lib/catalog';
import { loadColors, placeholderColors, type ProductColor } from '@/lib/colors';

type RackPosition = { slug: string; scrollY: number; url: string; focusId?: string };
type CartLine = { slug: string; color: ProductColor; quantity: number };
type RackSession = {
  catalog: {drop:Drop;products:Product[];shelves:Shelf[]} | null;
  catalogError:string;
  cart: CartLine[];
  count: number;
  changeQuantity: (slug: string, color: ProductColor, delta: number) => void;
  colors: Record<string, ProductColor[]> | null;
  selectedColors: Record<string, string>;
  selectColor: (slug: string, color: string) => void;
  position: { current: RackPosition | null };
};

const RackSessionContext = createContext<RackSession | null>(null);

export function RackSessionProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<{drop:Drop;products:Product[];shelves:Shelf[]} | null>(null);
  const [catalogError,setCatalogError]=useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [colors, setColors] = useState<Record<string, ProductColor[]> | null>(null);
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const position = useRef<RackPosition | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const refresh=()=>Promise.all([loadCatalog(),loadColors(controller.signal)]).then(([data,palette])=>{setCatalog(data);setColors(palette);setCatalogError('');}).catch(()=>setCatalogError('Unable to refresh the collection. Please reload to try again.'));
    void refresh();
    const timer=window.setInterval(refresh,30000);
    window.addEventListener('focus',refresh);
    return () => {controller.abort();clearInterval(timer);window.removeEventListener('focus',refresh);};
  }, []);

  useEffect(() => {
    function bounce(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest('button:not(:disabled), .image-button, .nameplate a, .browse, .topbar > a, .product-page > a, .rack-drawer a');
      if (!control || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      control.getAnimations().filter(animation => animation.id === 'game-press').forEach(animation => animation.cancel());
      control.animate([{ scale: '1' }, { scale: '.93', offset: .35 }, { scale: '1.045', offset: .68 }, { scale: '1' }],
        { duration: 250, easing: 'ease-out', id: 'game-press' });
    }
    document.addEventListener('click', bounce, true);
    return () => document.removeEventListener('click', bounce, true);
  }, []);

  useEffect(()=>{
    if(!catalog)return;
    for(const [key,value] of Object.entries(catalog.drop.theme)) if(/^#[0-9a-f]{6}$/i.test(value)) document.documentElement.style.setProperty('--theme-'+key,value);
    const family=catalog.drop.heading_font_key==='serif'?'Georgia,serif':catalog.drop.heading_font_key==='monospace'?'ui-monospace,monospace':'Arial,sans-serif';
    document.documentElement.style.setProperty('--heading-family',family);
    document.documentElement.style.setProperty('--body-family',catalog.drop.body_font_key==='serif'?'Georgia,serif':catalog.drop.body_font_key==='monospace'?'ui-monospace,monospace':'Arial,sans-serif');
    const root=document.documentElement;
    const faces:FontFace[]=[];
    const links:HTMLLinkElement[]=[];
    let active=true;
    for(const key of ['heading','body','button','label'] as const){
      const google=parseGoogleFont(catalog.drop.theme[key+'-google-font']??'');
      if(google){
        const link=document.createElement('link');
        link.rel='stylesheet';link.href=google.url;document.head.append(link);links.push(link);
        root.style.setProperty('--'+key+'-family','"'+google.name+'", sans-serif');
        continue;
      }
      const path=key==='heading'?catalog.drop.heading_font_path:key==='body'?catalog.drop.body_font_path:null;
      if(!path || !(path.startsWith('https://')||path.startsWith('/')))continue;
      const face=new FontFace('Store'+key,`url(${JSON.stringify(path)})`);
      faces.push(face);
      void face.load().then(loaded=>{if(active){document.fonts.add(loaded);root.style.setProperty('--'+key+'-family','Store'+key);}}).catch(()=>{});
    }
    document.title=catalog.drop.brand_name+' · '+catalog.drop.title;
    setCart(current=>current.filter(line=>catalog.products.some(p=>p.slug===line.slug)));
    return ()=>{
      active=false;links.forEach(link=>link.remove());faces.forEach(face=>document.fonts.delete(face));
      for(const key of ['heading','body','button','label'])root.style.removeProperty('--'+key+'-family');
      for(const key of Object.keys(catalog.drop.theme))root.style.removeProperty('--theme-'+key);
    };
  },[catalog]);

  function changeQuantity(slug: string, color: ProductColor, delta: number) {
    setCart(current => {
      const matches = (line: CartLine) => line.slug === slug && line.color.slug === color.slug;
      const existing = current.find(matches);
      const quantity = Math.min(99, (existing?.quantity ?? 0) + delta);
      if (quantity <= 0) return current.filter(line => !matches(line));
      const line = { slug, color, quantity };
      return existing ? current.map(item => matches(item) ? line : item) : [...current, line];
    });
  }

  const count = cart.reduce((total, line) => total + line.quantity, 0);
  return (
    <RackSessionContext.Provider value={{
      catalog,catalogError,cart, count, changeQuantity, colors, selectedColors, position,
      selectColor: (slug, color) => setSelectedColors(current => ({ ...current, [slug]: color })),
    }}>
      {children}
    </RackSessionContext.Provider>
  );
}

export function useRackSession() {
  const session = useContext(RackSessionContext);
  if (!session) throw new Error('Missing rack session provider');
  return session;
}

export function useProductColor(slug: string) {
  const { colors, selectedColors, selectColor } = useRackSession();
  const options = colors === null ? placeholderColors : (colors[slug] ?? []);
  const color = options.find(option => option.slug === selectedColors[slug]) ?? options[0];
  return { options, color, select: (option: string) => selectColor(slug, option) };
}
