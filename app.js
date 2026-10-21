
/* Standalone application shell. No frameworks, accounts, cookies, APIs, or build step. */
'use strict';
const $=id=>document.getElementById(id);
const el={sidebar:$('sidebar'),sidebarDim:$('sidebarDim'),mobileMenu:$('mobileMenu'),chapters:$('chapters'),search:$('search'),chapterPill:$('chapterPill'),chapterName:$('chapterName'),title:$('lessonTitle'),desc:$('lessonDesc'),sectionBadge:$('sectionBadge'),topCounter:$('topCounter'),bookLink:$('bookLink'),question:$('question'),formula:$('formula'),controls:$('parameterControls'),noControls:$('noControls'),canvas:$('labCanvas'),play:$('playBtn'),playLabel:$('playLabel'),prev:$('prevBtn'),next:$('nextBtn'),reset:$('resetBtn'),timeline:$('timeline'),frameCounter:$('frameCounter'),stagePosition:$('stagePosition'),speed:$('speed'),previousLesson:$('previousLesson'),nextLesson:$('nextLesson'),previousName:$('previousName'),nextName:$('nextName'),sidebarCount:$('sidebarCount'),visitedCount:$('visitedCount'),toast:$('toast')};
const ctx=el.canvas.getContext('2d');
let lessonIndex=0,frame=0,timer=null,chapterExpanded=0,values={},visited=new Set(),toastTimer=null;
try{const saved=JSON.parse(localStorage.getItem('dvl-visited')||'[]');if(Array.isArray(saved))visited=new Set(saved.filter(x=>typeof x==='string'));}catch(_){/* private browser mode may disable storage */}
function current(){return LABS[lessonIndex]}
function defaults(lab){return Object.fromEntries(lab.controls.map(c=>[c.key,c.value]));}
function maxFrame(){return Math.max(0,countSteps(current(),values)-1)}
function numberTwo(n){return String(n).padStart(2,'0')}
function saveVisited(){try{localStorage.setItem('dvl-visited',JSON.stringify([...visited]));}catch(_){}}
function esc(s){return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function hashIndex(){const hash=location.hash.replace(/^#/,''),query=hash.match(/^(?:lab-|section-)?(\d+)[.-](\d+)$/);return query?LABS.findIndex(x=>x.section===query[1]+'.'+query[2]):-1;}
function closeSidebar(){el.sidebar.classList.remove('open');el.sidebarDim.hidden=true;el.mobileMenu.setAttribute('aria-expanded','false')}
function toggleSidebar(){const on=!el.sidebar.classList.contains('open');el.sidebar.classList.toggle('open',on);el.sidebarDim.hidden=!on;el.mobileMenu.setAttribute('aria-expanded',String(on))}
function renderNav(){const term=el.search.value.toLowerCase().trim();const containers=CHAPTERS.map(ch=>{
  const labs=LABS.filter(l=>l.chapter===ch.number && (!term||(`${l.section} ${l.title} ${ch.name} ${l.desc}`).toLowerCase().includes(term)));
  if(!labs.length)return '';
  const active=ch.number===current().chapter,expanded=term?true:chapterExpanded===ch.number;
  return `<div class="chapter-nav ${expanded?'expanded':''}" data-chapter="${ch.number}"><button class="chapter-toggle ${active?'active':''}" type="button" data-open-chapter="${ch.number}" aria-expanded="${expanded}" aria-label="Chapter ${ch.number}: ${esc(ch.name)}"><span class="chapter-index">${numberTwo(ch.number)}</span><span class="chapter-name">${esc(ch.name)}</span><span class="chapter-chevron">▼</span></button><div class="section-links">${labs.map(l=>`<button type="button" data-lesson="${l.section}" class="section-link ${current().section===l.section?'current':''} ${visited.has(l.section)?'visited':''}" ${current().section===l.section?'aria-current="page"':''}><span class="section-num">${esc(l.section)}</span><span>${esc(l.title)}</span></button>`).join('')}</div></div>`;
 }).filter(Boolean);
 el.chapters.innerHTML=containers.length?containers.join(''):'<div class="search-empty">No explorations match your search.</div>';
 el.chapters.querySelectorAll('[data-open-chapter]').forEach(btn=>btn.addEventListener('click',()=>{chapterExpanded=chapterExpanded===Number(btn.dataset.openChapter)?-1:Number(btn.dataset.openChapter);renderNav()}));
 el.chapters.querySelectorAll('[data-lesson]').forEach(btn=>btn.addEventListener('click',()=>navigate(btn.dataset.lesson)));
 el.sidebarCount.textContent=term?`${LABS.filter(l=>(`${l.section} ${l.title} ${CHAPTERS[l.chapter].name} ${l.desc}`).toLowerCase().includes(term)).length} matching`:`${LABS.length} explorations`;
 el.visitedCount.textContent=`${visited.size} explored`;
 }
function renderParams(){const controls=current().controls;el.noControls.hidden=controls.length!==0;
 el.controls.innerHTML=controls.map(c=>`<label class="param-row" for="param-${c.key}"><span>${esc(c.label)}</span><input type="range" id="param-${c.key}" data-key="${esc(c.key)}" min="${c.min}" max="${c.max}" step="1" value="${values[c.key]}" aria-valuetext="${values[c.key]}"><output class="param-value" for="param-${c.key}" id="value-${c.key}">${values[c.key]}</output></label>`).join('');
 el.controls.querySelectorAll('[data-key]').forEach(input=>input.addEventListener('input',()=>{pause();values[input.dataset.key]=Number(input.value);if(values.k!==undefined&&values.n!==undefined&&values.k>values.n){values.k=values.n;const kSlider=$('param-k');if(kSlider)kSlider.value=values.k;const kValue=$('value-k');if(kValue)kValue.textContent=values.k;}const output=$('value-'+input.dataset.key);output.textContent=input.value;frame=Math.min(frame,maxFrame());if(current().kind==='vennCount'){values.both=Math.min(values.both,values.a,values.b);$('param-both').value=values.both;$('value-both').textContent=values.both;}draw();}));
}
function setCanvasScale(){if(!ctx)return;const ratio=Math.min(window.devicePixelRatio||1,2);const w=Math.round(W*ratio),h=Math.round(H*ratio);if(el.canvas.width!==w||el.canvas.height!==h){el.canvas.width=w;el.canvas.height=h;}ctx.setTransform(ratio,0,0,ratio,0,0)}
function draw(){if(!ctx)return;setCanvasScale();const total=maxFrame();frame=Math.min(Math.max(frame,0),total);try{renderLab(ctx,current(),values,frame,0)}catch(err){console.error('Visualization error:',current().section,err);pause();canvasBase(ctx);head(ctx,'Animation error','Please choose a different set of parameters and try again.');}
 el.timeline.max=total;el.timeline.value=frame;el.timeline.style.background=`linear-gradient(to right, #89e8b9 0%, #89e8b9 ${total?100*frame/total:100}%, #314257 ${total?100*frame/total:100}%, #314257 100%)`;
 const label=`${frame} / ${total}`;el.frameCounter.textContent=label;el.stagePosition.textContent=`Frame ${label}`;
 el.prev.disabled=frame===0;el.next.disabled=frame===total;el.playLabel.textContent=timer?'Pause animation':frame===total?'Replay animation':'Play animation';el.play.setAttribute('aria-label',timer?'Pause animation':'Play animation');el.play.firstChild.textContent=timer?'❚❚ ':'▶ ';
}
function pause(){if(timer!==null){clearInterval(timer);timer=null}draw()}
function play(){if(timer!==null){pause();return;}if(frame>=maxFrame())frame=0;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){showToast('Manual stepping is recommended when reduced motion is enabled.');}
 timer=setInterval(()=>{if(frame>=maxFrame()){pause();return;}frame++;draw();if(frame>=maxFrame())pause()},Number(el.speed.value));draw();}
function step(delta){if(timer!==null)pause();frame=Math.min(maxFrame(),Math.max(0,frame+delta));draw()}
function selectLesson(i,changeHash=true){if(i<0||i>=LABS.length)return;pause();lessonIndex=i;frame=0;values=defaults(current());chapterExpanded=current().chapter;
 visited.add(current().section);saveVisited();const lab=current(),ch=CHAPTERS[lab.chapter];
 el.chapterPill.textContent=`CHAPTER ${numberTwo(ch.number)}`;el.chapterName.textContent=ch.name.toUpperCase();el.title.textContent=lab.title;el.desc.textContent=lab.desc;el.sectionBadge.textContent='§ '+lab.section;
 el.topCounter.innerHTML=`${numberTwo(lessonIndex+1)} <span>/</span> ${LABS.length}`;el.bookLink.href=lab.url;el.bookLink.title=`Read section ${lab.section} in the open textbook`;
 el.question.textContent=lab.question;el.formula.textContent=lab.formula;
 el.previousLesson.disabled=lessonIndex===0;el.nextLesson.disabled=lessonIndex===LABS.length-1;
 el.previousName.textContent=lessonIndex>0?LABS[lessonIndex-1].title:'Beginning of library';el.nextName.textContent=lessonIndex<LABS.length-1?LABS[lessonIndex+1].title:'End of library';
 renderParams();renderNav();draw();document.title=`${lab.section} ${lab.title} — Discrete Visual Lab`;
 if(changeHash){const hash='#'+lab.section.replace('.','-');if(location.hash!==hash)history.replaceState(null,'',hash);}
 closeSidebar();}
function navigate(section){const i=LABS.findIndex(l=>l.section===section);if(i!==-1){selectLesson(i);window.scrollTo({top:0,behavior:'smooth'})}}
function showToast(t){el.toast.textContent=t;el.toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.classList.remove('show'),2400)}
el.mobileMenu.addEventListener('click',toggleSidebar);el.sidebarDim.addEventListener('click',closeSidebar);
el.search.addEventListener('input',renderNav);
el.play.addEventListener('click',play);el.prev.addEventListener('click',()=>step(-1));el.next.addEventListener('click',()=>step(1));el.reset.addEventListener('click',()=>{pause();frame=0;draw()});
el.timeline.addEventListener('input',()=>{const chosen=Number(el.timeline.value);pause();frame=chosen;draw()});el.speed.addEventListener('change',()=>{if(timer){pause();play()}});
$('defaultBtn').addEventListener('click',()=>{pause();values=defaults(current());frame=0;renderParams();draw();showToast('Default settings restored')});
el.previousLesson.addEventListener('click',()=>{if(lessonIndex>0)selectLesson(lessonIndex-1)});el.nextLesson.addEventListener('click',()=>{if(lessonIndex<LABS.length-1)selectLesson(lessonIndex+1)});
$('exportPng').addEventListener('click',()=>{try{const link=document.createElement('a');link.download=`discrete-lab-${current().section.replace('.','-')}-frame-${frame}.png`;link.href=el.canvas.toDataURL('image/png');document.body.appendChild(link);link.click();link.remove();showToast('Image saved');}catch(e){showToast('Saving is not available in this browser')}});
window.addEventListener('hashchange',()=>{const i=hashIndex();if(i>=0 && i!==lessonIndex)selectLesson(i,false)});
window.addEventListener('resize',draw);
document.addEventListener('keydown',e=>{const target=e.target;if(target instanceof HTMLElement && (target.matches('input,textarea,select,button,[contenteditable=true]')))return;if(e.key==='/'){e.preventDefault();el.search.focus();if(innerWidth<=820)toggleSidebar();return;}if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}else if(e.code==='Space'){e.preventDefault();play()}else if(e.key==='Escape')closeSidebar()});
selectLesson(Math.max(0,hashIndex()),false);

