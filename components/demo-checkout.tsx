'use client';
import { useState, useRef, type FormEvent } from 'react';
import { peso } from '@/lib/products';
import { rpc } from '@/lib/supabase';
import { useRackSession } from './rack-session';
type Order={code:string;total_centavos:number;payment_status:string;order_status:string;created_at:string;updated_at?:string};
export function DemoCheckout({total}:{total:number}){
 const {cart}=useRackSession();const [mode,setMode]=useState<"checkout"|"status"|null>(null),[platform,setPlatform]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[code,setCode]=useState(''),[order,setOrder]=useState<Order|null>(null);
 const request=useRef<string|null>(null);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;setBusy(true);setMessage('');const form=new FormData(e.currentTarget);
 try{request.current??=crypto.randomUUID();const result=await rpc('create_store_order',{p_name:form.get('name'),p_email:form.get('email'),p_request_id:request.current,p_contact_platform:platform||null,p_contact_handle:platform?String(form.get('social')??'').trim():null,p_items:cart.map(l=>({slug:l.slug,color:l.color.slug,quantity:l.quantity}))});setOrder(result);setCode(result.code);localStorage.setItem('odd-last-code',result.code);setMode(null);request.current=null;setMessage('Order request saved. Keep your private order code.');}catch(err){setMessage(err instanceof Error?err.message:'Could not save order.');}finally{setBusy(false);}}
 async function lookup(value=code){if(busy)return;setBusy(true);setMessage('');try{const result=await rpc('lookup_sample_order',{p_code:value});setOrder(result);if(!result)setMessage('Order not found. Check the complete code.');}catch{setMessage('Could not check status. Please retry.');}finally{setBusy(false);}}
 return <div className="db-checkout">
 <div className="checkout-actions" aria-label="Order actions">
   <button disabled={!total||busy} aria-expanded={mode==='checkout'} onClick={()=>{setOrder(null);setMessage('');setMode(mode==='checkout'?null:'checkout');}}>Checkout · {peso(total)}</button>
   <button disabled={busy} aria-expanded={mode==='status'} onClick={()=>{setOrder(null);setMessage('');setMode(mode==='status'?null:'status');}}>Check status</button>
   <button disabled={busy} onClick={()=>{setMode(null);setOrder(null);const last=localStorage.getItem('odd-last-code');if(last){setCode(last);void lookup(last);}else setMessage('No saved order on this device.');}}>View last order</button>
 </div>
 {mode==='checkout'&&total>0&&<form className="store-form checkout-panel" onSubmit={submit}>
   <h3>Order request</h3>
   <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100}/></label>
   <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>
   <label>Can we also contact you on social media? <select value={platform} onChange={e=>setPlatform(e.target.value)}>
     <option value="">Email only</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option>
   </select></label>
   {platform&&<label>{platform==='instagram'?'Instagram handle':'Facebook profile name or link'}<input name="social" required maxLength={150} pattern=".*\S.*" placeholder={platform==='instagram'?'@yourhandle':'Name or profile link'}/></label>}
   <p>Submitting this request does not charge you.</p>
   <button disabled={busy}>{busy?'Saving…':'Submit order request'}</button>
 </form>}
 {mode==='status'&&<form className="store-form checkout-panel" onSubmit={e=>{e.preventDefault();void lookup();}}>
   <label>Order code<input value={code} onChange={e=>setCode(e.target.value)} required placeholder="Paste your complete ODD- order code" autoComplete="off"/></label>
   <button disabled={busy}>Look up order</button>
 </form>}
 <p role="status">{message}</p>
 {order&&<section key={order.code+order.updated_at} className="order-result"><div><h3>Order details</h3><dl><dt>Private order code</dt><dd className="order-code">{order.code}</dd><dt>Amount</dt><dd>{peso(order.total_centavos/100)}</dd><dt>Created</dt><dd>{new Date(order.created_at).toLocaleString()}</dd></dl><button onClick={async()=>{try{await navigator.clipboard.writeText(order.code);setMessage('Copied. Paste this code in Check order status.');}catch{setMessage('Select and copy the order code above.');}}}>Copy order code</button></div><div><h3>Order progress</h3><p>◷ Payment<br/><strong>{order.payment_status==='cancelled'?'Cancelled':order.payment_status==='demo_confirmed'?'Marked confirmed':'Pending'}</strong></p><p>◇ Fulfillment<br/><strong>{order.order_status}</strong></p></div><p>Keep this code private. Paste it into “Check order status” on any device to see updates from the store.</p></section>}
 </div>;
}
