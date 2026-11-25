'use client';

import { useState } from 'react';

const comments = [
  ['xX_mHieLa_07_Xx', 'h3LLo p0! Parang profile ko nung 2008 yung blue tabs haha.', 3, 0],
  ['kUiA_Pa0w', 'Top Objects muna bago mag-out. Nasa shelf na pala yung lilac!', 8, 1],
  ['aTeh_Jh0y_143', 'yUng moon charm bagay sa bag ko. Pa-tag pag live na :3', 14, 3],
  ['mArKie_bRb', 'Click mo yung swatches para makita yung ibang charm. Diamond ako dito.', 23, 5],
  ['pRinCeSs_NhixX', 'sALAmAt sa pagbisita! May tatlong charm sa iisang lilac colorway. Add mE pLz ♡', 38, 9],
] as const;

export function ProfileComments() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  return <div className="profile-wall">
    <h3>Wall comments</h3>
    <ol className="profile-comments" aria-label="Sample profile comments" tabIndex={0}>
      {comments.map(([name, message, likes, shares], index) => <li key={name}>
        <img className="profile-avatar" src={"/images/profile-avatar-"+(index+1)+".webp"} alt="" loading="lazy"/>
        <div>
          <strong>{name}</strong>
          <p>{message}</p>
          <button type="button" aria-pressed={!!liked[index]} onClick={() => setLiked(previous => ({ ...previous, [index]: !previous[index] }))}>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="14" height="14">
              <path fill="currentColor" d="M1 7h3v8H1zm4 0 3-3 1-3c2 0 3 1 2 4l-1 2h4c1 0 2 1 1 2l-1 5-2 1H5z"/>
            </svg>
            Like · {likes + Number(!!liked[index])}
          </button>
          <small><span aria-hidden="true">↗</span> {shares} shares</small>
        </div>
      </li>)}
    </ol>
  </div>;
}

export function ProfilePost({author,body,image}:{author:string;body?:string;image:string}) {
  const [liked,setLiked]=useState(false);
  return <article className="profile-post">
    <header><img src={image} alt="" /><h2 id="about-title">{author}</h2></header>
    {body && <p>{body}</p>}
    <img className="profile-post-photo" src={image} alt={author+' studio artwork'} loading="lazy"/>
    <button type="button" aria-pressed={liked} onClick={()=>setLiked(!liked)}>👍 {liked ? 'Liked · 1' : 'Like'}</button>
  </article>;
}
