'use client';
import {useState} from 'react';
import {makePalette,palettePresets} from '@/lib/palette';

export function PaletteMixer({apply}:{apply:(palette:Record<string,string>)=>void}){
 const [colors,setColors]=useState<[string,string,string]>(palettePresets[0].colors);
 const palette=makePalette(colors);
 return <fieldset className="palette-mixer"><legend>Palette generator</legend>
  <div className="checkout-actions">{palettePresets.map(p=><button key={p.name} type="button" className="admin-action" onClick={()=>setColors(p.colors)}>{p.name}</button>)}</div>
  <div className="palette-seeds">{['Sky','Surface tint','Accent'].map((name,index)=><label key={name}>{name}<input type="color" value={colors[index]} onChange={e=>{const next:[string,string,string]=[...colors];next[index]=e.target.value;setColors(next);}}/></label>)}</div>
  <div className="palette-preview" style={{background:palette.background,color:palette.ink,borderColor:palette['rack-tone']}}>
   <strong>Rack preview</strong><span style={{background:'linear-gradient(white,'+palette['button-tone']+')',borderColor:palette['hover-tone'],boxShadow:'0 3px 0 '+palette['shadow-tone']}}>Glossy button</span>
  </div>
  <button type="button" className="admin-action" onClick={()=>apply(palette)}>Use generated palette</button>
  <small>Save the drop to apply it to the storefront.</small>
 </fieldset>;
}
