'use strict';
/* Original, self-contained interactive mathematical studios. No external libraries. */
const $ = id => document.getElementById(id);
const ROOT = 'https://discrete.openmathbooks.org/dmoi4/';
const LABS = [
 {id:'logic',ch:1,section:'Logic & proofs',title:'Logical Equivalence',tag:'Make or break an argument',desc:'Compare two logical statements and determine whether they are equivalent.',icon:'⇔',color:'#92ead2',url:ROOT+'sec_logic-implications.html',duration:'Logic lab'},
 {id:'color',ch:2,section:'Graph theory',title:'Graph Coloring',tag:'Solve, edit, and challenge a graph',desc:'Find a proper coloring and determine the chromatic number of a graph.',icon:'⬡',color:'#ebae5e',url:ROOT+'sec_coloring.html',duration:'Graph editing'},
 {id:'euler',ch:2,section:'Graph theory',title:'Euler Trails',tag:'Can every edge be used exactly once?',desc:'Determine when a graph has a trail that uses every edge exactly once.',icon:'↝',color:'#9b8bdd',url:ROOT+'sec_gt-paths.html',duration:'Interactive puzzle'},
 {id:'paths',ch:3,section:'Counting',title:'Lattice Paths',tag:'Design obstacles, count possibilities',desc:'Count paths on a rectangular grid with blocked cells.',icon:'▦',color:'#92ead2',url:ROOT+'sec_counting-combperm.html',duration:'Dynamic programming'},
 {id:'hanoi',ch:4,section:'Sequences',title:'Towers of Hanoi',tag:'You play. The solver teaches.',desc:'Move disks between pegs subject to the size constraint, using as few moves as possible.',icon:'≋',color:'#ebae5e',url:ROOT+'sec_seq-exponential.html',duration:'Optimal search'},
 {id:'functions',ch:5,section:'Discrete structures',title:'Function Composition',tag:'Rewire two functions and follow composition',desc:'Study the maps f and g, their composition, and the properties of the resulting functions.',icon:'⇢',color:'#9b8bdd',url:ROOT+'sec_structures-functions.html',duration:'Mapping laboratory'},
 {id:'euclid',ch:6,section:'Additional topics',title:'Euclidean Algorithm',tag:'An algorithm you can see',desc:'Compute greatest common divisors using square tilings and successive remainders.',icon:'▤',color:'#92ead2',url:ROOT+'sec_addtops-numbth.html',duration:'Number theory'}
];
const CH = {1:'Logic and Proofs',2:'Graph Theory',3:'Counting',4:'Sequences',5:'Discrete Structures Revisited',6:'Additional Topics'};
const SVGNS='http://www.w3.org/2000/svg';
const COLORS=['#efb76b','#76d2b9','#a597ec','#ef8782','#7dacf2'];
let active='home', S={}, ticker=null, notice='';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choose=a=>a[Math.floor(Math.random()*a.length)];
const btn=(id,text,kind='')=>'<button class="btn '+kind+'" data-act="'+id+'">'+text+'</button>';
const chip=(title,val)=>'<div class="metric"><small>'+title+'</small><strong>'+val+'</strong></div>';
const info=(title,body,key)=>'<div class="small-head">EXPLANATION</div><h3>'+title+'</h3><p>'+body+'</p><div class="keyidea"><p>'+key+'</p></div>';
const svg=(x)=>'<svg viewBox="0 0 760 470" role="img" aria-label="Interactive '+esc(LABS.find(a=>a.id===active).title)+' visualization">'+x+'</svg>';
const ln=(x1,y1,x2,y2,col='#50647e',width=2,dash='')=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+width+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
const circle=(x,y,r,fill,stroke='none',sw=1)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
const txt=(x,y,str,size=15,fill='#c5d5e1',weight=600,anchor='middle')=>'<text x="'+x+'" y="'+y+'" font-family="Inter,Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+'" fill="'+fill+'" text-anchor="'+anchor+'">'+esc(str)+'</text>';
const view=(stage,controls,insight,foot='')=>'<section class="studio"><div class="stage" id="stage">'+stage+'</div><div class="studio-controls"><div class="control-pane" id="controls">'+controls+'</div><aside class="insight-pane" id="insight">'+insight+'</aside></div>'+ (foot?'<div class="detail-panel">'+foot+'</div>':'')+'</section>';
function stop(){if(ticker!==null){clearInterval(ticker);ticker=null;}}
function mode(id){stop();active=id;notice='';S={}; if(id!=='home'){const f=INIT[id];if(f) f();}render();}
function route(){const id=location.hash.slice(1).split('?')[0];mode(LABS.some(l=>l.id===id)?id:'home');}
function navigate(id){location.hash=id==='home'?'home':id; if(location.hash==='#'+id) route();}
function makeNav(){const n=$('navigation');let html='<a href="#home" class="navitem '+(active==='home'?'active':'')+'"><span class="navicon">⌂</span> Topics <span class="count">07</span></a>';let prev=0;for(const l of LABS){if(l.ch!==prev){prev=l.ch;html+='<div class="side-heading">'+('0'+l.ch)+' / '+CH[l.ch]+'</div>';}html+='<a class="navitem '+(active===l.id?'active':'')+'" href="#'+l.id+'"><span class="navicon">'+l.icon+'</span> '+l.title+'</a>';} n.innerHTML=html;}
function art(l){const lines={'logic':'<path d="M180 110H300M300 110L350 75M300 110L350 145M350 75H510M350 145H510"/>','color':'<path d="M170 120L295 55L450 105L525 47M295 55L330 190L170 120M330 190L450 105L525 47M450 105L560 184L330 190"/>','euler':'<path d="M170 120L260 54L420 53L535 132L430 190L270 196L170 120M260 54L270 196M420 53L430 190"/>','paths':'<path d="M215 40V210M275 40V210M335 40V210M395 40V210M455 40V210M515 40V210M205 50H525M205 90H525M205 130H525M205 170H525M205 210H525"/>','hanoi':'<path d="M155 200H605M250 70V200M380 70V200M510 70V200"/>','functions':'<path d="M210 125L350 55L500 125L350 195L210 125M210 125L500 125M350 55L350 195"/>','euclid':'<path d="M210 50H540V200H210ZM360 50V200M360 150H540M450 150V200"/>'};let circles='';if(l.id==='color'||l.id==='euler'||l.id==='functions'){for(const [x,y,i] of [[170,120,0],[295,55,1],[450,105,2],[330,190,3],[525,47,1],[560,184,2]])circles+=circle(x,y,11,COLORS[i]);}if(l.id==='paths') circles='<path d="M215 210H275V170H335V130H395V90H455V50H515" stroke="#89e4ba" stroke-width="8" fill="none" stroke-linecap="round"/>';if(l.id==='hanoi')circles='<rect x="218" y="167" width="65" height="21" rx="7" fill="#84e5bd"/><rect x="227" y="146" width="46" height="21" rx="7" fill="#9b8bdd"/><rect x="355" y="167" width="50" height="21" rx="7" fill="#efb76b"/>';if(l.id==='euclid')circles='<rect x="210" y="50" width="150" height="150" fill="#7de1b9" opacity=".33"/><rect x="360" y="50" width="150" height="100" fill="#bca6ff" opacity=".33"/><rect x="360" y="150" width="90" height="50" fill="#f2b36e" opacity=".42"/>';if(l.id==='logic')circles=txt(170,116,'p',26,'#89e4ba')+txt(520,82,'p → q',23,'#f2b36e')+txt(520,150,'¬q → ¬p',23,'#ae9aff');return '<svg viewBox="0 0 740 240" aria-hidden="true"><defs><radialGradient id="bg'+l.id+'"><stop stop-color="#27485a"/><stop offset="1" stop-color="#112037"/></radialGradient></defs><rect width="740" height="240" fill="url(#bg'+l.id+')"/><g fill="none" stroke="#627c96" stroke-width="3">'+lines[l.id]+'</g>'+circles+'</svg>';}
function home(){return '<div class="intro-head"><div class="eyebrow">Spring Hill College · MTH 322</div><h1>Discrete Mathematics</h1><p class="course-byline">Prepared by <strong>Priyojit Palit</strong></p></div><div class="section-heading"><h2>Topics</h2></div><div class="tiles">'+LABS.map(l=>'<a class="tile" href="#'+l.id+'"><div class="tile-art">'+art(l)+'</div><div class="tile-body"><div class="tile-index">CHAPTER '+l.ch+' · '+l.section.toUpperCase()+'</div><h3>'+l.title+'</h3><p>'+l.desc+'</p></div></a>').join('')+'</div>';}
const INIT={};const DRAW={};
function render(){makeNav();if(active==='home'){$('content').innerHTML=home();}else{const l=LABS.find(x=>x.id===active);$('content').innerHTML='<div class="crumb"><a href="#home">Topics</a> / '+esc(CH[l.ch])+' / '+esc(l.title)+'</div><div class="lesson-head"><div class="eyebrow">CHAPTER '+l.ch+' · '+esc(l.section)+'</div><h1>'+esc(l.title)+'</h1><p>'+esc(l.desc)+'</p></div><div id="workbench"></div><p class="about-link">Textbook section: <a href="'+l.url+'" target="_blank" rel="noopener">Discrete Mathematics: An Open Introduction ↗</a></p>';paint();}document.body.classList.remove('noscroll');$('sidebar').classList.remove('open');$('shade').classList.remove('show');}
function paint(){if(!DRAW[active])return;$('workbench').innerHTML=DRAW[active]();if(window.afterPaint)window.afterPaint();}
function act(name){if(ACTIONS[active]?.[name])ACTIONS[active][name]();}
const ACTIONS={};
document.addEventListener('click',e=>{let b=e.target.closest('[data-act]');if(b){act(b.dataset.act);return;}if(e.target.closest('#homeBtn'))navigate('home');if(e.target.closest('#mobileToggle')){const open=$('sidebar').classList.toggle('open');$('shade').classList.toggle('show',open);document.body.classList.toggle('noscroll',open);}if(e.target===$('shade')){$('sidebar').classList.remove('open');$('shade').classList.remove('show');document.body.classList.remove('noscroll');}});
window.addEventListener('hashchange',route);
/* ── 01 · COUNTEREXAMPLE ENGINE ───────────────────────────────────── */
const EXPRESSIONS=[
 ['p → q',(p,q)=>!p||q],['q → p',(p,q)=>!q||p],['¬q → ¬p',(p,q)=>q||!p],['¬p → ¬q',(p,q)=>p||!q],
 ['¬(p ∧ q)',(p,q)=>!(p&&q)],['¬p ∨ ¬q',(p,q)=>!p||!q],['¬(p ∨ q)',(p,q)=>!(p||q)],['¬p ∧ ¬q',(p,q)=>!p&&!q],
 ['p ↔ q',(p,q)=>p===q],['(p → q) ∧ (q → p)',(p,q)=>(!p||q)&&(!q||p)],['p ∨ q',(p,q)=>p||q],['p ∧ q',(p,q)=>p&&q],
 ['p',(p,q)=>p],['q',(p,q)=>q],['¬p',(p,q)=>!p],['¬q',(p,q)=>!q],
 ['q ∧ p',(p,q)=>q&&p],['q ∨ p',(p,q)=>q||p],
 ['p ∧ (q ∨ ¬q)',(p,q)=>p&&(q||!q)],
 ['(p ∧ q) ∨ (p ∧ ¬q)',(p,q)=>(p&&q)||(p&&!q)],
 ['¬(p → q)',(p,q)=>!(!p||q)],['p ∧ ¬q',(p,q)=>p&&!q],
 ['(p ∧ q) ∨ (¬p ∧ ¬q)',(p,q)=>(p&&q)||(!p&&!q)],
 ['¬(p ↔ q)',(p,q)=>p!==q],
 ['(p ∨ q) ∧ (¬p ∨ ¬q)',(p,q)=>(p||q)&&(!p||!q)],
 ['(p → q) ∧ ¬q',(p,q)=>(!p||q)&&!q],
 ['(p ∨ q) ∧ (p ∨ ¬q)',(p,q)=>(p||q)&&(p||!q)]
];
INIT.logic=()=>{S={left:0,right:2,p:true,q:false};};
function logicRow(i){return [!!(i&2),!!(i&1)];}
function truth(x){return x?'<span style="color:#168b77">T</span>':'<span style="color:#d06b62">F</span>';}
DRAW.logic=()=>{let count=0;let rows='';for(let i=0;i<4;i++){const [p,q]=logicRow(i),a=EXPRESSIONS[S.left][1](p,q),b=EXPRESSIONS[S.right][1](p,q),bad=a!==b;count+=bad?1:0;rows+='<tr class="'+(S.p===p&&S.q===q?'focus ':'')+(bad?'counterexample':'')+'"><td><button data-act="row'+i+'">'+truth(p)+'</button></td><td><button data-act="row'+i+'">'+truth(q)+'</button></td><td>'+truth(a)+'</td><td>'+truth(b)+'</td><td>'+ (bad?'✕ Different':'✓ Same')+'</td></tr>';}
const v1=EXPRESSIONS[S.left][1](S.p,S.q),v2=EXPRESSIONS[S.right][1](S.p,S.q);const opts=i=>EXPRESSIONS.map((x,j)=>'<option value="'+j+'"'+(i===j?' selected':'')+'>'+esc(x[0])+'</option>').join('');let claim=count===0?'These two expressions are logically equivalent.':'Not equivalent: '+count+' of the 4 assignments give different results.';
const stage='<div class="logic-diagram"><div class="logic-box"><small>YOU SET THE INPUTS</small><strong>'+ (S.p?'T':'F')+' , '+(S.q?'T':'F')+'</strong><small>p , q</small></div><span class="logic-arrow">→</span><div class="logic-box"><small>FORMULA A</small><strong style="color:'+(v1?'#8ee4bc':'#ed998d')+'">'+(v1?'TRUE':'FALSE')+'</strong><small>'+esc(EXPRESSIONS[S.left][0])+'</small></div><div class="logic-box result"><small>FORMULA B</small><strong style="color:'+(v2?'#8ee4bc':'#ed998d')+'">'+(v2?'TRUE':'FALSE')+'</strong><small>'+esc(EXPRESSIONS[S.right][0])+'</small></div></div>';
const control='<div class="control-group"><div class="field"><label for="leftExpr">Expression A</label><select id="leftExpr" data-field="left">'+opts(S.left)+'</select></div><div class="field"><label for="rightExpr">Expression B</label><select id="rightExpr" data-field="right">'+opts(S.right)+'</select></div></div><div class="control-label">Choose a truth assignment</div><div class="logic-switches">'+btn('toggleP','p = '+(S.p?'TRUE':'FALSE'),S.p?'selected':'')+btn('toggleQ','q = '+(S.q?'TRUE':'FALSE'),S.q?'selected':'')+btn('counterexample','Find counterexample','primary')+btn('randomLogic','Try a new pair')+'</div><div class="table-scroll"><table class="truth-table"><thead><tr><th>p</th><th>q</th><th>A</th><th>B</th><th>Comparison</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="readout '+(count?'warning':'')+'"><strong>'+claim+'</strong><br>Highlighted row = your current assignment. Peach rows = counterexamples.</div>';
return view(stage,control,info(count?'One row can disprove it':'Every row agrees',count?'To disprove equivalence, it is enough to exhibit one assignment where the truth values differ. Click a peach row to examine it.':'These formulas agree on every possible truth assignment for p and q. Their logical equivalence is therefore proved.', 'A valid equivalence is universal; a single counterexample refutes it. The contrapositive p → q and ¬q → ¬p always agree.'),'<strong>Challenge:</strong> Compare an implication with its converse, then with its contrapositive. Which comparison survives all four rows?');};
ACTIONS.logic={toggleP(){S.p=!S.p;paint()},toggleQ(){S.q=!S.q;paint()},counterexample(){for(let i=0;i<4;i++){const [p,q]=logicRow(i);if(EXPRESSIONS[S.left][1](p,q)!==EXPRESSIONS[S.right][1](p,q)){S.p=p;S.q=q;paint();return;}}paint()},randomLogic(){S.left=Math.floor(Math.random()*EXPRESSIONS.length);do{S.right=Math.floor(Math.random()*EXPRESSIONS.length);}while(S.left===S.right);paint()}};
for(let i=0;i<4;i++)ACTIONS.logic['row'+i]=()=>{[S.p,S.q]=logicRow(i);paint();};
/* ── 02 · GRAPH COLORING STUDIO ───────────────────────────────────── */
const graphPresets={
 'Odd cycle':{n:5,e:[[0,1],[1,2],[2,3],[3,4],[4,0]]},
 'Wheel':{n:6,e:[[0,1],[1,2],[2,3],[3,4],[4,0],[5,0],[5,1],[5,2],[5,3],[5,4]]},
 'Complete K₄':{n:4,e:[[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]]},
 'Bipartite K₃,₃':{n:6,e:[[0,3],[0,4],[0,5],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]]},
 'Petersen':{n:10,e:[[0,1],[1,2],[2,3],[3,4],[4,0],[5,7],[7,9],[9,6],[6,8],[8,5],[0,5],[1,6],[2,7],[3,8],[4,9]]}
};
function positions(n,preset){if(preset==='Wheel'){return Array.from({length:n},(_,i)=>i===n-1?{x:380,y:235}:{x:380+175*Math.sin(2*Math.PI*i/(n-1)),y:235-175*Math.cos(2*Math.PI*i/(n-1))});}if(preset==='Bipartite K₃,₃'){return Array.from({length:n},(_,i)=>({x:i<3?245:515,y:125+(i%3)*110}));}if(preset==='Petersen'){return Array.from({length:n},(_,i)=>({x:380+(i<5?185:90)*Math.sin(2*Math.PI*(i%5)/5),y:235-(i<5?185:90)*Math.cos(2*Math.PI*(i%5)/5)}));}return Array.from({length:n},(_,i)=>({x:380+178*Math.sin(2*Math.PI*i/n),y:234-175*Math.cos(2*Math.PI*i/n)}));}
function colorInit(name){const g=graphPresets[name];S={preset:name,n:g.n,e:g.e.map(x=>x.slice()),pos:positions(g.n,name),colors:Array(g.n).fill(-1),k:3,edgeMode:false,selected:null,hint:null,solved:false};}
INIT.color=()=>colorInit('Odd cycle');
const edgesOf=(E,i)=>E.filter(e=>e.includes(i)).map(e=>e[0]===i?e[1]:e[0]);
function exactColor(n,edges,k,pins){const adj=Array.from({length:n},()=>[]);for(const [a,b] of edges){adj[a].push(b);adj[b].push(a);}const order=Array.from({length:n},(_,i)=>i).sort((a,b)=>adj[b].length-adj[a].length);const colors=Array(n).fill(-1);let visits=0;function dfs(i){visits++;if(i===n)return true;let v=order[i];let forbidden=new Set(adj[v].map(u=>colors[u]).filter(c=>c>=0));const candidates=Array.from({length:k},(_,j)=>j);if(pins&&pins[v]>=0)candidates.splice(0,candidates.length,pins[v]);for(const c of candidates){if(forbidden.has(c))continue;colors[v]=c;if(dfs(i+1))return true;colors[v]=-1;}return false;}const ok=dfs(0);return {ok,colors:ok?colors.slice():null,visits};}
function chromatic(){for(let k=1;k<=Math.min(S.n,10);k++){let a=exactColor(S.n,S.e,k);if(a.ok)return{k,solution:a.colors};}return{k:S.n,solution:Array.from({length:S.n},(_,i)=>i)}}
function conflicts(){return S.e.filter(([a,b])=>S.colors[a]>=0&&S.colors[a]===S.colors[b]);}
DRAW.color=()=>{let bad=conflicts(),comp=S.colors.every(x=>x>=0);let actual=chromatic(),m=S.e.length;
let lines=S.e.map(([a,b])=>{const A=S.pos[a],B=S.pos[b],isBad=bad.some(e=>(e[0]===a&&e[1]===b));return '<g data-link="'+a+'-'+b+'">'+ln(A.x,A.y,B.x,B.y,isBad?'#ed756f':'#59718a',isBad?6:3)+'<line class="svg-click" data-edge="'+a+'-'+b+'" x1="'+A.x+'" y1="'+A.y+'" x2="'+B.x+'" y2="'+B.y+'" stroke="transparent" stroke-width="17"/></g>';}).join('');
let nodes=S.pos.map((p,i)=>'<g class="svg-grab" data-node="'+i+'">'+circle(p.x,p.y,26,S.colors[i]<0?'#263d55':COLORS[S.colors[i]],S.selected===i?'#fcf5c4':S.hint===i?'#9cf6c4':'#a0b6bf',S.selected===i?5:3)+txt(p.x,p.y+6,String.fromCharCode(65+i),16,S.colors[i]===0?'#132037':'#f3f7fa',800)+'</g>').join('');
let msg=(bad.length?bad.length+' edge(s) have identically colored endpoints.':comp?'Valid coloring with '+(Math.max(...S.colors)+1)+' available colors.':'Select a color, then click vertices; drag any vertex to reposition it.');
let status=bad.length?'warning':comp?'':'notice';
const control='<div class="metrics">'+chip('Vertices',S.n)+chip('Edges',m)+chip('Chromatic number',actual.k)+chip('Conflicts',bad.length)+'</div><div class="control-group"><div class="field"><label>Graph preset</label><select data-field="preset">'+Object.keys(graphPresets).map(s=>'<option'+(s===S.preset?' selected':'')+'>'+s+'</option>').join('')+'</select></div><div class="field"><label>Colors allowed</label><select data-field="k">'+[2,3,4,5].map(k=>'<option value="'+k+'"'+(k===S.k?' selected':'')+'>'+k+' colors</option>').join('')+'</select></div></div><div class="buttons">'+btn('edgeMode',S.edgeMode?'✓ Edge editor ON':'＋ Add / remove edges',S.edgeMode?'selected':'')+btn('hintColor','Suggest a move')+btn('solveColor','Show optimal solution','primary')+btn('clearColor','Clear coloring')+btn('randomGraph','Random graph')+'</div><div class="readout '+status+'">'+esc(msg)+'<br><strong>'+(S.hint!==null?'Suggested vertex: '+String.fromCharCode(65+S.hint)+'. ':'')+(S.edgeMode?'Edge editor: click any two vertices to toggle their edge.':'Click a vertex to cycle its color. Right-click to erase.')+'</strong></div>';
return view(svg('<rect width="760" height="470" fill="#122037"/>'+lines+nodes+txt(24,34,S.edgeMode?'EDGE EDITOR: CHOOSE TWO VERTICES':'COLOR THE VERTICES · DRAG TO REARRANGE',11,'#8ba1b5',750,'start')),control,info(comp&&!bad.length?'Proper coloring found':'Color without conflicts',comp&&!bad.length?'Every edge joins vertices with different colors. Try reducing the allowed palette.':'The chromatic number is the smallest palette size that permits a proper coloring. This exact search computes it for the current small graph.','Try to color the odd cycle with only two colors. Now add a third color. Why does the final edge force a contradiction?'),'<strong>Controls:</strong> Drag nodes · Click to color · Right-click to uncolor · Toggle edge editor · Run the exact solver.');};
ACTIONS.color={edgeMode(){S.edgeMode=!S.edgeMode;S.selected=null;paint()},hintColor(){const solution=exactColor(S.n,S.e,S.k);if(!solution.ok){S.hint=null;paint();return;}let j=S.colors.findIndex((c,i)=>c!==solution.colors[i]);S.hint=j<0?null:j;paint()},solveColor(){let best=chromatic();if(best.k>S.k){S.hint=null;S.k=best.k;}S.colors=best.solution.slice();S.hint=null;S.solved=true;paint()},clearColor(){S.colors.fill(-1);S.hint=null;paint()},randomGraph(){let n=5+Math.floor(Math.random()*4);S={preset:'Random',n,e:[],pos:positions(n),colors:Array(n).fill(-1),k:3,edgeMode:false,selected:null,hint:null};for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(Math.random()<.38)S.e.push([i,j]);paint()}};
function colorPointer(){const stage=$('stage');let dragging=null,moved=false,start=null;
 function coord(ev){const img=stage.querySelector('svg'),b=img.getBoundingClientRect();return{x:(ev.clientX-b.left)*760/b.width,y:(ev.clientY-b.top)*470/b.height};}
 stage.onpointerdown=e=>{const n=e.target.closest('[data-node]');if(!n)return;dragging=Number(n.dataset.node);start=coord(e);moved=false;stage.querySelector('svg').setPointerCapture?.(e.pointerId);};
 stage.onpointermove=e=>{if(dragging===null)return;const p=coord(e);if(Math.hypot(p.x-start.x,p.y-start.y)>5)moved=true;if(!moved)return;
  S.pos[dragging]={x:clamp(p.x,35,725),y:clamp(p.y,45,440)};
  const g=stage.querySelector('g[data-node="'+dragging+'"]');g.querySelector('circle').setAttribute('cx',S.pos[dragging].x);g.querySelector('circle').setAttribute('cy',S.pos[dragging].y);g.querySelector('text').setAttribute('x',S.pos[dragging].x);g.querySelector('text').setAttribute('y',S.pos[dragging].y+6);
  stage.querySelectorAll('g[data-link]').forEach(link=>{let [a,b]=link.dataset.link.split('-').map(Number);link.querySelectorAll('line').forEach(line=>{line.setAttribute('x1',S.pos[a].x);line.setAttribute('y1',S.pos[a].y);line.setAttribute('x2',S.pos[b].x);line.setAttribute('y2',S.pos[b].y);});});
 };
 stage.onpointerup=e=>{if(dragging===null)return;const id=dragging;dragging=null;if(moved){S.hint=null;paint();return;}
 if(S.edgeMode){if(S.selected===null)S.selected=id;else if(S.selected!==id){const a=Math.min(S.selected,id),b=Math.max(S.selected,id),j=S.e.findIndex(edge=>edge[0]===a&&edge[1]===b);if(j>=0)S.e.splice(j,1);else S.e.push([a,b]);S.selected=null;S.colors.fill(-1);}else S.selected=null;}
 else{S.colors[id]=(S.colors[id]+2)%(S.k+1)-1;}S.hint=null;paint();};
 stage.oncontextmenu=e=>{const n=e.target.closest('[data-node]');if(n){e.preventDefault();S.colors[Number(n.dataset.node)]=-1;paint();}};
}
/* ── 03 · EULER TRAIL CHALLENGE ────────────────────────────────────── */
const eulerPresets={
 'Two linked cycles':{n:6,e:[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[2,3]],start:2},
 'Figure-eight circuit':{n:5,e:[[0,1],[1,2],[2,0],[0,3],[3,4],[4,0]],start:0},
 'Four odd vertices':{n:6,e:[[0,1],[1,2],[2,3],[3,0],[0,4],[2,5]],start:0},
 'One open trail':{n:5,e:[[0,1],[1,2],[2,0],[0,3],[3,4]],start:0}
};
function eulerInit(key){const g=eulerPresets[key],P=positions(g.n);S={preset:key,n:g.n,e:g.e.map(a=>a.slice()),pos:P,used:[],route:[g.start],start:g.start,hint:null,autoplay:false};stop();}
INIT.euler=()=>eulerInit('Two linked cycles');
function eulerDegrees(){let d=Array(S.n).fill(0);for(const [a,b] of S.e){d[a]++;d[b]++;}return d;}
function eulerSolution(start,used){const taken=new Set(used),E=S.e;function dfs(u){if(taken.size===E.length)return [];for(let i=0;i<E.length;i++){if(taken.has(i))continue;let [a,b]=E[i];if(u!==a&&u!==b)continue;taken.add(i);let path=dfs(u===a?b:a);if(path!==null)return[i,...path];taken.delete(i);}return null;}return dfs(start);}
function eulerPlayEdge(i){if(S.used.includes(i))return;const [a,b]=S.e[i],cur=S.route[S.route.length-1];if(cur!==a&&cur!==b)return;S.used.push(i);S.route.push(cur===a?b:a);S.hint=null;paint();}
DRAW.euler=()=>{const deg=eulerDegrees(),odd=deg.map((d,i)=>d%2?i:-1).filter(i=>i>=0),possible=odd.length===0||odd.length===2,current=S.route[S.route.length-1],remaining=S.e.length-S.used.length,trail=eulerSolution(current,S.used),fail=remaining>0&&trail===null;
let lines=S.e.map(([a,b],i)=>{let A=S.pos[a],B=S.pos[b],done=S.used.includes(i),ix=S.used.indexOf(i);let col=done?'#3e5268':i===S.hint?'#91f1c5':'#8196b2';return '<g>'+ln(A.x,A.y,B.x,B.y,col,done?3:i===S.hint?7:4,done?'7 8':'')+'<line class="svg-click" data-euleredge="'+i+'" x1="'+A.x+'" x2="'+B.x+'" y1="'+A.y+'" y2="'+B.y+'" stroke="transparent" stroke-width="22"/>'+(done?txt((A.x+B.x)/2,(A.y+B.y)/2-8,ix+1,12,'#80a7a7'): '')+'</g>';}).join('');
let ns=S.pos.map((p,i)=>'<g class="svg-click" data-eulernode="'+i+'">'+circle(p.x,p.y,26,i===current?'#6dddb5':'#264057',odd.includes(i)?'#f4a17c':'#92a9bd',odd.includes(i)?5:3)+txt(p.x,p.y+5,String.fromCharCode(65+i),16,i===current?'#113e36':'#e9f4f7',800)+txt(p.x,p.y+45,'deg '+deg[i],12,odd.includes(i)?'#f0a38b':'#8ba2b4')+'</g>').join('');
let status=remaining===0?'Complete! You traversed every edge exactly once.':!possible?'Four odd vertices: no Euler trail exists on this graph.':fail?'You are stuck: no full continuation is possible. Undo and choose a different edge.':'Click a remaining edge adjacent to '+String.fromCharCode(65+current)+'; try not to trap yourself.';
let controls='<div class="metrics">'+chip('Edges left',remaining)+chip('Odd-degree vertices',odd.length)+chip('Route length',S.used.length)+chip('Trail possible',possible?'Yes':'No')+'</div><div class="control-group"><div class="field"><label>Choose graph</label><select data-field="preset">'+Object.keys(eulerPresets).map(k=>'<option'+(k===S.preset?' selected':'')+'>'+k+'</option>').join('')+'</select></div></div><div class="buttons">'+btn('eulerHint','Find safe next edge')+btn('eulerStep','Play one safe edge','primary')+btn('eulerAuto',S.autoplay?'■ Stop solver':'▶ Auto-solve')+btn('eulerUndo','↶ Undo')+btn('eulerReset','Restart')+'</div><div class="readout '+(fail||!possible?'warning':remaining===0?'':'notice')+'">'+esc(status)+'<br><strong>Path:</strong> '+S.route.map(i=>String.fromCharCode(65+i)).join(' → ')+'</div><p class="helper">Click a vertex before the first move to change the starting point. Green = current vertex; coral outline = odd degree. A highlighted edge is a suggested safe move.</p>';
return view(svg('<rect width="760" height="470" fill="#122037"/>'+lines+ns+txt(24,34,'CLICK EDGES TO TRACE ONE CONTINUOUS WALK',11,'#8ba1b5',750,'start')),controls,info(possible?'The parity test is passed':'Parity makes it impossible',possible?'A connected graph has an Euler trail precisely when it has zero or two vertices of odd degree. But a careless early bridge crossing can still trap your chosen route.':'With four odd vertices, no walk can use every edge exactly once. Every internal visit pairs one arrival with one departure.','Try taking the bridge first on “Two linked cycles.” Then undo and explore the cycle on your starting side before crossing.'),'<strong>Mathematical test:</strong> Every non-isolated vertex must belong to one connected component, with exactly 0 or 2 odd-degree vertices. All provided graphs satisfy the connectivity condition.');};
ACTIONS.euler={eulerHint(){const route=eulerSolution(S.route.at(-1),S.used);S.hint=route?.[0]??null;paint()},eulerStep(){let r=eulerSolution(S.route.at(-1),S.used);if(r?.length)eulerPlayEdge(r[0]);},eulerAuto(){if(ticker!==null){stop();S.autoplay=false;paint();return;}S.autoplay=true;paint();ticker=setInterval(()=>{const r=eulerSolution(S.route.at(-1),S.used);if(!r?.length){stop();S.autoplay=false;paint();return;}eulerPlayEdge(r[0]);},500)},eulerUndo(){stop();S.autoplay=false;if(S.used.length){S.used.pop();S.route.pop();}S.hint=null;paint()},eulerReset(){eulerInit(S.preset);paint()}};
function eulerPointer(){const stage=$('stage');stage.onclick=e=>{let edge=e.target.closest('[data-euleredge]');if(edge){eulerPlayEdge(Number(edge.dataset.euleredge));return;}let node=e.target.closest('[data-eulernode]');if(node&&S.used.length===0){S.start=Number(node.dataset.eulernode);S.route=[S.start];S.hint=null;S.trailChecked=false;S.trailPrediction=null;paint();}};}
/* ── 04 · LATTICE PATH WORKSHOP ───────────────────────────────────── */
INIT.paths=()=>{S={w:6,h:5,blocked:new Set(['2,2','3,2']),reveal:0,path:[[0,0]],mode:'obstacle'};};
const pathKey=(x,y)=>x+','+y;
function pathsDP(){const d=Array.from({length:S.h+1},()=>Array(S.w+1).fill(0));for(let y=0;y<=S.h;y++)for(let x=0;x<=S.w;x++){if(S.blocked.has(pathKey(x,y)))continue;d[y][x]=(x===0&&y===0)?1:(x>0?d[y][x-1]:0)+(y>0?d[y-1][x]:0);}return d;}
function binom(n,k){let r=1;for(let i=1;i<=k;i++)r=r*(n-i+1)/i;return Math.round(r);}
DRAW.paths=()=>{const cell=Math.min(67,Math.floor(365/Math.max(S.w,S.h))),offX=380-(S.w+1)*cell/2,offY=235-(S.h+1)*cell/2,dp=pathsDP(),total=(S.w+1)*(S.h+1),all=dp[S.h][S.w],baseline=binom(S.w+S.h,S.w),pathDone=S.path.at(-1)?.[0]===S.w&&S.path.at(-1)?.[1]===S.h;
let rects='',marks='';for(let y=0;y<=S.h;y++)for(let x=0;x<=S.w;x++){const X=offX+x*cell,Y=offY+y*cell,i=y*(S.w+1)+x,blocked=S.blocked.has(pathKey(x,y)),inPath=S.path.some(a=>a[0]===x&&a[1]===y),show=i<S.reveal;rects+='<g class="svg-click" data-cell="'+x+','+y+'"><rect x="'+X+'" y="'+Y+'" width="'+(cell-3)+'" height="'+(cell-3)+'" rx="7" stroke="'+(inPath?'#a9f7d2':'#3d506a')+'" stroke-width="'+(inPath?3:1)+'" fill="'+(blocked?'#593b43':inPath?'#205c52':show?(dp[y][x]?'#1b4051':'#253348'):'#1b2d43')+'"/>'+(blocked?txt(X+cell/2,Y+cell/2+6,'×',23,'#f59e94'):show?txt(X+cell/2,Y+cell/2+5,dp[y][x],Math.min(19,cell*.32),dp[y][x]?'#b8f5df':'#667788',800):txt(X+cell/2,Y+cell/2+5,'·',23,'#7087a0'))+'</g>';}
let poly=S.path.map(([x,y])=>(offX+x*cell+cell/2)+','+(offY+y*cell+cell/2)).join(' ');if(S.path.length>1)marks='<polyline points="'+poly+'" fill="none" stroke="#ffd08a" stroke-width="4" stroke-dasharray="5 4" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>';
const control='<div class="metrics">'+chip('Valid routes',all)+chip('No obstacles',baseline)+chip('DP cells revealed',S.reveal+'/'+total)+'</div><div class="control-group"><div class="field"><label>Horizontal steps</label><select data-field="w">'+[3,4,5,6,7].map(i=>'<option'+(S.w===i?' selected':'')+'>'+i+'</option>').join('')+'</select></div><div class="field"><label>Vertical steps</label><select data-field="h">'+[3,4,5,6].map(i=>'<option'+(S.h===i?' selected':'')+'>'+i+'</option>').join('')+'</select></div></div><div class="buttons">'+btn('pathObstacle','⊞ Place obstacles',S.mode==='obstacle'?'selected':'')+btn('pathRoute','↗ Draw a path',S.mode==='route'?'selected':'')+btn('pathNext','Reveal next cell','primary')+btn('pathAll','Fill DP table')+btn('pathUndo','Undo path')+btn('pathReset','Clear board')+'</div><div class="readout '+(!all?'warning':'')+'">'+(S.mode==='obstacle'?'Click a cell to add or remove an obstacle (not start/end).':'Click the next square immediately right or below your current position to build a path.')+'<br><strong>'+ (pathDone?'You reached the target!':'Path progress: '+S.path.length+' of '+(S.w+S.h+1)+' cells')+'</strong></div>';
return view(svg('<rect width="760" height="470" fill="#122037"/>'+txt(23,34,'FROM TOP-LEFT TO BOTTOM-RIGHT · RIGHT AND DOWN ONLY',11,'#8ba1b5',800,'start')+rects+marks+txt(offX+cell/2,offY-11,'START',11,'#8ce8bf')+txt(offX+S.w*cell+cell/2,offY+(S.h+1)*cell+18,'FINISH',11,'#8ce8bf')),control,info('Counting becomes a computation','Every reachable cell is the sum of the counts immediately above and to its left. An obstacle contributes zero. You can change the board and recompute without listing paths one at a time.','Without obstacles, the number of routes from (0,0) to ('+S.w+','+S.h+') is C('+(S.w+S.h)+','+S.w+') = '+baseline+'. Can you design an obstacle pattern that leaves exactly one route?'),'<strong>Try:</strong> Set barriers to make the number of paths zero, one, or very large. Switch to “Draw a path” and construct a route yourself.');};
ACTIONS.paths={pathObstacle(){S.mode='obstacle';paint()},pathRoute(){S.mode='route';S.path=[[0,0]];paint()},pathNext(){S.reveal=clamp(S.reveal+1,0,(S.w+1)*(S.h+1));paint()},pathAll(){S.reveal=(S.w+1)*(S.h+1);paint()},pathUndo(){if(S.path.length>1)S.path.pop();paint()},pathReset(){S.blocked.clear();S.reveal=0;S.path=[[0,0]];paint()}};
function pathsPointer(){const stage=$('stage');stage.onclick=e=>{const el=e.target.closest('[data-cell]');if(!el)return;const [x,y]=el.dataset.cell.split(',').map(Number),k=pathKey(x,y);if(S.mode==='obstacle'){if(k==='0,0'||k===pathKey(S.w,S.h))return;if(S.blocked.has(k))S.blocked.delete(k);else S.blocked.add(k);S.reveal=(S.w+1)*(S.h+1);S.path=[[0,0]];}else{let [a,b]=S.path.at(-1);if((x===a+1&&y===b||x===a&&y===b+1)&&!S.blocked.has(k))S.path.push([x,y]);}paint();};}
/* ── 05 · TOWERS OF HANOI LAB ─────────────────────────────────────── */
function hanoiInit(n){stop();S={n,pegs:[Array.from({length:n},(_,i)=>n-i),[],[]],sel:null,history:[],hint:null,autoplay:false,feedback:'Move one disk at a time. A larger disk may never rest on a smaller one.'};}
INIT.hanoi=()=>hanoiInit(4);
function hanoiPositions(){const a=Array(S.n).fill(0);S.pegs.forEach((peg,i)=>peg.forEach(d=>a[d-1]=i));return a;}
function hanoiSolve(){const start=hanoiPositions(),goal=Array(S.n).fill(2),key=p=>p.join('');if(key(start)===key(goal))return[];let q=[[start,[]]],seen=new Set([key(start)]),head=0;while(head<q.length){const [p,moves]=q[head++],tops=[Infinity,Infinity,Infinity];for(let d=S.n;d>=1;d--)tops[p[d-1]]=d;for(let from=0;from<3;from++){const disk=tops[from];if(!isFinite(disk))continue;for(let to=0;to<3;to++){if(from===to||disk>tops[to])continue;const next=p.slice();next[disk-1]=to;const k=key(next);if(seen.has(k))continue;const path=moves.concat([[from,to]]);if(k===key(goal))return path;seen.add(k);q.push([next,path]);}}}return[];}
function hanoiMove(from,to){const a=S.pegs[from],b=S.pegs[to];if(!a.length){S.feedback='Peg '+(from+1)+' is empty.';paint();return false;}const disk=a.at(-1);if(b.length&&b.at(-1)<disk){S.feedback='Illegal move: a larger disk cannot go on top of a smaller one.';paint();return false;}a.pop();b.push(disk);S.history.push([from,to]);S.sel=null;S.hint=null;S.feedback='Moved disk '+disk+' from peg '+(from+1)+' to peg '+(to+1)+'.';paint();return true;}
DRAW.hanoi=()=>{const remaining=hanoiSolve(),won=remaining.length===0,minimum=2**S.n-1;
let visual='<rect width="760" height="470" fill="#122037"/><rect x="88" y="384" width="584" height="13" rx="5" fill="#54738c"/>';for(let p=0;p<3;p++){let x=190+190*p;visual+='<g class="svg-click" data-peg="'+p+'"><rect x="'+(x-79)+'" y="100" width="158" height="295" fill="transparent"/><rect x="'+(x-7)+'" y="119" width="14" height="264" rx="5" fill="'+(S.sel===p?'#fff3c2':'#55748e')+'"/>'+(S.sel===p?'<rect x="'+(x-78)+'" y="107" width="156" height="281" rx="16" fill="none" stroke="#b1efc7" stroke-width="3" stroke-dasharray="9 7"/>':'')+txt(x,431,'PEG '+(p+1),12,'#9fb3c4',750);for(let j=0;j<S.pegs[p].length;j++){let d=S.pegs[p][j],width=34+d*(133/S.n),y=365-j*39;visual+='<rect x="'+(x-width/2)+'" y="'+y+'" width="'+width+'" height="34" rx="8" fill="'+COLORS[(d-1)%COLORS.length]+'" stroke="#ffffff44" stroke-width="2"/>'+txt(x,y+22,d,14,'#152337',900);}visual+='</g>';}
if(S.hint)visual+=txt(380,76,'SHORTEST NEXT MOVE: PEG '+(S.hint[0]+1)+' → PEG '+(S.hint[1]+1),16,'#9deac7',850);else visual+=txt(380,68,won?'PUZZLE SOLVED':'CLICK A SOURCE PEG, THEN A DESTINATION PEG',13,'#9baebd',800);
let controls='<div class="metrics">'+chip('Moves made',S.history.length)+chip('From start',minimum)+chip('Best from here',remaining.length)+chip('Completion',won?'✓':'…')+'</div><div class="control-group"><div class="field"><label>Number of disks</label><select data-field="n">'+[3,4,5,6].map(i=>'<option'+(i===S.n?' selected':'')+'>'+i+'</option>').join('')+'</select></div></div><div class="buttons">'+btn('hanoiHint','Show best move')+btn('hanoiStep','Make best move','primary')+btn('hanoiAuto',S.autoplay?'■ Stop':'▶ Solve from here')+btn('hanoiUndo','↶ Undo')+btn('hanoiReset','Restart')+'</div><div class="readout '+(S.feedback.startsWith('Illegal')?'warning':'notice')+'">'+esc(won?'Solved! Your final configuration has every disk on peg 3.':S.feedback)+'</div><p class="helper">The solver finds a shortest sequence of legal moves from the current arrangement.</p>';
return view(svg(visual),controls,info(won?'A correct solution':'The recursive structure',won?'Congratulations. Restart with more disks to see why the number of necessary moves grows exponentially.':'To relocate n disks, first relocate n−1 disks, move the largest disk once, then relocate n−1 disks again. The optimal count from the initial position is 2ⁿ − 1.','The green hint uses breadth-first search over all legal configurations, so its “best from here” number remains correct even if you depart from the textbook solution.'),'<strong>Challenge:</strong> Solve four disks without the hint. Then try an unusual configuration and let the solver recover using the fewest possible moves.');};
ACTIONS.hanoi={hanoiHint(){S.hint=hanoiSolve()[0]??null;S.feedback=S.hint?'The highlighted suggestion is a shortest-route move.':'Already solved.';paint()},hanoiStep(){const m=hanoiSolve()[0];if(m)hanoiMove(...m)},hanoiAuto(){if(ticker!==null){stop();S.autoplay=false;paint();return;}S.autoplay=true;paint();ticker=setInterval(()=>{const m=hanoiSolve()[0];if(!m){stop();S.autoplay=false;paint();return;}hanoiMove(...m);},470)},hanoiUndo(){},hanoiReset(){hanoiInit(S.n);paint()}};
/* Undo must reverse the actual most recent physical disk. */
ACTIONS.hanoi.hanoiUndo=function(){stop();S.autoplay=false;const last=S.history.pop();if(last){const[from,to]=last;const disk=S.pegs[to].pop();S.pegs[from].push(disk);S.feedback='Last move undone.';}S.sel=null;S.hint=null;paint();};
function hanoiPointer(){const stage=$('stage');stage.onclick=e=>{const node=e.target.closest('[data-peg]');if(!node)return;const peg=Number(node.dataset.peg);if(S.sel===null){if(S.pegs[peg].length){S.sel=peg;S.feedback='Choose a destination peg.';}else S.feedback='Choose a nonempty source peg.';paint();}else{const src=S.sel;S.sel=null;if(src===peg){S.feedback='Selection canceled.';paint();}else hanoiMove(src,peg);}};}
/* ── 06 · FUNCTION COMPOSITION WORKBENCH ──────────────────────────── */
function functionInit(){S={n:4,m:4,c:4,f:[1,0,2,2],g:[2,0,3,1],mode:'f',selected:null,trace:0};}
INIT.functions=functionInit;
function properties(a,out){const image=new Set(a);return {injective:image.size===a.length,surjective:image.size===out,bijective:image.size===out&&image.size===a.length};}
function composed(){return S.f.map(i=>S.g[i]);}
function formalProps(p){return (p.injective?'injective':'not injective')+' · '+(p.surjective?'surjective':'not surjective')+' · '+(p.bijective?'bijective':'not bijective');}
DRAW.functions=()=>{let cmp=composed(),fp=properties(S.f,S.m),gp=properties(S.g,S.c),hp=properties(cmp,S.c);let centers=[[165,S.n],[383,S.m],[600,S.c]].map(([x,n])=>Array.from({length:n},(_,i)=>({x,y:100+(i+.5)*285/n})));let visuals='<defs><marker id="fnArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#8da6b6"/></marker><marker id="fnFocus" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#90edc5"/></marker></defs><rect width="760" height="470" fill="#122037"/>';
visuals+=txt(165,58,'A · DOMAIN',13,'#9faec2',800)+txt(383,58,'B · MIDDLE',13,'#9faec2',800)+txt(600,58,'C · CODOMAIN',13,'#9faec2',800);
for(const[x,arr] of [[165,centers[0]],[383,centers[1]],[600,centers[2]]])visuals+='<rect x="'+(x-42)+'" y="75" width="84" height="333" rx="30" stroke="#334b66" stroke-width="2" fill="#172a40"/>';
function arrow(p,q,col,thick){const dx=q.x-p.x,dy=q.y-p.y,dist=Math.hypot(dx,dy),ux=dx/dist,uy=dy/dist;visuals+='<path d="M '+(p.x+ux*20)+' '+(p.y+uy*20)+' L '+(q.x-ux*22)+' '+(q.y-uy*22)+'" fill="none" stroke="'+col+'" stroke-width="'+thick+'" stroke-opacity=".85" marker-end="url(#'+(col==='#90edc5'?'fnFocus':'fnArrow')+')"/>';}
for(let i=0;i<S.n;i++){let highlight=S.trace===i;if(S.mode==='composition'||S.mode==='f')arrow(centers[0][i],centers[1][S.f[i]],highlight?'#90edc5':'#536d81',highlight?5:2.5);}
for(let j=0;j<S.m;j++){let highlight=S.trace<S.n&&S.f[S.trace]===j;if(S.mode==='composition'||S.mode==='g')arrow(centers[1][j],centers[2][S.g[j]],highlight?'#90edc5':'#536d81',highlight?5:2.5);}
for(let i=0;i<S.n;i++)if(S.mode==='composition'&&i===S.trace){let p=centers[0][i],q=centers[2][cmp[i]];visuals+='<path d="M '+(p.x+12)+' '+(p.y+16)+' Q 380 455 '+(q.x-12)+' '+(q.y+16)+'" fill="none" stroke="#f4b66e" stroke-width="4" stroke-dasharray="9 8"/>';}
for(let i=0;i<3;i++)centers[i].forEach((p,j)=>{const focus=(i===0&&j===S.trace)||(i===1&&j===S.f[S.trace])||(i===2&&j===cmp[S.trace]);visuals+='<g class="svg-click" data-functionnode="'+i+','+j+'">'+circle(p.x,p.y,22,focus?'#267b6e':'#2b4760',S.selected&&S.selected.col===i&&S.selected.id===j?'#fbc889':'#a0b8c6',S.selected&&S.selected.col===i&&S.selected.id===j?5:2)+txt(p.x,p.y+5,(i===0?'a':i===1?'b':'c')+(j+1),13,'#f5fafa',800)+'</g>';});
let modeB='<div class="buttons">'+btn('functionsF','Edit f: A → B',S.mode==='f'?'selected':'')+btn('functionsG','Edit g: B → C',S.mode==='g'?'selected':'')+btn('functionsComp','Follow g ∘ f',S.mode==='composition'?'selected':'')+'</div>';
let dim='<div class="control-group"><div class="field"><label>|A| domain</label><select data-field="n">'+[3,4,5].map(n=>'<option'+(n===S.n?' selected':'')+'>'+n+'</option>').join('')+'</select></div><div class="field"><label>|B| middle</label><select data-field="m">'+[3,4,5].map(n=>'<option'+(n===S.m?' selected':'')+'>'+n+'</option>').join('')+'</select></div><div class="field"><label>|C| codomain</label><select data-field="c">'+[3,4,5].map(n=>'<option'+(n===S.c?' selected':'')+'>'+n+'</option>').join('')+'</select></div></div>';
let summary='<div class="metrics">'+chip('f injective?',fp.injective?'Yes':'No')+chip('f surjective?',fp.surjective?'Yes':'No')+chip('g ∘ f bijective?',hp.bijective?'Yes':'No')+'</div>';
let trace='<div class="control-label">TRACE AN INPUT FROM A THROUGH B TO C</div><div class="buttons">'+Array.from({length:S.n},(_,i)=>btn('trace'+i,'a'+(i+1),S.trace===i?'selected':'')).join('')+'</div><div class="readout notice"><strong>f(a'+(S.trace+1)+') = b'+(S.f[S.trace]+1)+'; g(b'+(S.f[S.trace]+1)+') = c'+(cmp[S.trace]+1)+'.</strong><br>So (g ∘ f)(a'+(S.trace+1)+') = c'+(cmp[S.trace]+1)+'.</div>';
let explain=S.mode==='composition'?'Follow the green pair of arrows from a selected aᵢ. The orange dashed path represents the composite map.':S.mode==='f'?'Click an A input, then click its desired B output. Every input must have exactly one arrow.':'Click a B input, then click its desired C output. You are editing g independently of f.';
let controls=summary+dim+modeB+'<div class="buttons">'+btn('functionShuffle','Randomize maps')+btn('functionIdentity','Make both identity','primary')+btn('functionReset','Reset')+'</div><div class="readout">'+explain+'</div>'+trace+'<p class="helper">f: '+formalProps(fp)+'<br>g: '+formalProps(gp)+'<br>g ∘ f: '+formalProps(hp)+'</p>';
return view(svg(visuals),controls,info('Composition of functions','A function assigns exactly one output to each input. Injective means no two inputs collide. Surjective means every codomain element is reached. Composition sends a through f, then through g.','Try making f injective but not surjective by choosing more outputs than inputs. Can g ∘ f be bijective while f is not injective? Use the live classifications to investigate.'),'<strong>Controls:</strong> In edit mode, click a source vertex and a destination vertex. In composition mode, select an a-input to trace the two-step mapping.');};
ACTIONS.functions={functionsF(){S.mode='f';S.selected=null;paint()},functionsG(){S.mode='g';S.selected=null;paint()},functionsComp(){S.mode='composition';S.selected=null;paint()},functionShuffle(){S.f=Array.from({length:S.n},()=>Math.floor(Math.random()*S.m));S.g=Array.from({length:S.m},()=>Math.floor(Math.random()*S.c));S.selected=null;paint()},functionIdentity(){S.n=4;S.m=4;S.c=4;S.f=[0,1,2,3];S.g=[0,1,2,3];S.mode='composition';S.selected=null;S.trace=0;paint()},functionReset(){functionInit();paint()}};
for(let i=0;i<5;i++)ACTIONS.functions['trace'+i]=()=>{S.trace=clamp(i,0,S.n-1);S.mode='composition';S.selected=null;paint();};
function functionsPointer(){const stage=$('stage');stage.onclick=e=>{const n=e.target.closest('[data-functionnode]');if(!n)return;const [col,id]=n.dataset.functionnode.split(',').map(Number);
if(S.mode==='composition'){if(col===0)S.trace=id;paint();return;}
const src=S.mode==='f'?0:1,dst=src+1;
if(col===src){S.selected={col,id};paint();return;}
if(col===dst&&S.selected?.col===src){const arr=S.mode==='f'?S.f:S.g;arr[S.selected.id]=id;S.trace=S.mode==='f'?S.selected.id:S.f.findIndex(v=>v===S.selected.id);if(S.trace<0)S.trace=0;S.selected=null;paint();return;}
};}
/* ── 07 · EUCLIDEAN TILING STUDIO ──────────────────────────────────── */
INIT.euclid=()=>{S={a:84,b:30,step:0};};
function tilings(a,b){let x=0,y=0,w=a,h=b,steps=[];while(w>0&&h>0){const horizontal=w>=h,side=Math.min(w,h),q=Math.floor(Math.max(w,h)/side),cells=[];for(let i=0;i<q;i++){let sx=x+(horizontal?i*side:0),sy=y+(horizontal?0:i*side);cells.push({x:sx,y:sy,size:side});}const r=Math.max(w,h)%side;steps.push({a:Math.max(w,h),b:side,q,r,cells});if(horizontal){x+=q*side;w-=q*side;}else{y+=q*side;h-=q*side;}}return steps;}
function egcd(a,b){let r0=a,r1=b,s0=1,s1=0,t0=0,t1=1;while(r1){let q=Math.floor(r0/r1);[r0,r1]=[r1,r0-q*r1];[s0,s1]=[s1,s0-q*s1];[t0,t1]=[t1,t0-q*t1];}return{g:r0,x:s0,y:t0};}
DRAW.euclid=()=>{const steps=tilings(S.a,S.b),full=egcd(S.a,S.b),scale=Math.min(575/S.a,340/S.b),X=380-S.a*scale/2,Y=229-S.b*scale/2;let boxes='<rect width="760" height="470" fill="#122037"/><rect x="'+X+'" y="'+Y+'" width="'+S.a*scale+'" height="'+S.b*scale+'" rx="4" fill="#1b3048" stroke="#e1e7e7" stroke-width="2"/>';let k=0;for(let i=0;i<S.step;i++){const st=steps[i];for(const box of st.cells){const col=COLORS[i%COLORS.length];boxes+='<rect x="'+(X+box.x*scale)+'" y="'+(Y+box.y*scale)+'" width="'+(box.size*scale)+'" height="'+(box.size*scale)+'" fill="'+col+'" fill-opacity=".75" stroke="#17283c" stroke-width="2"/>';if(box.size*scale>31)boxes+=txt(X+(box.x+box.size/2)*scale,Y+(box.y+box.size/2)*scale+5,box.size,Math.min(21,box.size*scale*.34),'#162637',800);}k+=st.cells.length;}boxes+=txt(X,Y-14,S.a+' units',14,'#abbdc9',750,'start')+txt(X+S.a*scale+15,Y+S.b*scale/2,S.b+' units',13,'#abbdc9',650,'start');
const formula=steps.map((r,i)=>'<div style="padding:7px 10px;border-bottom:1px solid #dfe9e6;background:'+(S.step===i+1?'#dcf5e9':'transparent')+';font:600 13px ui-monospace,monospace">'+r.a+' = '+r.q+' × '+r.b+' + '+r.r+'</div>').join('');
let last=S.step?steps[S.step-1]:null;let controls='<div class="metrics">'+chip('gcd',full.g)+chip('Squares placed',k)+chip('Divisions',S.step+'/'+steps.length)+'</div><div class="control-group"><div class="field"><label for="euclidA">Width</label><input type="number" min="12" max="144" id="euclidA" data-field="a" value="'+S.a+'"></div><div class="field"><label for="euclidB">Height</label><input type="number" min="12" max="144" id="euclidB" data-field="b" value="'+S.b+'"></div></div><div class="buttons">'+btn('euclidBack','← Previous')+btn('euclidNext','Tile next rectangle','primary')+btn('euclidAll','Tile completely')+btn('euclidSwap','Rotate rectangle')+btn('euclidRandom','Random dimensions')+'</div><div class="readout notice">'+(S.step===0?'Start with a '+S.a+' × '+S.b+' rectangle. How many largest possible squares fit?':S.step===steps.length?'Finished: the smallest final square has side length '+full.g+'.':'Placed '+last.q+' square(s) of side '+last.b+'. Remainder: '+last.r+'.')+'</div><div style="margin-top:16px" class="control-label">EUCLIDEAN DIVISION CHAIN</div>'+formula;
return view(svg(boxes),controls,info('The final square is the gcd','Each quotient is the number of same-size squares that fit along the longer side of the remaining rectangle. Each remainder is a new smaller rectangle. The tiling stops exactly when a remainder is zero.','Extended Euclid gives '+full.g+' = ('+full.x+') × '+S.a+' + ('+full.y+') × '+S.b+'. Change the rectangle and check this Bézout identity yourself.'),'<strong>Investigate:</strong> Compare 84 × 30 with 84 × 28. Why does the final square size change? What stays unchanged if you swap the rectangle dimensions?');};
ACTIONS.euclid={euclidBack(){S.step=Math.max(0,S.step-1);paint()},euclidNext(){S.step=Math.min(tilings(S.a,S.b).length,S.step+1);paint()},euclidAll(){S.step=tilings(S.a,S.b).length;paint()},euclidSwap(){[S.a,S.b]=[S.b,S.a];S.step=0;paint()},euclidRandom(){S.a=25+Math.floor(Math.random()*105);S.b=14+Math.floor(Math.random()*90);S.step=0;paint()}};
/* Shared interactions: live inputs are deliberately real parameters, not decoration. */
document.addEventListener('change',e=>{let f=e.target.dataset.field;if(!f)return;
 if(active==='logic'&&['left','right'].includes(f)){S[f]=Number(e.target.value);S.seen=new Set();S.checkAll=false;S.result='';}
 if(active==='color'&&f==='preset'){if(graphPresets[e.target.value])colorInit(e.target.value);else return;}
 if(active==='color'&&f==='k'){S.k=Number(e.target.value);S.colors=S.colors.map(c=>c>=S.k?-1:c);S.hint=null;}
 if(active==='euler'&&f==='preset')eulerInit(e.target.value);
 if(active==='paths'&&['w','h'].includes(f)){S[f]=Number(e.target.value);S.blocked=new Set();S.reveal=0;S.focus=0;S.path=[[0,0]];}
 if(active==='hanoi'&&f==='n'){hanoiInit(Number(e.target.value));S.showBest=false;}
 if(active==='functions'&&['n','m','c'].includes(f)){S[f]=Number(e.target.value);S.f=S.f.slice(0,S.n);while(S.f.length<S.n)S.f.push(0);S.f=S.f.map(x=>x%S.m);S.g=S.g.slice(0,S.m);while(S.g.length<S.m)S.g.push(0);S.g=S.g.map(x=>x%S.c);S.trace=clamp(S.trace,0,S.n-1);S.selected=null;S.identityError='';}
 if(active==='euclid'&&['a','b'].includes(f)){const value=Number(e.target.value);if(Number.isFinite(value))S[f]=clamp(Math.round(value),12,144);S.step=0;S.guess='';S.guessFeedback='';}
 requestAnimationFrame(paint);});
