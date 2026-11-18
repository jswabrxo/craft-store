export const palettePresets = [
  {name:'Lagoon Desktop',colors:['#77c7ed','#76d6af','#18766c']},
  {name:'Peach Screensaver',colors:['#ffc7ab','#f4dca6','#963e38']},
  {name:'Icy Lavender',colors:['#bdc6f8','#dbbaea','#604e95']},
] satisfies {name:string;colors:[string,string,string]}[];

function mix(a:string,b:string,t:number){
 return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
}
export function makePalette([sky,mint,accent]:[string,string,string]){
 return {sky:mix(sky,'#ffffff',.50),background:mix(mix(sky,mint,.65),'#ffffff',.76),
  surface:mix(mint,'#ffffff',.92),ink:mix(accent,'#08171a',.76),accent:mix(accent,'#101c20',.24),
  'button-tone':mix(mint,sky,.3),'rack-tone':mix(mint,'#ffffff',.6),
  'shadow-tone':mix(accent,'#ffffff',.34),'hover-tone':mix(sky,accent,.55)};
}
