'use client';

import Link from 'next/link';
import {useState,type CSSProperties} from 'react';
import {useRackSession} from './rack-session';
import {type ProductColor} from '@/lib/colors';
import {CartControls,ColorChooser,ColorArt} from './color-controls';
import {peso} from '@/lib/products';

export function SizeHelper({sizing}:{sizing?:string}) {
  const [wrist,setWrist]=useState('');
  const [fit,setFit]=useState('regular');
  const measurement=Number(wrist);
  const valid=wrist!==''&&measurement>=8&&measurement<=35;
  const allowance=fit==='snug'?1:fit==='loose'?2:1.5;
  return <details className="shopping-help">
    <summary>Find your bracelet fit</summary>
    <div className="shopping-help-body">
      <ol><li>Wrap a strip of paper or string around your wrist without tightening it.</li><li>Mark where it meets, then measure the length against a ruler.</li></ol>
      <div className="fit-fields">
        <label>Wrist circumference (cm)<input type="number" min="8" max="35" step=".1" inputMode="decimal" value={wrist} onChange={e=>setWrist(e.target.value)}/></label>
        <label>Preferred fit<select value={fit} onChange={e=>setFit(e.target.value)}><option value="snug">Snug</option><option value="regular">Regular</option><option value="loose">Loose</option></select></label>
      </div>
      <p role="status">{valid?'Suggested bracelet length: '+(measurement+allowance).toFixed(1)+' cm ('+allowance+' cm allowance).':wrist?'Enter a wrist measurement between 8 and 35 cm.':'Enter your measurement to estimate a comfortable length.'}</p>
      {sizing&&<p><strong>This piece</strong> · {sizing}</p>}
      <small>This is a fit estimate. Check the piece’s listed size before ordering. This guide doesn’t change your order size.</small>
    </div>
  </details>;
}

export function MatchingPieces({slug,type}:{slug:string;type:string}) {
  const {catalog,colors}=useRackSession();
  const candidates=(catalog?.products??[]).filter(item=>item.slug!==slug&&
    (type.toLowerCase()==='bracelet'?item.type.toLowerCase()==='keychain':item.type.toLowerCase()==='bracelet'))
    .map(item=>({item,options:(colors?.[item.slug]??[]).filter(c=>c.image_path)}))
    .filter(pair=>pair.options.length>0).slice(0,2);
  if(!candidates.length)return null;
  return <section className="shopping-help matching-section" aria-label="Matching pieces">
    <h2>{type.toLowerCase()==='bracelet'?'Clip on a matching piece':'Wear it with a bracelet'}</h2>
    <p>Pick an option to build your own pair.</p>
    <div className="matching-grid">{candidates.map(({item,options})=><MatchCard key={item.slug} item={item} options={options}/>)}</div>
    <div className="shelf-edge" aria-hidden="true"/>
  </section>;
}

function MatchCard({item,options}:{item:{slug:string;name:string;price:number;type:string};options:ProductColor[]}) {
  const [chosen,setChosen]=useState('');
  const color=options.find(c=>c.slug===chosen)??options[0];
  return <article className="matching-card">
    <div className="rack-visual" style={{'--cage-swatch':color.swatch_hex} as CSSProperties}>
      <div className="product-visual">
        <Link className="image-box image-button" href={'/item/?product='+encodeURIComponent(item.slug)} aria-label={'View '+item.name}>
          <div className="rack-color-slide is-preview"><ColorArt type={item.type} color={color} decorative/></div>
        </Link>
      </div>
      <div className="rack-colors"><ColorChooser slug={item.slug} name={item.name} options={options} color={color} select={setChosen}/></div>
    </div>
    <div className="nameplate"><Link href={'/item/?product='+encodeURIComponent(item.slug)}>{item.name}</Link><span>{peso(item.price)}</span></div>
    <CartControls slug={item.slug} name={item.name} color={color}/>
  </article>;
}

export function PackagingPreview() {
  const {catalog}=useRackSession();
  const theme=catalog?.drop.theme;
  const confirmed=theme?.['packaging-confirmed']==='on';
  const items=(theme?.['packaging-items']||'Protective pouch\nCare card\nOuter mailer').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,8);
  return <details className="shopping-help">
    <summary>Packaging preview</summary>
    <div className="shopping-help-body">
      <p>{confirmed?'Your parcel includes':'Proposed packaging set'}</p>
      <div className="packaging-preview" aria-hidden="true"><span className="parcel-mailer"/><span className="parcel-card">ODD<br/>OBJECTS</span><span className="parcel-pouch">★</span></div>
      <ul>{items.map((item,index)=><li key={index}>{item}</li>)}</ul>
      <small>{confirmed?'Illustration shows the packaging style; colors and arrangement may vary.':'Illustration only. The final packaging set is still being confirmed.'}</small>
      {theme?.['packaging-note']&&<p>{theme['packaging-note']}</p>}
    </div>
  </details>;
}