window.afterPaint=()=>{if(active==='color')colorPointer();if(active==='euler')eulerPointer();if(active==='paths')pathsPointer();if(active==='hanoi')hanoiPointer();if(active==='functions')functionsPointer();};
route();

/* Discrete Mathematics — reproducible problem generators.
   All generators are deterministic for (topic, difficulty, variant, seed).
   No server, account, external dependency or stored student data. */
(function (root) {
  'use strict';
  const LEVELS = ['easy', 'medium', 'hard'];
  const CATEGORIES = {logic:3,color:3,euler:3,paths:3,hanoi:3,functions:4,euclid:3};
  const LAB = ['logic','color','euler','paths','hanoi','functions','euclid'];
  const TITLE = {
    logic:'Determine whether the formulas are equivalent.',
    color:'Find a proper coloring with as few colors as possible.',
    euler:'Determine whether the graph has an Euler trail, then try to construct one.',
    paths:'Count the paths from START to FINISH, moving only right or down.',
    hanoi:'Move all disks to the right-hand peg using legal moves.',
    functions:'Classify f, g and their composition.',
    euclid:'Find the greatest common divisor of the two side lengths.'
  };
  function normalizeSeed(x){return (Number(x)>>>0)||0x6d2b79f5;}
  function rand(seed){let a=normalizeSeed(seed);return function(){a|=0;a=a+0x6d2b79f5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  function source(seed,topic,level,variant){let a=normalizeSeed(seed);for(const c of topic+'|'+level+'|'+variant)a=Math.imul(a^c.charCodeAt(0),16777619)>>>0;return rand(a);}
  function int(r,a,b){return a+Math.floor(r()*(b-a+1));}
  function shuffle(r,a){a=a.slice();for(let i=a.length-1;i>0;i--){let j=int(r,0,i);[a[i],a[j]]=[a[j],a[i]];}return a;}
  function pick(r,a){return a[int(r,0,a.length-1)];}
  function gcd(a,b){while(b)[a,b]=[b,a%b];return a;}
  function pathCount(w,h,blocked){let d=Array.from({length:h+1},()=>Array(w+1).fill(0));for(let y=0;y<=h;y++)for(let x=0;x<=w;x++){if(blocked.has(x+','+y))continue;d[y][x]=(x===0&&y===0)?1:(x?d[y][x-1]:0)+(y?d[y-1][x]:0);}return d[h][w];}
  function isConnected(n,E){if(!n)return false;const A=Array.from({length:n},()=>[]);for(const[a,b] of E){A[a].push(b);A[b].push(a);}const seen=new Set([0]),stack=[0];while(stack.length){let v=stack.pop();for(const u of A[v])if(!seen.has(u)){seen.add(u);stack.push(u);}}return seen.size===n;}
  function oddVertices(n,E){const d=Array(n).fill(0);for(const[a,b] of E){d[a]++;d[b]++;}return d.map((x,i)=>x%2?i:-1).filter(i=>i>=0);}
  function colorable(n,E,k){const adj=Array.from({length:n},()=>[]);for(const[a,b]of E){adj[a].push(b);adj[b].push(a);}const order=Array.from({length:n},(_,i)=>i).sort((a,b)=>adj[b].length-adj[a].length);let C=Array(n).fill(-1);function dfs(i){if(i===n)return true;const v=order[i],forbidden=new Set(adj[v].map(u=>C[u]).filter(z=>z>=0));for(let c=0;c<k;c++){if(forbidden.has(c))continue;C[v]=c;if(dfs(i+1))return true;C[v]=-1;}return false;}return dfs(0);}
  function permuteGraph(r,n,edges){const permutation=shuffle(r,Array.from({length:n},(_,i)=>i));return edges.map(([a,b])=>[permutation[a],permutation[b]].sort((a,b)=>a-b)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);}
  function generateColor(r,level,variant){const n=int(r,...({easy:[5,6],medium:[6,8],hard:[8,10]}[level]));const options={easy:[2,3,2],medium:[3,2,4],hard:[3,4,4]}[level];const k=options[variant%3],classes=Array.from({length:n},(_,i)=>i<k?i:int(r,0,k-1));let E=[];
    for(let i=0;i<k;i++)for(let j=i+1;j<k;j++)E.push([i,j]); // planted k-clique gives lower bound
    for(let i=k;i<n;i++){const choices=Array.from({length:i},(_,j)=>j).filter(j=>classes[j]!==classes[i]);const j=pick(r,choices);E.push([j,i]);}
    const density={easy:.20,medium:.35,hard:.50}[level];for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(classes[i]!==classes[j]&&!E.some(([a,b])=>a===i&&b===j)&&r()<density)E.push([i,j]);
    E=permuteGraph(r,n,E);if(!isConnected(n,E)||!colorable(n,E,k)||(k>1&&colorable(n,E,k-1)))throw Error('Invalid generated coloring graph');return {n,e:E,chromatic:k};}
  function generateEuler(r,level,variant){const n=int(r,...({easy:[5,6],medium:[6,8],hard:[8,10]}[level]));const kind=variant%3;let E=[],next=0;
    if(kind===0){ // circuit, an attached cycle makes the bridge-like choice interesting
      let cycleN=n-2;for(let i=0;i<cycleN;i++)E.push([i,(i+1)%cycleN]);E.push([0,cycleN],[cycleN,cycleN+1],[cycleN+1,0]);next=n;
    }else if(kind===1){ // trail, two odd vertices
      const linked=n>=7&&r()<.5;
      if(linked){const base=n-3;for(let i=0;i<base;i++)E.push([i,(i+1)%base]);E.push([0,base],[base,base+1],[base+1,base+2],[base+2,base]);}
      else {const base=n-1;for(let i=0;i<base;i++)E.push([i,(i+1)%base]);E.push([int(r,0,base-1),base]);}
    }else{ // impossibility: exactly four odd vertices
      const base=n-2;for(let i=0;i<base;i++)E.push([i,(i+1)%base]);let a=int(r,0,base-1),b=(a+int(r,1,base-1))%base;E.push([a,base],[b,base+1]);
    }
    E=permuteGraph(r,n,E);const odd=oddVertices(n,E);if(!isConnected(n,E)||odd.length!==[0,2,4][kind])throw Error('Invalid generated Euler graph');
    const start=odd.length===2?odd[0]:int(r,0,n-1);return {n,e:E,start,odd:odd.length,hasTrail:odd.length<=2};}
  function generatePaths(r,level,variant){const sizes={easy:[[3,4],[3,4]],medium:[[4,6],[4,5]],hard:[[6,7],[5,6]]}[level];let w=int(r,...sizes[0]),h=int(r,...sizes[1]);let B=new Set(),kind=variant%3;const key=(x,y)=>x+','+y;
    if(kind===0){ // no path: both entrances to the goal are blocked
      B.add(key(w-1,h));B.add(key(w,h-1));
      for(let y=0;y<=h;y++)for(let x=0;x<=w;x++)if((x||y)&&(x!==w||y!==h)&&!B.has(key(x,y))&&r()<.14)B.add(key(x,y));
    }else if(kind===1){ // unique path: all nodes outside a monotone corridor blocked
      let moves=shuffle(r,Array(w).fill('R').concat(Array(h).fill('D'))),x=0,y=0,P=new Set([key(0,0)]);for(const m of moves){if(m==='R')x++;else y++;P.add(key(x,y));}
      for(let yy=0;yy<=h;yy++)for(let xx=0;xx<=w;xx++)if(!P.has(key(xx,yy)))B.add(key(xx,yy));
    }else{ // multiple paths; rejection sample verified DP
      const rate={easy:.09,medium:.16,hard:.23}[level];for(let a=0;a<200;a++){B.clear();for(let y=0;y<=h;y++)for(let x=0;x<=w;x++)if((x||y)&&(x!==w||y!==h)&&r()<rate)B.add(key(x,y));if(pathCount(w,h,B)>1)break;}
    }
    const count=pathCount(w,h,B);if((kind===0&&count!==0)||(kind===1&&count!==1)||(kind===2&&count<=1))throw Error('Invalid generated lattice path count');return {w,h,blocked:[...B],count,category:kind};}
  function generateLogic(r,level,variant,expressions){
    const easy=new Set([10,11,12,13,14,15,16,17]);
    const options=[];
    for(let i=0;i<expressions.length;i++)for(let j=i+1;j<expressions.length;j++){
      let diff=0;
      for(const [p,q] of [[false,false],[false,true],[true,false],[true,true]])
        if(expressions[i][1](p,q)!==expressions[j][1](p,q))diff++;
      if(level==='easy'&&(!easy.has(i)||!easy.has(j)))continue;
      if(level==='medium'&&(i>=18||j>=18||(easy.has(i)&&easy.has(j))))continue;
      if(level==='hard'&&i<18&&j<18)continue;
      const kind=variant%3;
      if((kind===0&&diff===0)||(kind===1&&diff===1)||(kind===2&&diff>=2))options.push({left:i,right:j,diff});
    }
    if(!options.length)throw Error('No logical-expression pairs for '+level+' category '+(variant%3));
    return pick(r,options);
  }
  function functionFlags(a,out){const im=new Set(a);return{injective:im.size===a.length,surjective:im.size===out,bijective:im.size===out&&im.size===a.length};}
  function generateFunctions(r,level,variant){const type=variant%4;const n=type===0?(level==='easy'?3:4):type===1?(level==='hard'?5:4):(level==='easy'?3:level==='medium'?4:5);let m,c=n,f=[];
    if(type===0){m=Math.min(5,n+1);f=shuffle(r,Array.from({length:m},(_,i)=>i)).slice(0,n);}
    if(type===1){m=n-1;f=shuffle(r,Array.from({length:n},(_,i)=>i<m?i:int(r,0,m-1)));}
    if(type===2){m=n;f=shuffle(r,Array.from({length:n},(_,i)=>i));}
    if(type===3){m=n;f=Array.from({length:n},(_,i)=>i%(m-1));f=shuffle(r,f);}
    c=level==='hard'?int(r,3,5):m;
    let g=Array.from({length:m},()=>int(r,0,c-1));if(level==='easy')g=Array.from({length:m},(_,i)=>i%c);
    const flags=functionFlags(f,m);const expected=[{injective:true},{surjective:true},{bijective:true},{injective:false,surjective:false}][type];if(Object.keys(expected).some(k=>flags[k]!==expected[k]))throw Error('Invalid generated function type');return{n,m,c,f,g,category:type};}
  function generateEuclid(r,level,variant){
    const kind=variant%3;
    // Complexity is measured by the number of Euclidean divisions.
    const bands={easy:[[2,3],[2,3],[3,5]],medium:[[4,6],[4,6],[6,8]],hard:[[7,11],[6,11],[9,11]]};
    const [minSteps,maxSteps]=bands[level][kind];
    let candidates=[];
    for(let a=12;a<=144;a++)for(let b=12;b<=144;b++){
      if(a===b)continue;
      const g=gcd(a,b);
      if(kind===0&&g!==1)continue;
      if(kind===1&&g===1)continue;
      if(kind===2&&g!==1)continue;
      let x=a,y=b,steps=0;
      while(y){[x,y]=[y,x%y];steps++;}
      if(steps<minSteps||steps>maxSteps)continue;
      if(level==='easy'&&(a>70||b>70))continue;
      if(level==='medium'&&(a>120||b>120))continue;
      candidates.push({a,b,gcd:g,steps,category:kind});
    }
    if(!candidates.length)throw Error('No Euclidean pairs for '+level+' category '+kind);
    return pick(r,candidates);
  }
  function generateHanoi(r,level,variant){let n=level==='easy'?3:level==='medium'?4+variant%2:6;let pegs=[Array.from({length:n},(_,i)=>n-i),[],[]];
    if(level!=='easy'&&variant%3===2){const total=level==='medium'?int(r,5,8):int(r,10,20);let last=-1;for(let t=0;t<total;t++){let legal=[];for(let i=0;i<3;i++){if(!pegs[i].length)continue;for(let j=0;j<3;j++){if(i===j||(pegs[j].length&&pegs[j].at(-1)<pegs[i].at(-1)))continue;legal.push([i,j]);}}let options=legal.filter(([a,b])=>a!==last);if(!options.length)options=legal;const [from,to]=pick(r,options);pegs[to].push(pegs[from].pop());last=to;}
      if(pegs[2].length===n)pegs=[Array.from({length:n},(_,i)=>n-i),[],[]];
    }return{n,pegs};}
  function generate(topic,level,seed,variant,expressions){if(!LAB.includes(topic))throw Error('Unknown topic '+topic);if(!LEVELS.includes(level))throw Error('Unknown difficulty '+level);variant=Math.max(0,Number(variant)||0)%CATEGORIES[topic];const r=source(seed,topic,level,variant);switch(topic){case'color':return generateColor(r,level,variant);case'euler':return generateEuler(r,level,variant);case'paths':return generatePaths(r,level,variant);case'logic':return generateLogic(r,level,variant,expressions);case'functions':return generateFunctions(r,level,variant);case'euclid':return generateEuclid(r,level,variant);case'hanoi':return generateHanoi(r,level,variant);}}
  const api={generate,rand,source,gcd,pathCount,isConnected,oddVertices,colorable,functionFlags,LAB,LEVELS,CATEGORIES};root.DVLPractice=api;
  // The pure generator above can also be tested in Node without a browser or site runtime.
  if(typeof document==='undefined'||typeof DRAW==='undefined'||typeof LABS==='undefined')return;
  const current={},rounds={},originalDraw={};
  function newSeed(){try{const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);return bytes[0]||1;}catch(e){return (Date.now()^Math.floor(Math.random()*4294967296))>>>0;}}
  function makeTag(lab,cfg){return '#'+lab+'?level='+cfg.level+'&seed='+normalizeSeed(cfg.seed).toString(16).padStart(8,'0')+'&variant='+cfg.variant;}
  function parseTag(){const raw=location.hash.slice(1);let [lab,search='']=raw.split('?');if(!LAB.includes(lab))return null;const p=new URLSearchParams(search),level=p.get('level'),seedHex=p.get('seed'),variant=Number(p.get('variant'));if(!LEVELS.includes(level)||!/^[0-9a-f]{1,8}$/i.test(seedHex||'')||!Number.isInteger(variant)||variant<0||variant>100000)return null;return{lab,level,seed:parseInt(seedHex,16),variant:variant%CATEGORIES[lab]};}
  function apply(lab,cfg){if(active!==lab)return;stop();const instance=generate(lab,cfg.level,cfg.seed,cfg.variant,EXPRESSIONS);
    if(lab==='color'){
      graphPresets['Generated problem']={n:instance.n,e:instance.e.map(e=>e.slice())};
      colorInit('Generated problem');
      // The available palette must not disclose the verified minimum.
      S.k=cfg.level==='hard'?4:3;
      S.problemAnswer=instance.chromatic;
    } else if(lab==='euler'){
      eulerPresets['Generated problem']={n:instance.n,e:instance.e.map(e=>e.slice()),start:instance.start};
      eulerInit('Generated problem');
    } else if(lab==='paths'){
      INIT.paths();
      S.w=instance.w;S.h=instance.h;S.blocked=new Set(instance.blocked);
      S.reveal=0;S.focus=0;S.path=[[0,0]];S.mode='obstacle';
    } else if(lab==='logic'){
      INIT.logic();
      S.left=instance.left;S.right=instance.right;S.p=true;S.q=false;
      S.seen=new Set();S.checkAll=false;S.result='';
    } else if(lab==='functions'){
      INIT.functions();
      S.n=instance.n;S.m=instance.m;S.c=instance.c;S.f=instance.f.slice();S.g=instance.g.slice();
      S.mode='composition';S.selected=null;S.trace=0;S.identityError='';
    } else if(lab==='euclid'){
      INIT.euclid();
      S.a=instance.a;S.b=instance.b;S.step=0;S.guess='';S.guessFeedback='';
    } else if(lab==='hanoi'){
      hanoiInit(instance.n);
      S.pegs=instance.pegs.map(p=>p.slice());S.showBest=false;
      S.feedback='Move each disk to the right-hand peg. Only a smaller disk may be placed on a larger disk.';
    }
        current[lab]={...cfg};paint();
  }
  function start(lab,level,repeat){if(active!==lab)return;const base=current[lab];let cfg;if(repeat&&base)cfg={...base};else{const serial=(rounds[lab]??-1)+1;rounds[lab]=serial;cfg={level:level||base?.level||'medium',seed:newSeed(),variant:serial%CATEGORIES[lab]};}history.replaceState(null,'',location.pathname+location.search+makeTag(lab,cfg));apply(lab,cfg);}
  function restore(){const cfg=parseTag();if(cfg&&active===cfg.lab)apply(cfg.lab,cfg);else if(LAB.includes(active)){current[active]=null;paint();}}
  function toolbar(lab){const cfg=current[lab],level=cfg?.level||'medium',tag=cfg?normalizeSeed(cfg.seed).toString(16).toUpperCase().padStart(8,'0'):'Example';
    return '<div class="practice-toolbar" aria-label="Problem generation"><div class="practice-main"><label class="practice-field">Difficulty <select data-practice-level="'+lab+'" aria-label="Problem difficulty">'+LEVELS.map(l=>'<option value="'+l+'"'+(l===level?' selected':'')+'>'+l.charAt(0).toUpperCase()+l.slice(1)+'</option>').join('')+'</select></label><button type="button" class="btn primary" data-practice="new">New problem</button><button type="button" class="btn" data-practice="reset"'+(!cfg?' disabled':'')+'>Reset problem</button><button type="button" class="btn" data-practice="copy"'+(!cfg?' disabled':'')+'>Copy problem link</button><span class="practice-code" title="Reproducible problem identifier">'+tag+'</span></div><div class="practice-goal">'+TITLE[lab]+'</div><span class="practice-notice" id="practiceNotice" role="status" aria-live="polite"></span></div>';
  }
  for(const lab of LAB){originalDraw[lab]=DRAW[lab];DRAW[lab]=function(){let s=originalDraw[lab]();s=s.replace('<div class="studio-controls">',toolbar(lab)+'<div class="studio-controls">');if(lab==='color'&&current.color&&S.preset==='Generated problem'&&!S.solved){s=s.replace(/(<small>Chromatic number<\/small><strong>)[^<]+(<\/strong>)/,'$1?$2');}if(lab==='euclid'&&current.euclid&&S.step===0){s=s.replace(/(<small>gcd<\/small><strong>)[^<]+(<\/strong>)/,'$1?$2');}if(lab==='paths'&&current.paths&&S.reveal<(S.w+1)*(S.h+1)){s=s.replace(/(<small>Valid routes<\/small><strong>)[^<]+(<\/strong>)/,'$1?$2');}return s;};}
  const oldRandom={color:ACTIONS.color.randomGraph,logic:ACTIONS.logic.randomLogic,functions:ACTIONS.functions.functionShuffle,euclid:ACTIONS.euclid.euclidRandom};
  ACTIONS.color.randomGraph=()=>start('color');ACTIONS.logic.randomLogic=()=>start('logic');ACTIONS.functions.functionShuffle=()=>start('functions');ACTIONS.euclid.euclidRandom=()=>start('euclid');
  // Existing built-in presets remain available. Generated presets are inserted only once used.
  document.addEventListener('change',e=>{const lab=e.target.dataset.practiceLevel;if(lab&&LAB.includes(lab)){start(lab,e.target.value);}});
  document.addEventListener('click',e=>{const el=e.target.closest('[data-practice]');if(!el)return;const lab=active;switch(el.dataset.practice){case'new':start(lab);break;case'reset':start(lab,null,true);break;case'copy':{const cfg=current[lab];if(!cfg)return;const url=location.origin+location.pathname+location.search+makeTag(lab,cfg);const status=document.getElementById('practiceNotice');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(url).then(()=>{if(status)status.textContent='Link copied.';}).catch(()=>{if(status)status.textContent='Copy this URL: '+url;});}else if(status)status.textContent='Copy this URL: '+url;break;}}});
  window.addEventListener('hashchange',()=>restore());
  restore();paint();
})(typeof globalThis!=='undefined'?globalThis:this);

