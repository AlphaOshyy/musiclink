const modal=document.getElementById("modal"),content=document.getElementById("content");document.querySelectorAll("[data-tool]").forEach(x=>x.addEventListener("click",()=>openTool(x.dataset.tool)));document.getElementById("close").onclick=close;modal.addEventListener("click",e=>{if(e.target===modal)close()});document.addEventListener("keydown",e=>{if(e.key==="Escape")close()});function close(){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}function field(a,b,c){return '<div class="field"><label>'+a+'</label><input name="'+b+'" placeholder="'+c+'"></div>'}function openTool(type){let title="",sub="",body="";if(type==="release"){title="Release Planner";sub="Create a practical launch checklist in seconds.";body=field("Artist","artist","Young Nova")+field("Release","release","Song title")+field("Release date","date","DD / MM / YYYY")+'<button class="generate" id="go">Create checklist</button>'}else if(type==="promotion"){title="Promotion Planner";sub="Turn one release into seven focused content actions.";body=field("Artist","artist","Your artist name")+field("Release","release","Song title")+'<button class="generate" id="go">Build plan</button>'}else if(type==="profile"||type==="epk"){title=type==="profile"?"Artist Profile":"EPK Builder";sub="Prepare professional artist copy from your basic details.";body=field("Artist","artist","Young Nova")+field("Genre","genre","Hip hop")+field("Location","location","Sri Lanka")+'<div class="field full"><label>DESCRIBE YOUR SOUND</label><textarea name="sound" placeholder="Your sound, themes, influences and story"></textarea></div><button class="generate" id="go">Generate text</button>'}else{title=type==="studio"?"Studio Checklist":"Collaboration Checklist";sub="Keep the important details checked before release.";let list=type==="studio"?["Session files backed up","Beat or instrumental saved","Vocal takes labeled","Lyrics and notes ready","Credits confirmed","WAV and MP3 exports ready","Project folder backed up"]:["Artist roles confirmed","Songwriting credits agreed","Producer credit confirmed","Split details discussed","Master ownership discussed","Artwork approved","Final links shared"];body='<div class="check">'+list.map(x=>'<label><input type="checkbox"> '+x+'</label>').join("")+"</div>"}content.innerHTML='<h2 class="title">'+title+'</h2><p class="sub">'+sub+'</p><div class="form">'+body+"</div>";modal.classList.add("open");modal.setAttribute("aria-hidden","false");const go=document.getElementById("go");if(go)go.onclick=()=>result(type)}function result(type){let html="";if(type==="release")html='<div class="result"><h4>Release checklist</h4><div class="check">'+["Finalize master","Confirm credits","Prepare artwork","Prepare EPK","Schedule announcement","Prepare short form content","Upload to distributor","Check release links"].map(x=>'<label><input type="checkbox"> '+x+"</label>").join("")+"</div></div>";else if(type==="promotion")html='<div class="result"><h4>7 day promotion plan</h4><p>Day 1, announce the project.<br>Day 2, share the artwork or story.<br>Day 3, post a short preview.<br>Day 4, show a behind the scenes moment.<br>Day 5, ask listeners to save the release.<br>Day 6, prepare release day reminders.<br>Day 7, publish the release and share the link.</p></div>';else{const f=new FormData(document.querySelector(".form"));const artist=f.get("artist")||"The artist",genre=f.get("genre")||"music",loc=f.get("location")||"Sri Lanka",sound=f.get("sound")||"developing a distinct sound and identity through original music";html='<div class="result"><h4>'+artist+'</h4><p>'+artist+" is an independent "+genre+" artist based in "+loc+". Their work focuses on "+sound+".</p></div>"}document.querySelector(".form").insertAdjacentHTML("afterend",html)}const glow=document.querySelector(".cursor-glow");window.addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"});const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12});document.querySelectorAll(".reveal").forEach(e=>observer.observe(e));

