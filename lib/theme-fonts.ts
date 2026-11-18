export const fontSuggestions = [
  {role:'heading', name:'Manrope', vibe:'Rounded, clean display sans'},
  {role:'body', name:'DM Sans', vibe:'Clean and easy to read'},
  {role:'button', name:'Space Grotesk', vibe:'Punchy and slightly futuristic'},
  {role:'label', name:'Space Mono', vibe:'Retro inventory tags'},
];

export function googleFontUrl(name:string) {
  return 'https://fonts.googleapis.com/css2?family='+name.replaceAll(' ','+')+':wght@400;700&display=swap';
}

export function parseGoogleFont(value:string) {
  try {
    const url=new URL(value);
    if(url.origin!=='https://fonts.googleapis.com'||url.pathname!=='/css2')return;
    const match=url.searchParams.get('family')?.match(/^([A-Za-z][A-Za-z0-9 ]{0,79})(?::wght@[0-9.;,]+)?$/);
    if(!match || url.searchParams.getAll('family').length!==1)return;
    return {name:match[1],url:url.href};
  } catch {return undefined;}
}

export const secondaryTones = {
  'button-tone':'Button tint',
  'rack-tone':'Rack trim',
  'shadow-tone':'Borders and shadows',
  'hover-tone':'Hover and focus highlight',
};
