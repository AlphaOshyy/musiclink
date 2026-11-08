// Pure player resolver. Third-party audio loads only after visitor presses Preview.
export function getMedia(raw){
 if(typeof raw!=="string")return {provider:"Link",embed:null};
 let url;try{url=new URL(raw)}catch{return {provider:"Link",embed:null}}
 if(!["https:","http:"].includes(url.protocol))return {provider:"Link",embed:null};
 const h=url.hostname.toLowerCase().replace(/^www\./,""),p=url.pathname;
 if(h==="open.spotify.com"){
  const m=p.match(/^\/(?:intl-[a-z]{2}\/)?(track|album|playlist|episode)\/([a-zA-Z0-9]{10,32})\/?$/);
  return {provider:"Spotify",embed:m?"https://open.spotify.com/embed/"+m[1]+"/"+m[2]:null};
 }
 if(["youtube.com","m.youtube.com","music.youtube.com","youtu.be"].includes(h)){
  const id=h==="youtu.be"?p.split("/")[1]:p.startsWith("/shorts/")||p.startsWith("/embed/")?p.split("/")[2]:url.searchParams.get("v");
  return {provider:"YouTube",embed:id&&/^[A-Za-z0-9_-]{11}$/.test(id)?"https://www.youtube-nocookie.com/embed/"+id:null};
 }
 if(["soundcloud.com","m.soundcloud.com"].includes(h)){
  return {provider:"SoundCloud",embed:/^\/[^/]+\/[^/]+/.test(p)?"https://w.soundcloud.com/player/?url="+encodeURIComponent(url.origin+p)+"&auto_play=false&hide_related=true&show_comments=false":null};
 }
 if(h==="bandcamp.com"||h.endsWith(".bandcamp.com"))return {provider:"Bandcamp",embed:null};
 return {provider:"External link",embed:null};
}
