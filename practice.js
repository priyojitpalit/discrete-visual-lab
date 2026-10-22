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
  function generateLogic(r,level,variant,expressions){const options=[];for(let i=0;i<expressions.length;i++)for(let j=i+1;j<expressions.length;j++){let diff=0;for(const [p,q] of [[false,false],[false,true],[true,false],[true,true]])if(expressions[i][1](p,q)!==expressions[j][1](p,q))diff++;options.push({left:i,right:j,diff});}
    const kind=variant%3;let pool=options.filter(x=>kind===0?x.diff===0:kind===1?x.diff===1:x.diff>=2);
    if(level==='easy'&&kind===2)pool=pool.filter(x=>x.diff>=2);
    if(level==='hard'&&kind===1)pool=pool.filter(x=>x.diff===1);
    if(!pool.length)throw Error('No logical-expression pairs for category');return pick(r,pool);}
  function functionFlags(a,out){const im=new Set(a);return{injective:im.size===a.length,surjective:im.size===out,bijective:im.size===out&&im.size===a.length};}
  function generateFunctions(r,level,variant){const type=variant%4;const n=type===0?(level==='easy'?3:4):type===1?(level==='hard'?5:4):(level==='easy'?3:level==='medium'?4:5);let m,c=n,f=[];
    if(type===0){m=Math.min(5,n+1);f=shuffle(r,Array.from({length:m},(_,i)=>i)).slice(0,n);}
    if(type===1){m=n-1;f=shuffle(r,Array.from({length:n},(_,i)=>i<m?i:int(r,0,m-1)));}
    if(type===2){m=n;f=shuffle(r,Array.from({length:n},(_,i)=>i));}
    if(type===3){m=n;f=Array.from({length:n},(_,i)=>i%(m-1));f=shuffle(r,f);}
    c=level==='hard'?int(r,3,5):m;
    let g=Array.from({length:m},()=>int(r,0,c-1));if(level==='easy')g=Array.from({length:m},(_,i)=>i%c);
    const flags=functionFlags(f,m);const expected=[{injective:true},{surjective:true},{bijective:true},{injective:false,surjective:false}][type];if(Object.keys(expected).some(k=>flags[k]!==expected[k]))throw Error('Invalid generated function type');return{n,m,c,f,g,category:type};}
  function generateEuclid(r,level,variant){const kind=variant%3;let a,b;
    if(kind===0){for(let i=0;i<200;i++){a=int(r,12,144);b=int(r,12,144);if(gcd(a,b)===1)break;}}
    else if(kind===1){let d=int(r,2,level==='hard'?12:8);let mx=Math.floor(144/d),x,y;do{x=int(r,Math.max(2,Math.ceil(12/d)),mx);y=int(r,Math.max(2,Math.ceil(12/d)),mx);}while(x===y||gcd(x,y)!==1);a=x*d;b=y*d;}
    else {const fib=[[34,21],[55,34],[89,55],[144,89]];[a,b]=pick(r,level==='easy'?fib.slice(0,2):level==='medium'?fib.slice(1,3):fib.slice(2));}
    if(r()<.5)[a,b]=[b,a];let steps=0,x=a,y=b;while(y){[x,y]=[y,x%y];steps++;}if(a<12||b<12||a>144||b>144||(kind===0&&x!==1)||(kind===1&&x<=1)||(kind===2&&steps<6))throw Error('Invalid Euclidean pair');return{a,b,gcd:x,steps,category:kind};}
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
      colorInit('Generated problem');S.k=instance.chromatic;S.problemAnswer=instance.chromatic;
    } else if(lab==='euler'){
      eulerPresets['Generated problem']={n:instance.n,e:instance.e.map(e=>e.slice()),start:instance.start};eulerInit('Generated problem');
    } else if(lab==='paths'){
      S.w=instance.w;S.h=instance.h;S.blocked=new Set(instance.blocked);S.reveal=0;S.path=[[0,0]];S.mode='obstacle';
    } else if(lab==='logic'){
      S.left=instance.left;S.right=instance.right;S.p=true;S.q=false;
    } else if(lab==='functions'){
      S.n=instance.n;S.m=instance.m;S.c=instance.c;S.f=instance.f.slice();S.g=instance.g.slice();S.mode='composition';S.selected=null;S.trace=0;
    } else if(lab==='euclid'){
      S.a=instance.a;S.b=instance.b;S.step=0;
    } else if(lab==='hanoi'){
      hanoiInit(instance.n);S.pegs=instance.pegs.map(p=>p.slice());S.feedback='Move each disk to the right-hand peg. Only a smaller disk may be placed on a larger disk.';
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