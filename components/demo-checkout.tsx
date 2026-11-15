'use client';
import { useState, useRef, type FormEvent } from 'react';
import { peso } from '@/lib/products';
import { rpc } from '@/lib/supabase';
import { useRackSession } from './rack-session';
type Order={code:string;total_centavos:number;payment_status:string;order_status:string;created_at:string;updated_at?:string};
export function DemoCheckout({total}:{total:number}){
 const {cart}=useRackSession();const [show,setShow]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[code,setCode]=useState(''),[order,setOrder]=useState<Order|null>(null);
 const request=useRef<string|null>(null);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(busy)return;setBusy(true);setMessage('');const form=new FormData(e.currentTarget);
 try{request.current??=crypto.randomUUID();const result=await rpc('create_sample_order',{p_name:form.get('name'),p_email:form.get('email'),p_request_id:request.current,p_items:cart.map(l=>({slug:l.slug,color:l.color.slug,quantity:l.quantity}))});setOrder(result);setCode(result.code);localStorage.setItem('odd-last-code',result.code);setShow(false);request.current=null;setMessage('Sample order saved. Keep your private order code.');}catch(err){setMessage(err instanceof Error?err.message:'Could not save order.');}finally{setBusy(false);}}
 async function lookup(value=code){if(busy)return;setBusy(true);setMessage('');try{const result=await rpc('lookup_sample_order',{p_code:value});setOrder(result);if(!result)setMessage('Order not found. Check the complete code.');}catch{setMessage('Could not check status. Please retry.');}finally{setBusy(false);}}
 return <div className="db-checkout">
 <div className="checkout-actions"><button disabled={!total||busy} onClick={()=>setShow(!show)}>Sample checkout · {peso(total)}</button><button onClick={()=>{const last=localStorage.getItem('odd-last-code');if(last){setCode(last);void lookup(last);}else setMessage('No saved order on this device.');}}>View last order</button></div>
 {show&&<form className="store-form" onSubmit={submit}><h3>Guest sample order</h3><p>Pickup sample · No charge. Email format is checked; ownership is not verified.</p><label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={100}/></label><label>Email<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label><input type="checkbox" required/> I understand this is a sample order with no real payment.</label><button disabled={busy}>{busy?'Saving…':'Create sample order'}</button></form>}
 <form className="store-form" onSubmit={e=>{e.preventDefault();void lookup();}}><label>Check order status<input value={code} onChange={e=>setCode(e.target.value)} required placeholder="Paste your complete ODD- order code" autoComplete="off"/></label><button disabled={busy}>Check status</button></form>
 <p role="status">{message}</p>
 {order&&<section key={order.code+order.updated_at} className="order-result"><div><h3>Order details</h3><dl><dt>Private order code</dt><dd className="order-code">{order.code}</dd><dt>Amount</dt><dd>{peso(order.total_centavos/100)}</dd><dt>Created</dt><dd>{new Date(order.created_at).toLocaleString()}</dd></dl><button onClick={async()=>{try{await navigator.clipboard.writeText(order.code);setMessage('Copied. Paste this code in Check order status.');}catch{setMessage('Select and copy the order code above.');}}}>Copy order code</button></div><div><h3>Order progress</h3><p>◷ Payment<br/><strong>{order.payment_status.replaceAll('_',' ')}</strong></p><p>◇ Fulfillment<br/><strong>{order.order_status}</strong></p><p>Sample only. No payment QR is active.</p></div><p>Keep this code private. Paste it into “Check order status” on any device to see updates from the store.</p></section>}
 </div>;
}