'use strict';
// Course activity improvements: retain the underlying graph, path and search algorithms.
(() => {
  const originalInit = Object.fromEntries(Object.entries(INIT));
  const originalDraw = Object.fromEntries(Object.entries(DRAW));
  const originalAfterPaint = window.afterPaint;
  const letter = n => String.fromCharCode(65+n);
  const safe = s => esc(String(s));
  const noticeBox = text => '<p class="math-note">'+text+'</p>';
  const replaceReadout = (html, text, warn=false) => html.replace(/<div class="readout(?: [^"]*)?">[\s\S]*?<\/div>/, '<div class="readout'+(warn?' warning':' notice')+'">'+text+'</div>');
  const replaceInsight = (html,title,body) => html.replace(/<aside class="insight-pane" id="insight">[\s\S]*?<\/aside>/,'<aside class="insight-pane" id="insight"><div class="small-head">MATHEMATICS</div><h3>'+title+'</h3><p>'+body+'</p></aside>');

  // Remember the unfinished work when navigating between topics.
  const saved = new Map();
  const previousMode = mode;
  mode = function(id){
    if(active!=='home' && LABS.some(l=>l.id===active)) saved.set(active,S);
    if(saved.has(id)){
      stop();active=id;S=saved.get(id);S.autoplay=false;render();
    }else previousMode(id);
  };

  // A truth-table row is revealed only after the assignment has been examined.
  INIT.logic = () => {originalInit.logic();S.seen = new Set();S.checkAll=false;};
  const oldLogicActions={...ACTIONS.logic};
  const revealRow=i=>{S.seen.add(i);[S.p,S.q]=logicRow(i);paint();};
  for(let i=0;i<4;i++) ACTIONS.logic['row'+i]=()=>revealRow(i);
  ACTIONS.logic.toggleP=()=>{S.p=!S.p;S.seen.add((S.p?2:0)+(S.q?1:0));paint();};
  ACTIONS.logic.toggleQ=()=>{S.q=!S.q;S.seen.add((S.p?2:0)+(S.q?1:0));paint();};
  ACTIONS.logic.counterexample=()=>{
    const i=[0,1,2,3].find(k=>{const [p,q]=logicRow(k);return EXPRESSIONS[S.left][1](p,q)!==EXPRESSIONS[S.right][1](p,q)});
    if(i!==undefined){S.seen.add(i);S.result='Counterexample found: assignment '+(i+1)+'.';revealRow(i)}
    else {S.result='No counterexample exists: the expressions agree on all four assignments.';S.checkAll=true;paint()}
  };
  ACTIONS.logic.randomLogic=()=>{S.left=Math.floor(Math.random()*EXPRESSIONS.length);do{S.right=Math.floor(Math.random()*EXPRESSIONS.length)}while(S.left===S.right);S.seen=new Set();S.checkAll=false;S.result='';paint();};
  ACTIONS.logic.checkLogic=()=>{S.checkAll=true;S.result='All four assignments have been checked.';paint();};
  ACTIONS.logic.addFormula=()=>{
    const op=document.getElementById('logicOp').value;
    const np=document.getElementById('logicNegP').checked,nq=document.getElementById('logicNegQ').checked,neg=document.getElementById('logicNegAll').checked;
    const connect={'∧':(a,b)=>a&&b,'∨':(a,b)=>a||b,'→':(a,b)=>!a||b,'↔':(a,b)=>a===b}[op];
    const label=(neg?'¬':'')+'('+(np?'¬':'')+'p '+op+' '+(nq?'¬':'')+'q)';
    let idx=EXPRESSIONS.findIndex(x=>x[0]===label);
    if(idx<0){EXPRESSIONS.push([label,(p,q)=>neg?!connect(np?!p:p,nq?!q:q):connect(np?!p:p,nq?!q:q)]);idx=EXPRESSIONS.length-1;}
    S.right=idx;S.checkAll=false;S.seen=new Set();S.result='';paint();
  };
  DRAW.logic=()=>{
    let html=originalDraw.logic();
    const trs=[0,1,2,3].map(i=>{
      const [p,q]=logicRow(i),seen=S.checkAll||S.seen.has(i),a=EXPRESSIONS[S.left][1](p,q),b=EXPRESSIONS[S.right][1](p,q);
      const focus=(S.p===p&&S.q===q)?' class="focus"':'';
      return '<tr'+focus+'><td><button data-act="row'+i+'">'+(p?'T':'F')+'</button></td><td><button data-act="row'+i+'">'+(q?'T':'F')+'</button></td><td>'+(seen?(a?'T':'F'):'?')+'</td><td>'+(seen?(b?'T':'F'):'?')+'</td><td>'+(seen?(a===b?'Equal':'Different'):'—')+'</td></tr>';
    }).join('');
    html=html.replace(/<tbody>[\s\S]*?<\/tbody>/,'<tbody>'+trs+'</tbody>');
    const revealed=S.checkAll||S.seen.size===4;
    const distinct=[0,1,2,3].filter(i=>{const [p,q]=logicRow(i);return EXPRESSIONS[S.left][1](p,q)!==EXPRESSIONS[S.right][1](p,q)});
    html=replaceReadout(html,revealed?('<strong>'+(distinct.length?'Not equivalent. '+distinct.length+' counterexample assignment(s).':'Equivalent: every row agrees.')+'</strong>'):'Test the four assignments. A single disagreement disproves equivalence. '+safe(S.result||''));
    html=replaceInsight(html,'Logical equivalence','Two propositions are equivalent precisely when they agree under every possible truth assignment. Examine each row before drawing a conclusion.');
    html=html.replace('<div class="table-scroll">','<div class="buttons">'+btn('checkLogic','Check all assignments')+'</div><div class="formula-builder"><strong>Construct a formula for B</strong><div class="formula-fields"><label><input type="checkbox" id="logicNegP"> ¬p</label><label>Operator <select id="logicOp"><option>∧</option><option>∨</option><option>→</option><option>↔</option></select></label><label><input type="checkbox" id="logicNegQ"> ¬q</label><label><input type="checkbox" id="logicNegAll"> Negate result</label></div>'+btn('addFormula','Use formula as B')+'</div><div class="table-scroll">');
    return html;
  };

  // Graph colors are deliberately chosen, not cycled; the solver respects pinned colors.
  INIT.color=()=>{originalInit.color();S.activeColor=0;S.undo=[];S.showMinimum=false;S.tip='';};
  const previousColorInit=colorInit;
  colorInit=function(name){previousColorInit(name);S.activeColor=0;S.undo=[];S.showMinimum=false;S.tip='';};
  const oldColor=originalDraw.color;
  const saveGraph=()=>{S.undo??=[];S.undo.push({e:S.e.map(x=>x.slice()),colors:S.colors.slice()});if(S.undo.length>30)S.undo.shift();};
  const prevColorActions={...ACTIONS.color};
  ACTIONS.color.chooseErase=()=>{S.activeColor=-1;paint()};
  ACTIONS.color.randomGraph=()=>{prevColorActions.randomGraph();S.activeColor=0;S.undo=[];S.showMinimum=false;S.tip='';paint();};
  for(let i=0;i<5;i++)ACTIONS.color['choose'+i]=()=>{S.activeColor=i;paint()};
  ACTIONS.color.undoGraph=()=>{const x=S.undo?.pop();if(x){S.e=x.e;S.colors=x.colors;S.tip='Last edit undone.';}S.hint=null;paint()};
  ACTIONS.color.clearColor=()=>{saveGraph();S.colors.fill(-1);S.hint=null;S.showMinimum=false;S.tip='';paint()};
  ACTIONS.color.solveColor=()=>{prevColorActions.solveColor();S.showMinimum=true;S.tip='This uses the minimum number of colors; smaller palettes have no valid coloring.';paint()};
  ACTIONS.color.proveColor=()=>{S.showMinimum=true;const c=chromatic();S.tip='A coloring with '+c.k+' colors exists. Exact search finds no proper coloring with '+(c.k-1)+' colors.';paint()};
  ACTIONS.color.hintColor=()=>{
    if(conflicts().length){S.tip='Two adjacent vertices share a color. Recolor or erase one of them before requesting a hint.';S.hint=null;paint();return;}
    const pinned=exactColor(S.n,S.e,S.k,S.colors);
    if(!pinned.ok){S.tip='No valid completion preserves these assignments with '+S.k+' colors. Undo a choice or allow more colors.';S.hint=null;paint();return;}
    let i=S.colors.findIndex(c=>c<0);
    if(i<0){S.tip='Your coloring is complete.';S.hint=null;}else{S.hint=i;S.tip='Vertex '+letter(i)+' can use color '+(pinned.colors[i]+1)+' while preserving your current assignments.';}
    paint();
  };
  DRAW.color=()=>{
    let html=oldColor();const c=chromatic(),val=S.showMinimum?String(c.k):'?';
    html=html.replace(/(<small>Chromatic number<\/small><strong>)\d+(<\/strong>)/,'$1'+val+'$2');
    const palette='<div class="palette-controls"><span>Vertex color</span>'+Array.from({length:S.k},(_,i)=>'<button data-act="choose'+i+'" class="palette-choice '+(S.activeColor===i?'chosen':'')+'" style="background:'+COLORS[i]+'" aria-label="Choose color '+(i+1)+'" title="Color '+(i+1)+'">'+(S.activeColor===i?'✓':'')+'</button>').join('')+'<button data-act="chooseErase" class="btn '+(S.activeColor===-1?'selected':'')+'">Erase</button></div>';
    html=html.replace('<div class="buttons">',palette+'<div class="buttons">'+btn('undoGraph','↶ Undo')+btn('proveColor','Check minimum colors'));
    html=replaceReadout(html,'<strong>'+(conflicts().length?conflicts().length+' adjacent pair(s) share a color.':S.colors.every(x=>x>=0)?'All vertices colored. Check that adjacent vertices differ.':'Choose a color, then select a vertex.')+'</strong> '+safe(S.tip||''),conflicts().length>0);
    html=replaceInsight(html,'Proper vertex coloring','A proper coloring gives different colors to endpoints of every edge. To prove the chromatic number is k, exhibit a coloring with k colors and show that no coloring with fewer than k exists.');
    return html;
  };
  colorPointer=function(){
    const stage=$('stage');let dragging=null,start=null,moved=false;
    const coord=ev=>{const box=stage.querySelector('svg').getBoundingClientRect();return {x:(ev.clientX-box.left)*760/box.width,y:(ev.clientY-box.top)*470/box.height};};
    stage.onpointerdown=e=>{const node=e.target.closest('[data-node]');if(!node)return;dragging=Number(node.dataset.node);start=coord(e);moved=false;stage.setPointerCapture?.(e.pointerId);};
    stage.onpointermove=e=>{if(dragging===null)return;const p=coord(e);if(Math.hypot(p.x-start.x,p.y-start.y)>6)moved=true;if(!moved)return;
      S.pos[dragging]={x:clamp(p.x,35,725),y:clamp(p.y,45,440)};
      const node=stage.querySelector('g[data-node="'+dragging+'"]');if(!node)return;
      const circ=node.querySelector('circle'),label=node.querySelector('text');circ.setAttribute('cx',S.pos[dragging].x);circ.setAttribute('cy',S.pos[dragging].y);label.setAttribute('x',S.pos[dragging].x);label.setAttribute('y',S.pos[dragging].y+6);
      stage.querySelectorAll('[data-link]').forEach(link=>{const [a,b]=link.dataset.link.split('-').map(Number);link.querySelectorAll('line').forEach(line=>{line.setAttribute('x1',S.pos[a].x);line.setAttribute('y1',S.pos[a].y);line.setAttribute('x2',S.pos[b].x);line.setAttribute('y2',S.pos[b].y);});});
    };
    stage.onpointerup=e=>{if(dragging===null)return;const id=dragging;dragging=null;if(moved){paint();return;}
      if(S.edgeMode){if(S.selected===null)S.selected=id;else if(S.selected!==id){saveGraph();const a=Math.min(id,S.selected),b=Math.max(id,S.selected),k=S.e.findIndex(x=>x[0]===a&&x[1]===b);if(k<0)S.e.push([a,b]);else S.e.splice(k,1);S.selected=null;S.colors.fill(-1);S.showMinimum=false;S.tip='Graph changed; previous coloring cleared.';}else S.selected=null;}
      else {saveGraph();S.colors[id]=S.activeColor;S.tip='';}S.hint=null;paint();};
    stage.oncontextmenu=e=>{const node=e.target.closest('[data-node]');if(node){e.preventDefault();saveGraph();S.colors[Number(node.dataset.node)]=-1;paint();}};
  };

  // Predict Euler-trail existence before revealing the answer.
  const oldEuler=originalDraw.euler;
  const originalEulerInit=eulerInit;
  eulerInit=function(name){
    originalEulerInit(name);
    S.trailChecked=false;
    S.trailPrediction=null;
  };
  const oddVertices=()=>eulerDegrees().map((d,i)=>d%2?i:-1).filter(i=>i>=0);
  const startValid=()=>{
    const odd=oddVertices(),first=S.route[0];
    return (odd.length===0||odd.length===2&&odd.includes(first)) &&
      eulerSolution(first,[])!==null;
  };
  ACTIONS.euler.trailYes=()=>{S.trailPrediction=true;S.trailChecked=true;paint();};
  ACTIONS.euler.trailNo=()=>{S.trailPrediction=false;S.trailChecked=true;paint();};
  DRAW.euler=()=>{
    let html=oldEuler();
    const odd=oddVertices(),remaining=S.e.length-S.used.length;
    const current=S.route.at(-1),answer=startValid(),continuation=eulerSolution(current,S.used);
    const revealed=S.trailChecked||remaining===0;
    const status=revealed?(answer?'Yes':'No'):'?';
    html=html.replace(/(<small>Trail possible<\/small><strong>)(?:Yes|No)(<\/strong>)/,'$1'+status+'$2');
    html=html.replace('Trail possible</small>','Trail from start</small>');
    let message;
    if(remaining===0)message='You traversed every edge exactly once.';
    else if(!S.trailChecked)message='Predict whether an Euler trail is possible from the selected starting vertex. Then try to construct one.';
    else if(S.trailPrediction===answer){
      if(!answer)message='Correct. '+(odd.length>2?'The graph has '+odd.length+' odd-degree vertices.':'An open trail must begin at an odd-degree vertex.');
      else if(!continuation)message='Correct that a trail exists, but your partial route cannot be finished. Undo a move.';
      else message='Correct. An Euler trail is possible from '+letter(S.route[0])+'.';
    } else message='Not quite. '+(odd.length>2?'A connected graph with more than two odd-degree vertices has no Euler trail.':odd.length===2&&!odd.includes(S.route[0])?'An open Euler trail must start at one of the two odd-degree vertices.':'Check whether all unused edges can be reached from this starting point.');
    const controls='<div class="euler-prediction"><strong>Euler trail from '+letter(S.route[0])+'?</strong> '+btn('trailYes','Yes',S.trailChecked&&S.trailPrediction===true?'selected':'')+btn('trailNo','No',S.trailChecked&&S.trailPrediction===false?'selected':'')+'</div>';
    html=html.replace('<div class="buttons">',controls+'<div class="buttons">');
    html=replaceReadout(html,safe(message)+'<br><strong>Route: '+S.route.map(letter).join(' → ')+'</strong>',S.trailChecked&&!answer);
    html=replaceInsight(html,'Euler trails','For a connected graph, an Euler circuit requires every vertex to have even degree. An open Euler trail requires exactly two odd-degree vertices, and must begin at one of them. The choice of starting point matters.');
    return html;
  };

  // The recurrence is constructed one cell at a time, rather than unveiling the answer.
  INIT.paths=()=>{originalInit.paths();S.focus=0;};
  const oldPaths=originalDraw.paths;
  const oldPathActions={...ACTIONS.paths};
  ACTIONS.paths.pathNext=()=>{S.reveal=clamp(S.reveal+1,0,(S.w+1)*(S.h+1));S.focus=Math.max(0,S.reveal-1);paint();};
  ACTIONS.paths.pathAll=()=>{S.reveal=(S.w+1)*(S.h+1);S.focus=S.reveal-1;paint()};
  ACTIONS.paths.pathReset=()=>{oldPathActions.pathReset();S.focus=0;};
  DRAW.paths=()=>{
    let html=oldPaths(),total=(S.w+1)*(S.h+1),finished=S.reveal>=total,dp=pathsDP(),x=S.focus%(S.w+1),y=Math.floor(S.focus/(S.w+1)),blocked=S.blocked.has(pathKey(x,y));
    html=html.replace(/(<small>Valid routes<\/small><strong>)\d+(<\/strong>)/,'$1'+(finished?dp[S.h][S.w]:'?')+'$2');
    html=html.replace(/(<small>No obstacles<\/small><strong>)\d+(<\/strong>)/,'$1'+(finished?binom(S.w+S.h,S.w):'?')+'$2');
    let a=x>0?dp[y][x-1]:0,b=y>0?dp[y-1][x]:0;
    const explanation=S.reveal===0?'Compute the number of routes to each cell, beginning at the start.':blocked?'The cell ('+x+','+y+') is blocked, so its count is 0.':x===0&&y===0?'Start cell (0,0): exactly one empty path arrives here.':'Cell ('+x+','+y+'): routes from the left ('+a+') + routes from above ('+b+') = '+dp[y][x]+'.';
    html=replaceInsight(html,'The recurrence','For an open cell, paths(x,y) = paths(x−1,y) + paths(x,y−1). Blocked cells contribute zero. '+safe(explanation));
    if(S.reveal>0){const cell=Math.min(67,Math.floor(365/Math.max(S.w,S.h))),offX=380-(S.w+1)*cell/2,offY=235-(S.h+1)*cell/2;
      let boxes='';for(const [cx,cy] of [[x-1,y],[x,y-1]])if(cx>=0&&cy>=0){const a=offX+cx*cell,b=offY+cy*cell;boxes+='<rect x="'+a+'" y="'+b+'" width="'+(cell-3)+'" height="'+(cell-3)+'" rx="7" fill="none" stroke="#fac76b" stroke-width="4" stroke-dasharray="6 3" pointer-events="none"/>';}const xx=offX+x*cell,yy=offY+y*cell;boxes+='<rect x="'+xx+'" y="'+yy+'" width="'+(cell-3)+'" height="'+(cell-3)+'" rx="7" fill="none" stroke="#baf7cd" stroke-width="4" pointer-events="none"/>';
      html=html.replace('</svg>','<g aria-hidden="true">'+boxes+'</g></svg>');
    }
    return html;
  };
  pathsPointer=function(){const stage=$('stage');stage.onclick=e=>{
    const target=e.target.closest('[data-cell]');if(!target)return;const [x,y]=target.dataset.cell.split(',').map(Number),k=pathKey(x,y);
    if(S.mode==='obstacle'){
      if(k==='0,0'||k===pathKey(S.w,S.h))return;
      if(S.blocked.has(k))S.blocked.delete(k);else S.blocked.add(k);
      S.reveal=0;S.focus=0;S.path=[[0,0]];
    }else{const [a,b]=S.path.at(-1);if(((x===a+1&&y===b)||(x===a&&y===b+1))&&!S.blocked.has(k))S.path.push([x,y]);}
    paint();
  };};

  // Hanoi: display the proof by recursive decomposition, not merely a move count.
  INIT.hanoi=()=>{originalInit.hanoi();S.showBest=false;};
  const oldHanoi=originalDraw.hanoi;
  const oldHanoiActions={...ACTIONS.hanoi};
  ACTIONS.hanoi.hanoiHint=()=>{S.showBest=true;oldHanoiActions.hanoiHint();};
  ACTIONS.hanoi.hanoiStep=()=>{S.showBest=true;oldHanoiActions.hanoiStep();};
  ACTIONS.hanoi.hanoiReset=()=>{oldHanoiActions.hanoiReset();S.showBest=false;paint();};
  DRAW.hanoi=()=>{
    let html=oldHanoi(),on=S.pegs.findIndex(peg=>peg.includes(S.n)),n=S.n,minimum=Math.pow(2,n)-1;
    html=html.replace(/(<small>Best from here<\/small><strong>)\d+(<\/strong>)/,'$1'+(S.showBest?hanoiSolve().length:'?')+'$2');
    const phase=on===0?'1 — Transfer the top '+(n-1)+' disks from peg 1 to peg 2.':on===2?'3 — Transfer the '+(n-1)+' smaller disks from peg 2 to peg 3.':'An intermediate configuration: return the largest disk to the correct target peg.';
    const panel='<div class="math-recursion"><strong>Recursive decomposition</strong><p>T('+n+') = 2T('+(n-1)+') + 1 = '+minimum+' moves (minimum from the starting state).</p><ol><li>Move '+(n-1)+' smaller disks to the auxiliary peg.</li><li>Move the largest disk to the destination peg.</li><li>Move '+(n-1)+' smaller disks onto it.</li></ol><p><strong>Current position of the largest disk:</strong> Peg '+(on+1)+'. '+phase+'</p></div>';
    return html.replace('</section>',panel+'</section>');
  };

  // Explicitly show collisions and missing outputs; never silently resize sets.
  const oldFn=originalDraw.functions;
  ACTIONS.functions.functionIdentity=()=>{
    if(S.n!==S.m||S.m!==S.c){S.identityError='Identity maps require equal cardinalities for A, B, and C. Change the set sizes to match.';paint();return;}
    S.f=Array.from({length:S.n},(_,i)=>i);S.g=Array.from({length:S.m},(_,i)=>i);S.mode='composition';S.selected=null;S.trace=0;S.identityError='';paint();
  };
  DRAW.functions=()=>{
    let html=oldFn(),cmp=composed();
    const diagnostics=(label,a,target)=>{const counts=Array.from({length:target},(_,j)=>a.filter(x=>x===j).length);
      const collisions=counts.flatMap((count,i)=>count>1?[(i+1)+' ('+count+' inputs)']:[]);
      const omissions=counts.flatMap((count,i)=>count===0?[i+1]:[]);
      return '<p><strong>'+label+':</strong> '+(collisions.length?'Collisions at outputs '+collisions.join(', '):'No collisions')+'; '+(omissions.length?'unreached outputs '+omissions.join(', '):'every output reached')+'.</p>';
    };
    let rings='';const ring=(column,index,color,dashed)=>{const n=[S.n,S.m,S.c][column],x=[165,383,600][column],y=100+(index+.5)*285/n;rings+='<circle cx="'+x+'" cy="'+y+'" r="29" fill="none" stroke="'+color+'" stroke-width="4" '+(dashed?'stroke-dasharray="5 5"':'')+' pointer-events="none"/>';};
    [[S.f,S.m,1],[S.g,S.c,2]].forEach(([arr,target,col])=>{for(let i=0;i<target;i++){const count=arr.filter(v=>v===i).length;if(count>1)ring(col,i,'#fac276',false);if(!count)ring(col,i,'#f18f91',true);}});
    html=html.replace('</svg>',rings+'</svg>');
    html=html.replace('</section>','<div class="mapping-diagnostics"><strong>Mapping properties</strong><div class="mapping-legend">Solid amber ring: multiple inputs. Dashed red ring: output not reached.</div>'+diagnostics('f',S.f,S.m)+diagnostics('g',S.g,S.c)+diagnostics('g ∘ f',cmp,S.c)+(S.identityError?'<p role="alert" class="form-error">'+safe(S.identityError)+'</p>':'')+'</div></section>');
    return html;
  };

  // Euclidean division: require a quotient prediction, reveal successive steps only.
  INIT.euclid=()=>{originalInit.euclid();S.guess='';S.guessFeedback='';};
  const oldEuclid=originalDraw.euclid;
  const advance=()=>{S.step=Math.min(tilings(S.a,S.b).length,S.step+1);S.guess='';S.guessFeedback='';paint();};
  ACTIONS.euclid.euclidNext=()=>{
    const steps=tilings(S.a,S.b);if(S.step>=steps.length)return;
    const value=document.getElementById('euclidGuess')?.value.trim()??'';
    if(value===''||!/^\d+$/.test(value)){S.guessFeedback='Enter an integer quotient before checking.';paint();return;}
    if(Number(value)!==steps[S.step].q){S.guessFeedback='Not yet. How many squares with side '+steps[S.step].b+' fit into length '+steps[S.step].a+'?';paint();return;}
    advance();
  };
  ACTIONS.euclid.euclidReveal=advance;
  const oldEuclidActions={...ACTIONS.euclid};
  ACTIONS.euclid.euclidBack=()=>{oldEuclidActions.euclidBack();S.guess='';S.guessFeedback='';};
  for(const key of ['euclidRandom','euclidSwap']){const previous=oldEuclidActions[key];ACTIONS.euclid[key]=()=>{previous();S.guess='';S.guessFeedback='';paint()};}
  ACTIONS.euclid.euclidAll=()=>{oldEuclidActions.euclidAll();S.guess='';S.guessFeedback='';};
  DRAW.euclid=()=>{
    let html=oldEuclid(),steps=tilings(S.a,S.b),finished=S.step>=steps.length;
    html=html.replace(/(<small>gcd<\/small><strong>)\d+(<\/strong>)/,'$1'+(finished?egcd(S.a,S.b).g:'?')+'$2');
    const first='<div style="margin-top:16px" class="control-label">EUCLIDEAN DIVISION CHAIN</div>';
    html=html.replace(/(<div style="margin-top:16px" class="control-label">EUCLIDEAN DIVISION CHAIN<\/div>)[\s\S]*?(?=<\/div><aside class="insight-pane")/,(all,head)=>head+steps.slice(0,S.step).map(r=>'<div class="division-line">'+r.a+' = '+r.q+' × '+r.b+' + '+r.r+'</div>').join(''));
    const prompt=finished?'<p class="math-note">The last nonzero remainder is the gcd. Bézout: '+S.a+'('+egcd(S.a,S.b).x+') + '+S.b+'('+egcd(S.a,S.b).y+') = '+egcd(S.a,S.b).g+'.</p>':'<div class="quotient-prompt"><label for="euclidGuess">Next quotient: '+steps[S.step].a+' ÷ '+steps[S.step].b+' = ?</label><input type="number" min="0" step="1" id="euclidGuess" value="'+safe(S.guess||'')+'" placeholder="Quotient">'+(S.guessFeedback?noticeBox(safe(S.guessFeedback)):'')+'</div>';
    html=html.replace('data-act="euclidNext"','data-act="euclidNext"');
    html=html.replace('Tile next rectangle','Check quotient');
    html=html.replace('<div class="buttons">'+btn('euclidBack','← Previous'),prompt+'<div class="buttons">'+btn('euclidReveal','Show next division')+btn('euclidBack','← Previous'));
    html=replaceInsight(html,'Euclidean division',finished?'The last nonzero remainder is the gcd. The extended Euclidean algorithm expresses it as a linear combination of the original side lengths.':'At each stage, divide the longer remaining side by the shorter. The quotient gives the number of complete squares; the remainder determines the next rectangle.');
    return html;
  };
  document.addEventListener('input',e=>{if(active==='euclid'&&e.target.id==='euclidGuess')S.guess=e.target.value;});

  // SVG keyboard support for students without a pointing device.
  window.afterPaint=()=>{
    originalAfterPaint?.();
    const stage=$('stage');if(!stage)return;
    stage.querySelectorAll('[data-node],[data-euleredge],[data-eulernode],[data-cell],[data-peg],[data-functionnode]').forEach(el=>{
      const node=el.dataset.node,edge=el.dataset.euleredge,peg=el.dataset.peg,cell=el.dataset.cell,fn=el.dataset.functionnode;
      el.setAttribute('role','button');el.setAttribute('tabindex','0');
      el.setAttribute('aria-label',node!==undefined?'Vertex '+letter(Number(node)):edge!==undefined?'Edge '+(Number(edge)+1):peg!==undefined?'Peg '+(Number(peg)+1):cell!==undefined?'Cell '+cell:fn!==undefined?'Mapping element '+fn:'Vertex '+letter(Number(el.dataset.eulernode)));
      el.addEventListener('keydown',ev=>{
        if(ev.key!=='Enter'&&ev.key!==' ')return;ev.preventDefault();
        if(active==='color'&&node!==undefined){const id=Number(node);if(S.edgeMode){if(S.selected===null)S.selected=id;else if(S.selected!==id){saveGraph();const a=Math.min(id,S.selected),b=Math.max(id,S.selected),i=S.e.findIndex(x=>x[0]===a&&x[1]===b);if(i<0)S.e.push([a,b]);else S.e.splice(i,1);S.colors.fill(-1);S.selected=null;S.showMinimum=false;}else S.selected=null;}else{saveGraph();S.colors[id]=S.activeColor;}paint();return;}
        el.dispatchEvent(new MouseEvent('click',{bubbles:true}));
      });
    });
  };
  // Apply new controls to the currently shown topic without resetting its problem.
  if(active==='home')render();else {if(active==='color'){S.activeColor=0;S.undo=[];S.showMinimum=false;S.tip='';}if(active==='logic'){S.seen=new Set();S.checkAll=false;}paint();}
})();
