'use client';

import { useEffect, useState } from 'react';

export function SquarePhoto({ name, label, current }: { name:string; label:string; current?:string }) {
  const [url,setUrl]=useState('');
  const [open,setOpen]=useState(false);
  const [crop,setCrop]=useState({x:50,y:50,zoom:1});
  useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
  return <fieldset className="square-photo"><legend>{label}</legend>
    {url?<button type="button" className="crop-preview" aria-expanded={open} aria-label={'Adjust crop for '+label} onClick={()=>setOpen(!open)}>
      <img src={url} alt="Square crop preview" style={{objectPosition:crop.x+'% '+crop.y+'%',transform:'scale('+crop.zoom+')',transformOrigin:crop.x+'% '+crop.y+'%'}}/>
    </button>:current&&<img src={current} alt="Current photo"/>}
    <input type="hidden" name={name+'_crop'} value={JSON.stringify(crop)}/>
    {url&&open&&<div className="crop-controls">
      {([['x','Horizontal position',0,100,1],['y','Vertical position',0,100,1],['zoom','Zoom',1,3,.05]] as const).map(([key,title,min,max,step])=><label key={key}>{title}<input type="range" min={min} max={max} step={step} value={crop[key]} onChange={e=>setCrop({...crop,[key]:Number(e.target.value)})}/></label>)}
      <button type="button" className="admin-action" onClick={()=>setCrop({x:50,y:50,zoom:1})}>Reset</button>
      <button type="button" className="admin-action" onClick={()=>setOpen(false)}>Done</button>
    </div>}
    <input aria-label={label} type="file" name={name} accept="image/jpeg,image/png,image/webp" onChange={event=>{
      const file=event.currentTarget.files?.[0];
      setUrl(file?URL.createObjectURL(file):'');setCrop({x:50,y:50,zoom:1});setOpen(false);
    }}/>
    {url&&<small>Click the preview to pan or zoom before uploading.</small>}
  </fieldset>;
}

export async function squareCrop(file:File, crop:{x:number;y:number;zoom:number}={x:50,y:50,zoom:1}) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5_000_000) throw Error('Choose a JPG, PNG, or WebP under 5 MB.');
  const bitmap=await createImageBitmap(file);
  try {
    const side=Math.min(bitmap.width,bitmap.height)/crop.zoom;
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=Math.min(side,1200);
    const context=canvas.getContext('2d');
    if(!context)throw Error('Could not prepare the crop.');
    context.drawImage(bitmap,(bitmap.width-side)*crop.x/100,(bitmap.height-side)*crop.y/100,side,side,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.88));
    if(!blob||blob.type!=='image/webp')throw Error('Could not save the crop.');
    return new File([blob],'square.webp',{type:blob.type});
  } finally {bitmap.close();}
}
