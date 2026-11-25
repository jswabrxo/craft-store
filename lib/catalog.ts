import { api } from './supabase';
export type Product = {slug:string;shelf:string;name:string;type:string;price:number;description?:string;materials?:string;sizing?:string;object_code?:string;drop_slug?:string};
export type Drop = {slug:string;title:string;brand_name:string;hero_eyebrow:string;hero_copy:string;preorder_details:string;sample_notice:string;about_copy:string;heading_font_key:string;body_font_key:string;heading_font_path?:string;body_font_path?:string;theme:Record<string,string>;preorder_opens_at?:string;preorder_closes_at?:string;is_active:boolean;is_published:boolean};
export type Shelf = {shelf_code:string;title:string;rack_rank?:number;display_order:number};
export function dropPath(drop?: Pick<Drop,'slug'|'is_active'>) {
 return drop && !drop.is_active ? '/?drop='+encodeURIComponent(drop.slug) : '/';
}
export function productPath(slug:string, drop?: Pick<Drop,'slug'|'is_active'>) {
 return '/item/?product='+encodeURIComponent(slug)+(drop && !drop.is_active ? '&drop='+encodeURIComponent(drop.slug) : '');
}
export async function loadCatalog(requested?:string | null){
 const drops:Drop[]=await api('/rest/v1/drops?select=*&is_published=eq.true&'+(requested?'slug=eq.'+encodeURIComponent(requested):'is_active=eq.true'));
 const drop=drops[0]; if(!drop) throw new Error('No published collection yet.');
 const [rows,shelves]=await Promise.all([api('/rest/v1/products?select=*&drop_slug=eq.'+encodeURIComponent(drop.slug)+'&order=featured.desc,display_order'),api('/rest/v1/shelves?select=*&drop_slug=eq.'+encodeURIComponent(drop.slug)+'&order=display_order')]);
 return {drop,shelves:(shelves as Shelf[]).sort((a,b)=>(a.rack_rank??a.display_order)-(b.rack_rank??b.display_order)),products:rows.map((p:Record<string,any>)=>({...p,shelf:p.shelf_code,type:p.product_type,price:p.price_centavos/100})) as Product[]};
}
