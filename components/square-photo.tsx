'use client';

import { useEffect, useState } from 'react';

export function SquarePhoto({ name, label, current }: { name:string; label:string; current?:string }) {
  const [url,setUrl]=useState('');
  useEffect(()=>()=>{if(url)URL.revokeObjectURL(url);},[url]);
  return <fieldset className="square-photo"><legend>{label}</legend>
    {(url||current)&&<img src={url||current} alt={url?'Square crop preview':'Current photo'} />}
    <input aria-label={label} type="file" name={name} accept="image/jpeg,image/png,image/webp" onChange={event=>{
      const file=event.currentTarget.files?.[0];
      setUrl(file?URL.createObjectURL(file):'');
    }}/>
    {url&&<small>Preview shows the centered square that will be uploaded.</small>}
  </fieldset>;
}

export async function squareCrop(file:File) {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size>5_000_000) throw Error('Choose a JPG, PNG, or WebP under 5 MB.');
  const bitmap=await createImageBitmap(file);
  try {
    const side=Math.min(bitmap.width,bitmap.height);
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=Math.min(side,1200);
    const context=canvas.getContext('2d');
    if(!context)throw Error('Could not prepare the crop.');
    context.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,'image/webp',.88));
    if(!blob||blob.type!=='image/webp')throw Error('Could not save the crop.');
    return new File([blob],'square.webp',{type:blob.type});
  } finally {bitmap.close();}
}
