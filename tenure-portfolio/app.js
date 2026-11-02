/* Spring Hill College tenure portfolio — original documents remain in Drive. */
const SECTIONS=[
 {file:"00-guidance.json",name:"Applicant Guidance",short:"Applicant guidance",lead:"Review instructions",desc:"The institutional guidance supplied with the tenure dossier."},
 {file:"01-candidate.json",name:"Application & Candidate Information",short:"Application & CV",lead:"Begin here",desc:"The letter of application, curriculum vitae, signed fact sheet, and submitted intent to apply."},
 {file:"02-reviews.json",name:"Division Review Materials",short:"Division reviews",lead:"Independent evaluation",desc:"Pre-tenure and divisional review materials in their original folder hierarchy."},
 {file:"03-annual.json",name:"Annual Review Materials",short:"Annual reviews",lead:"A record over time",desc:"Annual goals, Faculty Activities Reports, and evaluations by the division chair."},
 {file:"04-teaching.json",name:"Teaching & Instruction",short:"Teaching",lead:"The center of my work",desc:"Teaching philosophy, all syllabi, observations, student feedback, class notes, teaching exhibits, and archived source reports."},
 {file:"05-service.json",name:"Service",short:"Service",lead:"Building beyond the classroom",desc:"Program development, college governance, student mentoring, recruitment, and the primary supporting documents."},
 {file:"06-scholarship.json",name:"Scholarship & Professional Activity",short:"Scholarship",lead:"Inquiry and learning",desc:"Research manuscripts, scholarly evidence, the scholarship philosophy, and professional activity."},
 {file:"07-other.json",name:"Other Supporting Materials",short:"Letters & materials",lead:"Additional perspectives",desc:"Letters of support and other accompanying records."}
];
const EXPECTED=[1,4,2,10,93,32,37,9];
const state={parts:[],files:[],page:"overview",query:"",view:"list",saved:new Set(),current:null,partial:false};
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ordered=(a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true,sensitivity:"base"});
const archive=f=>(f.path||[]).some(s=>/archive|not for review/i.test(s));
const num=i=>String(i).padStart(2,"0");
const sectionCount=i=>(state.parts[i]?.files||[]).length;
const findTerm=term=>state.files.find(f=>f.title.toLowerCase().includes(term.toLowerCase()));
function original(f) {
  const url=f.url||"";
  try {const u=new URL(url);if(u.protocol==="https:"&&["drive.google.com","docs.google.com"].includes(u.hostname))return url;}catch(e){}
  return "https://drive.google.com/file/d/"+encodeURIComponent(f.id)+"/view";
}
function preview(f){
  const id=encodeURIComponent(f.id),m=f.mime||"";
  if(m==="application/vnd.google-apps.document")return "https://docs.google.com/document/d/"+id+"/preview";
  if(m==="application/vnd.google-apps.presentation")return "https://docs.google.com/presentation/d/"+id+"/preview";
  if(m==="application/vnd.google-apps.spreadsheet")return "https://docs.google.com/spreadsheets/d/"+id+"/preview";
  return "https://drive.google.com/file/d/"+id+"/preview";
}
function setPage(next){
  state.page=next;state.query="";$("#global-search").value="";
  history.replaceState(null,"","#"+(next==="overview"||next==="saved"?next:"section="+next));
  render();
}
function nav(){
  $("#section-nav").innerHTML='<button class="nav-item" data-nav="overview"><span class="nav-number">⌂</span><span class="nav-text">Portfolio overview</span></button>'+SECTIONS.map((s,i)=>'<button class="nav-item" data-nav="'+i+'"><span class="nav-number">'+num(i)+'</span><span class="nav-text">'+esc(s.short)+'</span><span class="nav-count">'+sectionCount(i)+'</span></button>').join("");
}
function highlightNav(){
 document.querySelectorAll("#section-nav [data-nav]").forEach(el=>{
  const active=el.dataset.nav===state.page;el.classList.toggle("is-active",active);
  if(active)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");
 });
 $("#bookmark-count").textContent=state.saved.size;
}
function overview(){
  const features=[
    [4,"Teaching & Instruction","The advanced curriculum, classroom practice, course notes, feedback, observations, and teaching materials."],
    [5,"Service & Program Development","Faculty and college service, student mentoring, academic initiatives, and community outreach."],
    [6,"Scholarship & Professional Activity","Published and developing work, research projects, and professional learning."],
    [2,"Independent Reviews","Division reviews, complemented by annual evaluations and additional letters."]
  ];
  const journey=[
    ["01","Letter of application","TENURE-2026-Application-Letter"],
    ["02","Curriculum vitae","Curriculum Vitae — Priyojit"],
    ["03","Teaching philosophy","Teaching Philosophy — Tenure"],
    ["04","Service philosophy","Service Philosophy — Tenure"],
    ["05","Scholarship philosophy","Scholarship and Professional Activity Philosophy"]
  ];
  return '<div class="container">'+(state.partial?'<p class="data-warning">Some original Drive records could not be indexed. Consult the original dossier for complete coverage.</p>':"")+
  '<section class="intro-hero"><div class="hero-copy"><span class="eyebrow">FACULTY PORTFOLIO · 2022–2026</span><h2>Teaching, building,<br>and learning at Spring Hill.</h2><p>When I arrived in 2022, one of my central tasks was to prepare advanced Computer Science courses for students progressing beyond the introductory sequence. Over four years, the work grew into laboratories, mentoring, program development, research, and service. This portfolio brings that story together with the records that document it.</p><div class="hero-actions"><button class="button primary" data-open-term="TENURE-2026-Application-Letter">Read the application ↗</button><button class="button secondary" data-nav="4">Explore teaching</button></div></div></section>'+
  '<div class="stats-strip"><div class="stat"><strong>'+state.files.length+'</strong><span>original Drive documents indexed</span></div><div class="stat"><strong>8</strong><span>sections from the source dossier</span></div><div class="stat"><strong>'+state.files.filter(archive).length+'</strong><span>archived source records retained</span></div></div>'+
  '<div class="section-label-row"><div><span class="eyebrow">EXPLORE THE RECORD</span><h3>The work, and the evidence</h3></div><p>Each document opens in the reader.</p></div>'+
  '<div class="feature-grid">'+features.map(([i,title,description])=>'<button class="feature-card" data-nav="'+i+'"><span class="small-index">SECTION '+num(i)+'</span><h4>'+esc(title)+'</h4><p>'+esc(description)+'</p><div class="card-bottom"><span>'+sectionCount(i)+' documents</span><span>↗</span></div></button>').join("")+'</div>'+
  '<div class="guided-path"><section class="path-panel"><span class="eyebrow">A RECOMMENDED READING PATH</span><h3>Start with the account. Follow the evidence.</h3><p>The application supplies the narrative, the philosophies explain the approach, and the evaluations and exhibits provide supporting records.</p><div class="path-list">'+journey.map(([n,title,term])=>'<button class="path-link" data-open-term="'+esc(term)+'"><em>'+n+'</em><span>'+esc(title)+'</span>↗</button>').join("")+'</div></section>'+
  '<section class="notice-panel"><span class="eyebrow">ABOUT THE DOCUMENTS</span><h3>Original records, not copies</h3><p>Every document here points to its existing Spring Hill College Google Drive location, including historical reviews and archived source material. Nothing has been uploaded to Drive or duplicated in the website.</p><p>The built-in preview supports reading without leaving the portfolio when your institution permits it. Otherwise, open the original file in Drive.</p><button class="button secondary" data-nav="3">See annual evaluations ↗</button></section></div></div>';
}
function typeOf(f){
 const m=f.mime||"";
 if(m.includes("pdf"))return ["PDF","pdf"];
 if(m.includes("document")||m.includes("wordprocessing"))return ["DOC","doc"];
 if(m.includes("spreadsheet"))return ["XLS","doc"];
 if(m.includes("presentation"))return ["PPT","doc"];
 return ["FILE","other"];
}
function documentRow(f){
 const [code,cl]=typeOf(f),folder=(f.path||[]).slice(1,-1).join(" / ");
 return '<button class="doc-row" data-open="'+esc(f.id)+'"><span class="doc-icon '+cl+'">'+code+'</span><span class="doc-text"><span class="doc-title">'+esc(f.title)+'</span><span class="doc-desc">'+esc(folder)+(archive(f)?" · ARCHIVE":"")+'</span></span><span class="doc-arrow">↗</span></button>';
}
function groups(files){
 const m=new Map();
 files.forEach(f=>{const key=(f.path||[])[1]||"Documents in this section";if(!m.has(key))m.set(key,[]);m.get(key).push(f)});
 return [...m.entries()].sort((a,b)=>ordered(a[0],b[0]));
}
function groupHtml(name,files){
 return '<section class="folder-group"><div class="folder-head"><div><h3>'+esc(name)+'</h3><p>'+((files.length&&files.every(archive))?"Archived primary records":"Original Drive evidence")+'</p></div><span class="folder-count">'+files.length+' files</span></div><div class="doc-list">'+[...files].sort((a,b)=>ordered(a.title,b.title)).map(documentRow).join("")+'</div></section>';
}
function groupList(files){return groups(files).map(([name,items])=>groupHtml(name,items)).join("")}
function treeHtml(i){
 const s=state.parts[i],root={name:SECTIONS[i].name,kids:new Map(),files:[]};
 function node(parts){let here=root;parts.forEach(p=>{if(!here.kids.has(p))here.kids.set(p,{name:p,kids:new Map(),files:[]});here=here.kids.get(p)});return here}
 (s.folders||[]).forEach(f=>node((f.path||[]).slice(1)));
 (s.files||[]).forEach(f=>node((f.path||[]).slice(1,-1)).files.push(f));
 function total(n){return n.files.length+[...n.kids.values()].reduce((sum,x)=>sum+total(x),0)}
 function html(n,rootNode){return '<div class="tree-node '+(rootNode?"root":"")+'">'+(rootNode?"":'<div class="tree-folder">▾ '+esc(n.name)+' <small>('+total(n)+')</small></div>')+
 [...n.kids.values()].sort((a,b)=>ordered(a.name,b.name)).map(x=>html(x,false)).join("")+
 [...n.files].sort((a,b)=>ordered(a.title,b.title)).map(f=>'<button class="tree-file" data-open="'+esc(f.id)+'">▤ '+esc(f.title)+'</button>').join("")+'</div>'}
 return '<div class="tree-view">'+html(root,true)+'</div>';
}
function sectionHtml(i){
 const s=SECTIONS[i],p=state.parts[i],files=p?.files||[];
 return '<div class="container"><div class="content-head"><div><span class="eyebrow">SECTION '+num(i)+' · '+esc(s.lead)+'</span><h2>'+esc(s.name)+'</h2><p>'+esc(s.desc)+'</p></div><div class="section-meta"><strong>'+files.length+'</strong><span>documents</span></div></div>'+
 '<div class="section-tools"><span class="small-detail">Choose a document to read; switch to the folder tree to see the full structure.</span><div class="tool-buttons"><button class="toggle-button '+(state.view==="list"?"active":"")+'" data-view="list">Document list</button><button class="toggle-button '+(state.view==="tree"?"active":"")+'" data-view="tree">Folder tree</button></div></div>'+
 (state.view==="tree"?treeHtml(i):groupList(files))+
 (files.length?"":'<div class="empty-state"><h3>No documents in this section</h3><p>The source folder may be reserved for future materials.</p></div>')+'</div>';
}
function searchHtml(query){
 const tokens=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const files=state.files.filter(f=>tokens.every(t=>(f.title+" "+(f.path||[]).join(" ")).toLowerCase().includes(t)));
 return '<div class="container"><div class="search-results-heading"><div><span class="eyebrow">PORTFOLIO SEARCH</span><h2>Search results</h2><span class="result-meta">'+files.length+' documents matching “'+esc(query)+'”</span></div><button class="button secondary" data-clear-search>Clear search</button></div>'+
 (files.length?groupList(files):'<div class="empty-state"><h3>No matching records</h3><p>Try a course code, year, author, or subject.</p></div>')+'</div>';
}
function savedHtml(){
 const files=state.files.filter(f=>state.saved.has(f.id));
 return '<div class="container"><div class="content-head"><div><span class="eyebrow">YOUR READING LIST</span><h2>Saved documents</h2><p>Select Save in the reader to collect a set of documents on this browser.</p></div><div class="section-meta"><strong>'+files.length+'</strong><span>saved</span></div></div>'+
 (files.length?groupList(files):'<div class="empty-state"><h3>No saved documents yet</h3><p>Open a document and choose Save.</p><button class="button secondary" data-nav="overview">Back to overview</button></div>')+'</div>';
}
function render(){
 highlightNav();
 $("#main-content").innerHTML=state.query.trim()?searchHtml(state.query):state.page==="overview"?overview():state.page==="saved"?savedHtml():sectionHtml(Number(state.page));
 const name=state.query?"Search results":state.page==="overview"?"Overview":state.page==="saved"?"Saved documents":SECTIONS[Number(state.page)].name;
 $("#top-breadcrumb").innerHTML='Portfolio <span>/</span> '+esc(name);
 $(".sidebar").classList.remove("mobile-open");$("#menu-toggle").setAttribute("aria-expanded","false");
}
function openReader(file,restore=false){
 if(!file)return;
 state.current=file;
 $("#reader-title").textContent=file.title;
 $("#reader-path").textContent=(file.path||[]).slice(0,-1).join(" / ");
 $("#reader-subtitle").textContent=SECTIONS[file.section].name+" · Original Drive file";
 $("#reader-external").href=original(file);
 $("#reader-frame").src=preview(file);
 $("#reader-save").textContent=state.saved.has(file.id)?"★ Saved":"☆ Save";
 $("#document-reader").classList.add("open");$("#document-reader").setAttribute("aria-hidden","false");
 $("#reader-scrim").hidden=false;document.body.style.overflow="hidden";
 if(!restore)history.replaceState(null,"","#document="+file.id);
 $("#reader-close").focus();
}
function closeReader(){
 $("#document-reader").classList.remove("open","expanded");
 $("#document-reader").setAttribute("aria-hidden","true");
 $("#reader-expand").textContent="Expand view";$("#reader-scrim").hidden=true;
 $("#reader-frame").src="about:blank";document.body.style.overflow="";
 state.current=null;
 history.replaceState(null,"","#"+(state.page==="overview"||state.page==="saved"?state.page:"section="+state.page));
}
function saveCurrent(){
 const file=state.current;if(!file)return;
 if(state.saved.has(file.id))state.saved.delete(file.id);else state.saved.add(file.id);
 try{localStorage.setItem("shc-tenure-saved",JSON.stringify([...state.saved]))}catch(e){}
 $("#reader-save").textContent=state.saved.has(file.id)?"★ Saved":"☆ Save";
 $("#bookmark-count").textContent=state.saved.size;
}
async function start(){
 const responses=await Promise.allSettled(SECTIONS.map(s=>fetch("./data/"+s.file,{cache:"no-store"}).then(r=>{if(!r.ok)throw Error(r.status);return r.json()})));
 state.parts=responses.map((r,i)=>r.status==="fulfilled"?r.value:{section:SECTIONS[i].name,files:[],folders:[],errors:[String(r.reason)]});
 state.parts.forEach((s,i)=>{
  s.files=(s.files||[]).map(f=>({...f,section:i}));
  if(s.files.length!==EXPECTED[i]||(s.errors||[]).length||(s.unscanned||[]).length)state.partial=true;
 });
 state.files=state.parts.flatMap(s=>s.files);
 try{const old=JSON.parse(localStorage.getItem("shc-tenure-saved")||"[]");state.saved=new Set(Array.isArray(old)?old:[])}catch(e){}
 nav();
 const h=decodeURIComponent(location.hash.slice(1));
 if(h.startsWith("section=")){const n=Number(h.slice(8));if(Number.isInteger(n)&&n>=0&&n<8)state.page=String(n)}
 else if(h==="saved")state.page="saved";
 else if(h.startsWith("document=")){const f=state.files.find(x=>x.id===h.slice(9));if(f){state.page=String(f.section);render();openReader(f,true);return}}
 render();
}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-nav]");if(nav){setPage(nav.dataset.nav);return}
 const term=e.target.closest("[data-open-term]");if(term){openReader(findTerm(term.dataset.openTerm));return}
 const doc=e.target.closest("[data-open]");if(doc){openReader(state.files.find(f=>f.id===doc.dataset.open));return}
 const view=e.target.closest("[data-view]");if(view){state.view=view.dataset.view;render();return}
 if(e.target.closest("[data-clear-search]")){$("#global-search").value="";state.query="";render()}
});
$("#global-search").addEventListener("input",e=>{state.query=e.target.value;render()});
$("#global-search").addEventListener("keydown",e=>{if(e.key==="Escape"){e.target.value="";state.query="";render()}});
$("#reader-close").addEventListener("click",closeReader);
$("#reader-scrim").addEventListener("click",closeReader);
$("#reader-save").addEventListener("click",saveCurrent);
$("#reader-expand").addEventListener("click",()=>{
 const expanded=$("#document-reader").classList.toggle("expanded");
 $("#reader-expand").textContent=expanded?"Restore view":"Expand view";
});
$("#bookmarks-link").addEventListener("click",()=>setPage("saved"));
$("#menu-toggle").addEventListener("click",()=>{
 const expanded=$("#sidebar").classList.toggle("mobile-open");
 $("#menu-toggle").setAttribute("aria-expanded",String(expanded));
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape"&&state.current){closeReader();return}
 if(e.key==="/"&&!state.current&&document.activeElement!==$("#global-search")&&!["INPUT","TEXTAREA"].includes(document.activeElement.tagName)){
  e.preventDefault();$("#global-search").focus();
 }
});
window.addEventListener("hashchange",()=>{
 if(state.current)return;
 const h=decodeURIComponent(location.hash.slice(1));
 if(h==="overview"||h==="saved")setPage(h);
 else if(h.startsWith("section=")){const n=Number(h.slice(8));if(Number.isInteger(n)&&n>=0&&n<8)setPage(String(n))}
 else if(h.startsWith("document=")){const f=state.files.find(f=>f.id===h.slice(9));if(f){state.page=String(f.section);render();openReader(f,true)}}
});
start().catch(err=>{$("#main-content").innerHTML='<div class="container"><div class="empty-state"><h3>Portfolio data unavailable</h3><p>Reload the page or use the original SHC Drive folder.</p></div></div>';});
