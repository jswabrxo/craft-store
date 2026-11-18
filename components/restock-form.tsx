'use client';

import { useState } from 'react';
import { api } from '@/lib/supabase';

export function RestockForm({product,color,name}: {product:string;color:string;name:string}) {
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  return <details className="restock-disclosure"><summary>Restock list · {name}</summary>
    <form className="store-form" onSubmit={async event=>{
      event.preventDefault();
      const email=String(new FormData(event.currentTarget).get('email')).trim().toLowerCase();
      setBusy(true);
      try {
        await api('/rest/v1/restock_requests',{method:'POST',body:JSON.stringify({product_slug:product,color_slug:color,email})});
        setMessage('You’re on the restock list.');
      } catch (error) {
        setMessage(error instanceof Error && error.message.includes('duplicate key') ? 'You’re already on the restock list.' : 'Could not save your request. Try again.');
      } finally {setBusy(false);}
    }}>
      <label>Email for {name}<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <button disabled={busy}>Join restock list</button><span role="status">{message}</span>
    </form>
  </details>;
}
