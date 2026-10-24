'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const bundle=fs.readFileSync(path.join(root,'app.js'),'utf8');
const practiceMarker='/* Discrete Mathematics — reproducible problem generators.';
const improvementsMarker="'use strict';\n// Course activity improvements:";
let app=bundle,practice,improvements;
if(fs.existsSync(path.join(root,'practice.js'))){
  practice=fs.readFileSync(path.join(root,'practice.js'),'utf8');
  improvements=fs.readFileSync(path.join(root,'improvements.js'),'utf8');
}else{
  const a=bundle.indexOf(practiceMarker),b=bundle.indexOf(improvementsMarker,a);
  assert.ok(a>0&&b>a,'Consolidated scripts have identifiable boundaries');
  app=bundle.slice(0,a);practice=bundle.slice(a,b);improvements=bundle.slice(b);
}
const from=app.indexOf('const EXPRESSIONS=['),end=app.indexOf('\nINIT.logic=',from);
assert.ok(from>=0&&end>from,'Formula bank present');
const exprContext=vm.createContext({});
vm.runInContext(app.slice(from,end)+'\nglobalThis.EXPR=EXPRESSIONS;',exprContext);
const expressions=exprContext.EXPR;
const pure=vm.createContext({});
vm.runInContext(practice,pure);
const api=pure.DVLPractice;
assert.ok(api,'Generator API exported');
const {generate,CATEGORIES,LAB,LEVELS,colorable,isConnected,oddVertices,pathCount,gcd,functionFlags}=api;
const eq=(a,b)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
const divisions=(a,b)=>{let n=0;while(b){[a,b]=[b,a%b];n++;}return n;};
const euclidBands={easy:[[2,3],[2,3],[3,5]],medium:[[4,6],[4,6],[6,8]],hard:[[7,11],[6,11],[9,11]]};
test('All generators satisfy their mathematical constraints and reproduce seeds',()=>{
  let checked=0;
  for(const topic of LAB)for(const level of LEVELS)for(let variant=0;variant<CATEGORIES[topic];variant++)for(let seed=1;seed<=32;seed++){
    const g=generate(topic,level,seed,variant,expressions);
    eq(g,generate(topic,level,seed,variant,expressions));
    if(topic==='color'){
      assert.ok(isConnected(g.n,g.e));
      assert.equal(colorable(g.n,g.e,g.chromatic),true);
      assert.equal(colorable(g.n,g.e,g.chromatic-1),false);
      assert.ok(g.e.every(([a,b])=>a>=0&&b<g.n&&a!==b));
    }
    if(topic==='euler'){
      assert.ok(isConnected(g.n,g.e));
      assert.equal(oddVertices(g.n,g.e).length,[0,2,4][variant]);
      assert.equal(g.hasTrail,variant!==2);
      if(variant===1)assert.ok(oddVertices(g.n,g.e).includes(g.start));
    }
    if(topic==='paths'){
      const paths=pathCount(g.w,g.h,new Set(g.blocked));
      assert.equal(paths,g.count);
      assert.equal(paths===0,variant===0);
      assert.equal(paths===1,variant===1);
      if(variant===2)assert.ok(paths>1);
    }
    if(topic==='logic'){
      let diff=0;
      for(const [p,q] of [[false,false],[false,true],[true,false],[true,true]])
        if(expressions[g.left][1](p,q)!==expressions[g.right][1](p,q))diff++;
      assert.equal(diff,g.diff);
      assert.ok(variant===0?diff===0:variant===1?diff===1:diff>=2);
      if(level==='easy')assert.ok([g.left,g.right].every(i=>i>=10&&i<=17));
      if(level==='medium')assert.ok(g.left<18&&g.right<18);
      if(level==='hard')assert.ok(g.left>=18||g.right>=18);
    }
    if(topic==='functions'){
      const flags=functionFlags(g.f,g.m),kind=variant%4;
      if(kind===0)assert.ok(flags.injective&&!flags.surjective);
      if(kind===1)assert.ok(flags.surjective&&!flags.injective);
      if(kind===2)assert.ok(flags.bijective);
      if(kind===3)assert.ok(!flags.injective&&!flags.surjective);
      assert.ok(g.f.every(x=>x>=0&&x<g.m));
      assert.ok(g.g.every(x=>x>=0&&x<g.c));
    }
    if(topic==='euclid'){
      assert.equal(gcd(g.a,g.b),g.gcd);
      assert.equal(divisions(g.a,g.b),g.steps);
      const [lo,hi]=euclidBands[level][variant];
      assert.ok(g.steps>=lo&&g.steps<=hi);
      if(variant===0||variant===2)assert.equal(g.gcd,1);
      else assert.ok(g.gcd>1);
    }
    if(topic==='hanoi'){
      assert.ok(g.n>=3&&g.n<=6);
      const values=g.pegs.flat();
      eq(values.slice().sort((a,b)=>a-b),Array.from({length:g.n},(_,i)=>i+1));
      for(const peg of g.pegs)for(let i=1;i<peg.length;i++)assert.ok(peg[i-1]>peg[i]);
    }
    checked++;
  }
  assert.ok(checked>=2000);
});
function browser(){
  const callbacks={};
  const elements=new Map();
  const make=id=>({id,innerHTML:'',value:'',classList:{add(){},remove(){},toggle(){return false}},querySelector(){return null},querySelectorAll(){return []},setAttribute(){},addEventListener(){},closest(){return null}});
  const get=id=>{
    if(id==='euclidGuess')return {value:'1'};
    if(!elements.has(id))elements.set(id,make(id));
    return elements.get(id);
  };
  const loc={hash:'#home',pathname:'/discrete-visual-lab/',search:'',origin:'https://example.test'};
  const document={body:{classList:{remove(){},add(){},toggle(){}}},getElementById:get,
    addEventListener(name,fn){(callbacks[name]??=[]).push(fn);}};
  const w={addEventListener(){},afterPaint:null};
  const context=vm.createContext({
    document,window:w,location:loc,history:{replaceState(_,__,value){loc.hash=value.slice(value.indexOf('#'));}},
    navigator:{},crypto:{getRandomValues(arr){arr[0]=0xABC12345;}},URLSearchParams,MouseEvent:function(){},
    setInterval(){return 1;},clearInterval(){},requestAnimationFrame(fn){fn();},
    console,Math,Date,Set,Map,Number,Array,Uint32Array,JSON,
  });
  vm.runInContext(app,context);
  vm.runInContext(practice,context);
  vm.runInContext(improvements,context);
  const run=code=>vm.runInContext(code,context);
  const newProblem=()=>{
    const el={dataset:{practice:'new'}},target={closest(sel){return sel==='[data-practice]'?el:null}};
    for(const fn of callbacks.click??[])fn({target});
  };
  return {run,get,newProblem,loc,callbacks};
}
test('Generating another problem clears truth-table work and previous feedback',()=>{
  const b=browser();b.run("mode('logic')");
  b.newProblem();
  b.run("S.seen.add(0); S.checkAll=true; S.result='old counterexample';");
  b.newProblem();
  assert.equal(b.run('S.seen.size'),0);
  assert.equal(b.run('S.checkAll'),false);
  assert.equal(b.run('S.result'),'');
  assert.match(b.get('workbench').innerHTML,/New problem/i);
  assert.match(b.get('workbench').innerHTML,/\?/);
});
test('A new Euclid instance and a resized function clear previous answers',()=>{
  const b=browser();b.run("mode('euclid')");b.newProblem();
  b.run("S.guess='4'; S.guessFeedback='Incorrect'; S.step=2;");
  b.newProblem();
  assert.equal(b.run('S.step'),0);
  assert.equal(b.run('S.guess'),'');
  assert.equal(b.run('S.guessFeedback'),'');
  b.run("mode('functions')");b.newProblem();
  b.run("S.identityError='old';");b.newProblem();
  assert.equal(b.run('S.identityError'),'');
});
test('Graph palette does not expose chromatic number and Euler trail remains a prediction',()=>{
  const b=browser();b.run("mode('color')");b.newProblem();
  assert.equal(b.run('S.k'),3);
  assert.equal(b.run('S.showMinimum'),false);
  assert.match(b.get('workbench').innerHTML,/Chromatic number<\/small><strong>\?<\/strong>/);
  b.run("mode('euler')");b.newProblem();
  assert.equal(b.run('S.trailChecked'),false);
  assert.match(b.get('workbench').innerHTML,/Trail from start<\/small><strong>\?<\/strong>/);
  b.run("ACTIONS.euler.trailYes()");
  assert.equal(b.run('S.trailChecked'),true);
  assert.doesNotMatch(b.get('workbench').innerHTML,/Trail from start<\/small><strong>\?<\/strong>/);
});
test('Reset restores a generated problem without carrying over student moves',()=>{
  const b=browser();b.run("mode('logic')");b.newProblem();
  const pair=b.run('[S.left,S.right]');
  b.run('S.seen.add(2);');
  const el={dataset:{practice:'reset'}},target={closest(sel){return sel==='[data-practice]'?el:null}};
  for(const fn of b.callbacks.click??[])fn({target});
  eq(b.run('[S.left,S.right]'),pair);
  assert.equal(b.run('S.seen.size'),0);
});
