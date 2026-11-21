'use client';

import {useEffect,useState} from 'react';

export function StorefrontLoader({ready}:{ready:boolean}) {
  const [leaving,setLeaving]=useState(false);
  const [hidden,setHidden]=useState(false);
  useEffect(()=>{
    const timeout=window.setTimeout(()=>setLeaving(true),6000);
    return ()=>window.clearTimeout(timeout);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    setLeaving(true);
  },[ready]);
  useEffect(()=>{
    if(!leaving)return;
    const timeout=window.setTimeout(()=>setHidden(true),450);
    return ()=>window.clearTimeout(timeout);
  },[leaving]);
  if(hidden)return null;
  return <div className="aquarium-loader" data-leaving={leaving} role="status">
    {!leaving&&<span>Loading the rack…</span>}
  </div>;
}
