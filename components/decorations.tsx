'use client';

import {useEffect,useState} from 'react';

export function HeroSparkles({enabled}:{enabled:boolean}){
 return enabled?<span className="hero-sparkles" aria-hidden="true">{['✦','✧','✦','✧','✦'].map((shape,i)=><i key={i}>{shape}</i>)}</span>:null;
}

export function ClickDecoration({effect}:{effect?:string}){
 const [burst,setBurst]=useState<{x:number;y:number;id:number}|null>(null);
 useEffect(()=>{
  if(!effect||effect==='off')return;
  function click(e:MouseEvent){
   if(matchMedia('(prefers-reduced-motion: reduce)').matches||!(e.target instanceof Element)||e.target.closest('a,button,input,select,textarea,label,summary,[role="button"],[contenteditable]'))return;
   setBurst({x:e.clientX,y:e.clientY,id:performance.now()});
  }
  document.addEventListener('click',click);
  return ()=>document.removeEventListener('click',click);
 },[effect]);
 return burst&&effect&&effect!=='off'?<span key={burst.id} className="background-burst" data-effect={effect} aria-hidden="true" style={{left:burst.x,top:burst.y}} onAnimationEnd={()=>setBurst(null)}>{effect==='sparkle'?'✦':''}</span>:null;
}