/* BlindMatch browser prototype. This is a UI demo, not a secure multi-user backend. */
(function initBlindMatch(){
  const projectForm=document.getElementById("project-form");
  const auditionForm=document.getElementById("audition-form");
  const list=document.getElementById("audition-list");
  if(!projectForm||!auditionForm||!list)return;
  const PROJECT_KEY="musiclink-blindmatch-project-v1";
  const AUDITIONS_KEY="musiclink-blindmatch-auditions-v1";
  const RATINGS_KEY="musiclink-blindmatch-ratings-v1";
  const seed=[
    {id:"A-104",artistName:"Maya Sen",role:"Hook vocalist",language:"Sinhala / English",genre:"Hip hop",mood:"Dark / atmospheric",briefFit:92,bio:"Melodic vocalist focused on atmospheric hooks and bilingual toplines.",followers:1840},
    {id:"A-218",artistName:"Kavi North",role:"Hook vocalist",language:"Sinhala",genre:"R&B",mood:"Emotional",briefFit:86,bio:"Singer and topline writer with a soft, expressive vocal style.",followers:420},
    {id:"A-307",artistName:"Rin Waves",role:"Hook vocalist",language:"English",genre:"Hip hop",mood:"Dark / atmospheric",briefFit:89,bio:"Independent vocalist experimenting with layered vocals and dark melodies.",followers:95}
  ];
  let project=read(PROJECT_KEY,{title:"Sinhala rap hook",role:"Hook vocalist",language:"Sinhala",genre:"Hip hop",mood:"Dark / atmospheric",notes:"A memorable 8 bar hook with a moody melodic delivery."});
  let auditions=read(AUDITIONS_KEY,null)||seed.map(x=>({...x}));
  let ratings=read(RATINGS_KEY,{});
  let revealed=false;
  let ranked=false;
  const audioUrls={};
  function read(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback}catch(e){return fallback}}
  function save(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
  function safe(value){return String(value==null?"":value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]))}
  function normal(value){return String(value||"").trim().toLowerCase()}
  function compatible(a,b){return normal(a)===normal(b)||normal(a)==="any language"||normal(a).includes(normal(b))||normal(b).includes(normal(a))}
  function score(a){
    const roleFit=normal(a.role)===normal(project.role)?100:55;
    const languageFit=compatible(a.language,project.language)?100:35;
    const genreFit=normal(a.genre)===normal(project.genre)?100:55;
    const moodFit=normal(a.mood)===normal(project.mood)?100:55;
    const briefFit=(roleFit*.5)+(moodFit*.3)+(Number(a.briefFit||75)*.2);
    const rating=Number(ratings[a.id]||0)*20;
    return Math.round((briefFit*.30)+(languageFit*.25)+(genreFit*.20)+(rating*.25));
  }
  function updateProjectFields(){
    for(const [id,key] of [["project-title","title"],["project-role","role"],["project-language","language"],["project-genre","genre"],["project-mood","mood"],["project-notes","notes"]]){
      const el=document.getElementById(id);if(el)el.value=project[key]||el.value;
    }
    document.getElementById("audition-heading").textContent=project.title||"Auditions for your project";
    document.getElementById("audition-subtitle").textContent=project.role+" · "+project.language+" · "+project.genre;
  }
  function render(){
    const entries=[...auditions];
    if(ranked)entries.sort((a,b)=>score(b)-score(a));
    list.innerHTML=entries.map((a,index)=>{
      const rating=Number(ratings[a.id]||0);
      const isShort=rating>=4;
      const audio=audioUrls[a.id]||a.audioUrl||"";
      return '<article class="audition-card'+(isShort?' shortlisted':'')+'" data-audition="'+safe(a.id)+'">'+
        '<div><div class="audition-id">BLIND ENTRY / '+safe(a.id)+'</div><h4>Audition '+String(index+1).padStart(2,"0")+'</h4>'+
        '<p>'+safe(a.role)+' · '+safe(a.language)+'</p><div class="audition-tags"><span>'+safe(a.genre)+'</span><span>'+safe(a.mood)+'</span><span>Profile hidden</span></div></div>'+
        '<div class="audition-side"><div class="match-score">'+score(a)+'<small> / 100</small></div><label class="rating-control">Your fit rating <select class="audition-rating" aria-label="Rate '+safe(a.id)+'" data-id="'+safe(a.id)+'"><option value="0" '+(rating===0?'selected':'')+'>Rate</option><option value="1" '+(rating===1?'selected':'')+'>1 / 5</option><option value="2" '+(rating===2?'selected':'')+'>2 / 5</option><option value="3" '+(rating===3?'selected':'')+'>3 / 5</option><option value="4" '+(rating===4?'selected':'')+'>4 / 5</option><option value="5" '+(rating===5?'selected':'')+'>5 / 5</option></select></label></div>'+
        (audio?'<audio class="audition-audio" controls preload="none" src="'+safe(audio)+'">Your browser does not support audio playback.</audio>':'')+
        (revealed&&rating>=4?'<div class="audition-reveal"><b>Profile revealed:</b> '+safe(a.artistName)+'<br>'+safe(a.bio||"Independent creator seeking collaborative projects.")+'<br>Public followers: '+Number(a.followers||0).toLocaleString()+' · Demo profile, not verified</div>':'')+
        '</article>';
    }).join("");
    const rated=Object.keys(ratings).filter(id=>auditions.some(a=>a.id===id)&&Number(ratings[id])>0).length;
    const qualified=auditions.filter(a=>Number(ratings[a.id]||0)>=4).length;
    const status=document.getElementById("blind-status");
    status.className="bm-status"+(rated?" success":"");
    status.textContent=revealed?(qualified?"Profiles revealed for "+qualified+" audition(s) rated 4/5 or higher.":"Rate an audition 4/5 or higher to create a shortlist."):(rated?rated+" audition(s) rated. Give a 4/5 or 5/5 rating to shortlist.":"Rate auditions before revealing creator profiles.");
    document.getElementById("reveal-shortlist").textContent=revealed?"Hide revealed profiles":"Reveal shortlist";
    document.getElementById("reveal-shortlist").disabled=qualified===0&&!revealed;
  }
  projectForm.addEventListener("submit",event=>{
    event.preventDefault();
    const data=new FormData(projectForm);
    project={title:String(data.get("title")||"Untitled project").trim(),role:String(data.get("role")),language:String(data.get("language")),genre:String(data.get("genre")),mood:String(data.get("mood")),notes:String(data.get("notes")||"").trim()};
    save(PROJECT_KEY,project);revealed=false;ranked=false;updateProjectFields();render();
    const status=document.getElementById("blind-status");status.textContent="Project brief saved in this browser.";status.className="bm-status success";
  });
  auditionForm.addEventListener("submit",event=>{
    event.preventDefault();
    const data=new FormData(auditionForm);
    const name=String(data.get("artistName")||"").trim();
    if(!name)return;
    const file=document.getElementById("audition-audio").files[0];
    const id="A-"+String(Date.now()).slice(-5);
    const item={id,artistName:name,role:project.role,language:String(data.get("language")),genre:String(data.get("genre")),mood:String(data.get("mood")),briefFit:75,bio:"Creator submitted an audition for "+project.title+".",followers:0};
    if(file&&file.type.startsWith("audio/"))audioUrls[id]=URL.createObjectURL(file);
    auditions.push(item);save(AUDITIONS_KEY,auditions);revealed=false;ranked=false;render();auditionForm.reset();
    const status=document.getElementById("blind-status");status.textContent="Audition added. The profile name is hidden in the review card.";status.className="bm-status success";
  });
  list.addEventListener("change",event=>{
    const select=event.target.closest(".audition-rating");if(!select)return;
    ratings[select.dataset.id]=Number(select.value)||0;save(RATINGS_KEY,ratings);revealed=false;render();
  });
  document.getElementById("rank-auditions").addEventListener("click",()=>{ranked=!ranked;render();document.getElementById("rank-auditions").textContent=ranked?"Show submission order":"Rank by fit"});
  document.getElementById("reveal-shortlist").addEventListener("click",()=>{revealed=!revealed;render()});
  updateProjectFields();render();
})();
