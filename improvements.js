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
