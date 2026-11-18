'use client';
import { useState, type ReactNode } from 'react';
import { api, projectUrl, publishableKey } from '@/lib/supabase';
import { colorImageUrl, type ProductColor } from '@/lib/colors';

type Item = { slug:string; name:string; product_type:string; price_centavos:number; shelf_code:string; status:string };
type Color = ProductColor & { product_slug:string; is_visible:boolean };

export function RackEditor({drop, shelves, products, colors, selected, select, token, reload, productEditor}: {
  drop:string; shelves:{shelf_code:string;title:string;display_order:number;rack_rank:number|null}[]; products:Item[]; colors:Color[];
  selected:string; select:(slug:string)=>void; token:string; reload:()=>Promise<unknown>; productEditor:ReactNode;
}) {
  const [draft, setDraft] = useState<{shelf:string; source?:Item}>();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [deleteShelf,setDeleteShelf]=useState('');
  const [confirmDelete,setConfirmDelete]=useState('');
  const [undo,setUndo]=useState<{slug:string;status:string}>();
  async function run(work:()=>Promise<void>) {
    setBusy(true); setMessage('');
    try { await work(); await reload(); } catch(e) { setMessage(e instanceof Error ? e.message : 'Could not save'); }
    finally { setBusy(false); }
  }
  async function status(slug:string, value:string) {
    await api('/rest/v1/products?slug=eq.'+encodeURIComponent(slug),{method:'PATCH',body:JSON.stringify({status:value})},token);
    setMessage(value==='published'?'Published to the rack.':value==='archived'?'Archived. Order history is preserved.':'Returned to draft.');
  }
  const current=products.find(p=>p.slug===selected);
  return <section className="admin-panel rack-editor">
    <h2>Rack editor</h2>
    <details><summary className="admin-action">+ Add shelf</summary><form className="store-form" onSubmit={e=>{
      e.preventDefault();const form=e.currentTarget;const title=String(new FormData(form).get('title')).trim();
      void run(async()=>{if(!title)throw Error('Enter a shelf name.');
        const display_order=Math.max(0,...shelves.map(s=>s.display_order))+1;
        await api('/rest/v1/shelves',{method:'POST',body:JSON.stringify({drop_slug:drop,shelf_code:String(display_order).padStart(2,'0'),title,display_order})},token);
        form.reset();setMessage('Shelf added.');
      });
    }}><label>Shelf name<input name="title" required maxLength={100}/></label><button disabled={busy}>Add shelf</button></form></details>
    {shelves.map((shelf,index)=><section key={shelf.shelf_code}><h3 className="shelf-heading"><span className="shelf-arrows">
      {([-1,1] as const).map(direction=><button key={direction} type="button" className="admin-action"
        aria-label={'Move '+shelf.title+(direction<0?' up':' down')}
        disabled={busy||(direction<0?index===0:index===shelves.length-1)}
        onClick={()=>void run(async()=>{
          await api('/rest/v1/rpc/move_store_shelf',{method:'POST',body:JSON.stringify({p_drop:drop,p_shelf:shelf.shelf_code,p_direction:direction})},token);
          setMessage('Shelf order saved.');
        })}>{direction<0?'↑':'↓'}</button>)}
      </span>{shelf.title}</h3>
      <details><summary className="admin-action">Edit shelf</summary>
        <form className="store-form" onSubmit={e=>{
          e.preventDefault();const f=new FormData(e.currentTarget);const title=String(f.get('title')).trim();
          void run(async()=>{if(!title)throw Error('Enter a shelf name.');
            await api('/rest/v1/shelves?drop_slug=eq.'+encodeURIComponent(drop)+'&shelf_code=eq.'+encodeURIComponent(shelf.shelf_code),{method:'PATCH',body:JSON.stringify({title})},token);
            setMessage('Shelf saved.');
          });
        }}><label>Name<input name="title" required maxLength={100} defaultValue={shelf.title}/></label><button disabled={busy}>Save shelf</button></form>
        {products.some(p=>p.shelf_code===shelf.shelf_code)?<p>Only empty shelves can be deleted.</p>:deleteShelf===shelf.shelf_code?<div>
          <button className="admin-action danger" disabled={busy} onClick={()=>void run(async()=>{
            await api('/rest/v1/shelves?drop_slug=eq.'+encodeURIComponent(drop)+'&shelf_code=eq.'+encodeURIComponent(shelf.shelf_code),{method:'DELETE'},token);
            setDeleteShelf('');setMessage('Shelf deleted.');
          })}>Confirm delete shelf</button> <button className="admin-action" onClick={()=>setDeleteShelf('')}>Cancel</button>
        </div>:<button className="admin-action danger" disabled={busy} onClick={()=>setDeleteShelf(shelf.shelf_code)}>Delete empty shelf</button>}
      </details><div className="editor-shelf">
      {products.filter(p=>p.shelf_code===shelf.shelf_code && p.status!=='archived').map(p=>{
        const variants=colors.filter(c=>c.product_slug===p.slug);
        const photo=variants.find(c=>c.image_path)?.image_path;
        return <button key={p.slug} type="button" className="editor-tile" aria-pressed={selected===p.slug} onClick={()=>{setDraft(undefined);select(p.slug);}}>
          {photo?<img src={colorImageUrl(photo)} alt="" />:<span className="editor-placeholder">No photo</span>}
          <strong>{p.name}</strong><small>₱{p.price_centavos/100} · {p.status}</small>
          <span className="editor-swatches">{variants.map(c=><i key={c.slug} title={c.name+' · '+(c.stock_quantity??'No count')} style={{background:c.swatch_hex,opacity:c.is_visible?1:.35}} />)}</span>
        </button>;
      })}
      <button className="editor-tile editor-add" type="button" onClick={()=>{select('');setDraft({shelf:shelf.shelf_code});}}>+ Add product</button>
    </div>
    {current?.shelf_code===shelf.shelf_code&&<div className="checkout-actions">
      <button disabled={busy} onClick={()=>{setDraft({shelf:current.shelf_code,source:current});select('');}}>Duplicate</button>
      {current.status==='published'&&<button disabled={busy} onClick={()=>void run(()=>status(current.slug,'draft'))}>Unpublish product</button>}
      {current.status==='draft'&&<button disabled={busy} onClick={()=>void run(async()=>{if(!colors.some(c=>c.product_slug===current.slug&&c.is_visible&&c.image_path))throw Error('Add a product photo to a visible color first.');await status(current.slug,'published');})}>Publish product</button>}
      {current.status!=='archived'&&<button className="admin-action danger" disabled={busy} onClick={()=>void run(async()=>{await status(current.slug,'archived');setUndo({slug:current.slug,status:current.status});select('');})}>Archive product</button>}
      {current.status==='draft'&&<button className="admin-action danger" disabled={busy} onClick={()=>setConfirmDelete(current.slug)}>Delete draft</button>}
      {current.status==='draft'&&confirmDelete===current.slug&&<div><p>Permanently delete {current.name} and its draft colors?</p><button className="admin-action danger" disabled={busy} onClick={()=>void run(async()=>{await api('/rest/v1/rpc/delete_rack_draft',{method:'POST',body:JSON.stringify({p_slug:current.slug})},token);setConfirmDelete('');select('');setMessage('Draft deleted.');})}>Confirm deletion</button> <button className="admin-action" onClick={()=>setConfirmDelete('')}>Cancel</button></div>}

    </div>}
    {current?.shelf_code===shelf.shelf_code&&productEditor}
    {draft?.shelf===shelf.shelf_code&&<form className="store-form" key={draft.source?.slug??draft.shelf} onSubmit={event=>{
      event.preventDefault();const fields=new FormData(event.currentTarget);
      void run(async()=>{
        const name=String(fields.get('name')).trim();
        const base=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'product';
        const suffix=crypto.randomUUID().slice(0,8);
        const slug=base+'-'+suffix;
        const variants=draft.source ? colors.filter(c=>c.product_slug===draft.source?.slug) : [{slug:'original',name:String(fields.get('color')).trim(),swatch_hex:fields.get('swatch')}];
        await api('/rest/v1/rpc/create_rack_draft',{method:'POST',body:JSON.stringify({p:{...draft.source,name,slug,drop_slug:drop,shelf_code:draft.shelf,object_code:'OBJ-'+suffix.toUpperCase(),product_type:fields.get('type'),price_centavos:Math.round(Number(fields.get('price'))*100)},variants})},token);
        setDraft(undefined);select(slug);setMessage('Draft created. Add or review photos before publishing.');
      });
    }}>
      <h3>{draft.source?'Duplicate product':'New product'}</h3>
      <label>Name<input name="name" required maxLength={100} defaultValue={draft.source?draft.source.name+' copy':''}/></label>
      <label>Type<select name="type" defaultValue={draft.source?.product_type??'Bracelet'}><option>Bracelet</option><option>Keychain</option></select></label>
      <label>Price in pesos<input name="price" type="number" min="1" max="1000000" step=".01" required defaultValue={draft.source?draft.source.price_centavos/100:undefined}/></label>
      {!draft.source&&<><label>First color<input name="color" required defaultValue="Original"/></label><label>Swatch<input name="swatch" type="color" defaultValue="#a8a0dd"/></label></>}
      <button disabled={busy}>Save draft</button><button type="button" onClick={()=>setDraft(undefined)}>Cancel</button>
    </form>}
    </section>)}
    {undo&&<button disabled={busy} onClick={()=>void run(async()=>{await status(undo.slug,undo.status);select(undo.slug);setUndo(undefined);})}>Undo archive</button>}
    <details><summary>Archived products</summary>{products.filter(p=>p.status==='archived').map(p=><div key={p.slug}>{p.name} <button disabled={busy} onClick={()=>void run(async()=>{await status(p.slug,'draft');select(p.slug);})}>Restore as draft</button></div>)}</details>
    <p role="status">{message}</p>
  </section>;
}

export async function uploadRackPhoto(file:File,token:string){
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5_000_000) throw Error('Choose a JPG, PNG, or WebP under 5 MB.');
  const extension=file.type.split('/')[1];
  const path='catalog/'+crypto.randomUUID()+'.'+extension;
  const result=await fetch(projectUrl+'/storage/v1/object/product-images/'+path,{method:'POST',body:file,headers:{apikey:publishableKey,Authorization:'Bearer '+token,'Content-Type':file.type}});
  if(!result.ok)throw Error('Photo upload failed.');
  return path;
}
