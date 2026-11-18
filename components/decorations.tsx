'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';

export function HeroSparkles({enabled}:{enabled:boolean}){
 return enabled?<span className="hero-sparkles" aria-hidden="true">{Array.from({length:5},(_,i)=><i className="aero-star" key={i}/>)}</span>:null;
}

export function ClickDecoration({theme}:{theme?:Record<string,string>}){
 const [burst,setBurst]=useState<{x:number;y:number;id:number;effect:string;control:boolean}|null>(null);
 useEffect(()=>{
  if(!theme)return;
  function click(e:MouseEvent){
   if(matchMedia('(prefers-reduced-motion: reduce)').matches||!(e.target instanceof Element)||e.target.closest('input,select,textarea,label,[contenteditable],:disabled'))return;
   const area=e.target.closest('.hero-title-wrap')?'title':e.target.closest('#collection .shelf:not(#cart)')?'shelf':e.target.closest('#collection')?'rack':'';
   const control=e.target.closest('button, summary, a.back-to-rack');
   const effect=control?'sparkle':area?(theme?.[area+'-click-effect']??theme?.['click-effect']):theme?.['click-effect'];
   if(!effect||effect==='off')return;
   const box=control?.getBoundingClientRect();
   setBurst({x:e.detail||!box?e.clientX:box.left+box.width/2,y:e.detail||!box?e.clientY:box.top+box.height/2,id:performance.now(),effect,control:!!control});
  }
  document.addEventListener('click',click,true);
  return ()=>document.removeEventListener('click',click,true);
 },[theme]);
 return burst?createPortal(<span key={burst.id} className="background-burst" data-effect={burst.effect} data-control={burst.control} aria-hidden="true" style={{left:burst.x,top:burst.y}} onAnimationEnd={()=>setBurst(null)}>{Array.from({length:burst.effect==='bubbles'?3:1},(_,i)=><i className="aero-star" key={i}/>)}</span>,document.body):null;
}

export function FloatingStarBubble(){
 return <div className="floating-star-bubble" aria-hidden="true"><i className="aero-star"/></div>;
}
