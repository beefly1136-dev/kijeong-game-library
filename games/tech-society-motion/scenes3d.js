/* 기술이 바꾼 사회 · 3D 디오라마 장면 (three.js r128)
   S3.render(key, lt, w, h, mode) → 그려진 WebGL 캔버스 (mode: 'main' | 'banner')
   S3.project(key, name)          → 마지막으로 그린 화면에서 이름표 위치 {x, y, vis} (0~1)
   모든 움직임은 장면 시간 lt만으로 정해집니다(되감기·건너뛰기 가능). */
(function(){
'use strict';
const T=window.THREE;
if(!T){window.S3={ok:false};return;}
let renderer;
try{
  renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  if(!renderer.getContext())throw 0;
}catch(e){window.S3={ok:false};return;}
renderer.setClearColor(0x000000,0);
renderer.outputEncoding=T.sRGBEncoding;
renderer.toneMapping=T.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=T.PCFSoftShadowMap;

const PI=Math.PI,TAU=PI*2;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(t,a,b)=>clamp((t-a)/(b-a)),lerp=(a,b,k)=>a+(b-a)*k;
const eo=x=>1-Math.pow(1-x,3),eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const eback=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const rnd=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453;return s-Math.floor(s);};
const V3=(x,y,z)=>new T.Vector3(x,y,z);
const tiny=.0001;

/* ---------- 공통 도구 ---------- */
const LIN=h=>new T.Color(h).convertSRGBToLinear();
function M(color,o={}){return new T.MeshStandardMaterial({color:LIN(color),roughness:o.r??.7,metalness:o.m??0,emissive:LIN(o.e??0x000000),emissiveIntensity:o.ei??1,
  transparent:!!o.t,opacity:o.o??1,flatShading:!!o.flat,side:o.side??T.FrontSide,depthWrite:o.dw??true});}
function add(parent,geo,mat,x=0,y=0,z=0,o={}){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=o.cast??true;m.receiveShadow=o.recv??true;parent.add(m);return m;}
function lights(scene,o={}){
  scene.add(new T.HemisphereLight(o.sky??0xfff1dc,o.ground??0x30261c,o.hemi??.85));
  const d=new T.DirectionalLight(o.sun??0xffffff,o.si??1.2);d.position.set(...(o.dir??[6,11,7]));d.castShadow=true;
  d.shadow.mapSize.set(1024,1024);fitShadow(d,o.ss??10);
  d.shadow.bias=-.0006;d.shadow.normalBias=.03;scene.add(d);scene.add(d.target);
  if(o.fill){const f=new T.DirectionalLight(o.fill,o.fi??.35);f.position.set(-6,4,-6);scene.add(f);}
  return d;
}
function island(parent,r,top,side,x=0,z=0){
  const g=new T.Group();g.position.set(x,0,z);
  add(g,new T.CylinderGeometry(r,r,.36,64),M(top,{r:.92}),0,-.18,0);
  add(g,new T.CylinderGeometry(r*.99,r*.72,1.5,64),M(side,{r:1}),0,-1.11,0,{cast:false});
  add(g,new T.TorusGeometry(r,.05,8,64),M(shade(top,-.12),{r:.9}),0,-.02,0,{cast:false}).rotation.x=PI/2;
  parent.add(g);return g;
}
function shade(hex,k){const c=new T.Color(hex);c.offsetHSL(0,0,k);return c.getHex();}
// 막대를 두 점 사이에 놓기(길이 1, x축 방향 상자/원기둥 기준)
const XA=new T.Vector3(1,0,0);
function bar(mesh,a,b){const d=b.clone().sub(a),len=Math.max(tiny,d.length());
  mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(len,1,1);mesh.quaternion.setFromUnitVectors(XA,d.normalize());}
function fitShadow(light,s){const c=light.shadow.camera;c.left=-s;c.right=s;c.top=s;c.bottom=-s;c.near=1;c.far=50;c.updateProjectionMatrix();}
function person(o){
  const g=new T.Group(),skin=M(0xe2b48a,{r:.75}),cloth=M(o.cloth,{r:.85}),pants=M(o.pants??0x3b4a6b,{r:.9});
  const legL=new T.Group(),legR=new T.Group();legL.position.set(-.1,.76,0);legR.position.set(.1,.76,0);
  [legL,legR].forEach(l=>{add(l,new T.CylinderGeometry(.08,.07,.74,10),pants,0,-.37,0);add(l,new T.BoxGeometry(.13,.08,.22),M(0x2b2118),0,-.72,.04);g.add(l);});
  add(g,new T.CylinderGeometry(.19,.25,.72,16),cloth,0,1.12,0);
  add(g,new T.SphereGeometry(.21,16,10,0,TAU,0,PI/2),cloth,0,1.46,0);
  const head=add(g,new T.SphereGeometry(.17,22,16),skin,0,1.66,0);
  [-1,1].forEach(s=>add(head,new T.SphereGeometry(.022,6,6),M(0x241a12),s*.06,.02,.155,{cast:false}));
  const armL=new T.Group(),armR=new T.Group();armL.position.set(-.27,1.4,0);armR.position.set(.27,1.4,0);
  [armL,armR].forEach(a=>{add(a,new T.CylinderGeometry(.065,.055,.6,10),cloth,0,-.3,0);add(a,new T.SphereGeometry(.065,10,8),skin,0,-.63,0);g.add(a);});
  if(o.hat==='straw'){add(g,new T.ConeGeometry(.34,.2,22),M(0xd9b45a,{r:.9}),0,1.86,0);add(g,new T.CylinderGeometry(.4,.4,.02,22),M(0xcfa64b,{r:.9}),0,1.78,0);}
  if(o.hat==='helmet'){const hm=M(o.helmet??0x9bd34a,{r:.45,m:.1});add(g,new T.SphereGeometry(.2,20,12,0,TAU,0,PI/2),hm,0,1.7,0);add(g,new T.CylinderGeometry(.25,.25,.03,22),hm,0,1.7,.02);}
  if(o.hair){add(g,new T.SphereGeometry(.18,18,12,0,TAU,0,PI*.55),M(o.hair,{r:.8}),0,1.69,-.01);}
  return {g,legL,legR,armL,armR,head};
}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x,w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=4;return {tex:t,ctx:x,canvas:c};}
function emojiSprite(ch,size=1){const {tex}=canvasTex(128,128,(x)=>{x.font='96px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(ch,64,72);});
  const s=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));s.scale.set(size,size,size);return s;}
function camPose(tg,d,yaw,pitch){return {pos:V3(tg[0]+d*Math.sin(yaw)*Math.cos(pitch),tg[1]+d*Math.sin(pitch),tg[2]+d*Math.cos(yaw)*Math.cos(pitch)),tg:V3(...tg)};}
function blendCams(list,lt){let k=0;for(let i=0;i<list.length;i++)if(lt>=list[i].t)k=i;
  const b=k>0?eio(seg(lt,list[k].t,list[k].t+(list[k].dur??1.4))):1,A=list[Math.max(0,k-1)],B=list[k];
  return {tg:[0,1,2].map(j=>lerp(A.tg[j],B.tg[j],b)),d:lerp(A.d,B.d,b),yaw:lerp(A.yaw,B.yaw,b),pitch:lerp(A.pitch,B.pitch,b),sx:lerp(A.sx??0,B.sx??0,b),sy:lerp(A.sy??0,B.sy??0,b)};}

/* =====================================================================
   농업 사회
   ===================================================================== */
function buildAgri(){
  const scene=new T.Scene(),root=new T.Group();scene.add(root);
  lights(scene,{sun:0xfff0d6,si:1.35,dir:[-7,12,7],ss:9,hemi:.6,fill:0xbfd8ff});
  island(root,6.2,0x77a845,0x6e4a2c);
  add(root,new T.BoxGeometry(7.6,.05,3.9),M(0x8dba55,{r:.95}),-.2,.025,.95);
  const soil=add(root,new T.BoxGeometry(1,.07,3.9),M(0x8a6436,{r:1}),0,.035,.95);
  const rows=[];for(let r=0;r<5;r++)rows.push(add(root,new T.BoxGeometry(1,.15,.24),M(0x6a4826,{r:1}),0,.1,-.55+r*.74));
  const crops=[];for(let r=0;r<5;r++)for(let j=0;j<16;j++)crops.push({x:-3.55+j*.46+(r%2)*.2,z:-.55+r*.74,j});
  const N=crops.length;
  const stem=new T.InstancedMesh(new T.CylinderGeometry(.03,.04,1,6),M(0x3f8a2c,{r:.8}),N);
  const leaf=new T.InstancedMesh(new T.SphereGeometry(1,8,6),M(0x62b446,{r:.75}),N*2);
  const grain=new T.InstancedMesh(new T.SphereGeometry(1,8,8),M(0xf2c84a,{r:.55}),N);
  [stem,leaf,grain].forEach(m=>{m.castShadow=true;m.receiveShadow=true;root.add(m);});
  const huts=[[-4.1,-2.7],[-2.4,-3.5],[2.0,-3.7],[4.2,-2.6]].map(([x,z])=>{const g=new T.Group();g.position.set(x,0,z);
    add(g,new T.CylinderGeometry(.62,.68,.78,20),M(0xd6b178,{r:.9}),0,.39,0);
    add(g,new T.ConeGeometry(.98,.9,20),M(0xb57f34,{r:1,flat:true}),0,1.22,0);
    add(g,new T.BoxGeometry(.3,.48,.08),M(0x4a3018),0,.24,.66);
    g.rotation.y=Math.atan2(-x,-z+3);root.add(g);return g;});
  [[-5.3,-.6],[5.2,.6],[-.3,-4.8],[1.0,-4.5],[5.1,-1.6],[-5.0,1.9]].forEach(([x,z],i)=>{const s=.85+rnd(i)*.45;
    add(root,new T.CylinderGeometry(.09*s,.14*s,.95*s,8),M(0x6b4a2b),x,.47*s,z);
    add(root,new T.IcosahedronGeometry(.66*s,0),M(0x3f7d35,{flat:true,r:.9}),x,1.2*s,z);
    add(root,new T.IcosahedronGeometry(.45*s,0),M(0x58993f,{flat:true}),x+.28*s,1.52*s,z+.1);});
  const puffs=[];huts.forEach((h,i)=>{for(let k=0;k<4;k++){const m=add(root,new T.SphereGeometry(.2,10,8),M(0xffffff,{t:true,o:.5,r:1,dw:false}),0,0,0,{cast:false,recv:false});puffs.push({m,h,k,i});}});
  // 소
  const ox=new T.Group();root.add(ox);const brown=M(0x7a4a28,{r:.85});
  add(ox,new T.SphereGeometry(.5,20,14),brown,0,.98,0).scale.set(1.55,.85,.82);
  const oh=add(ox,new T.SphereGeometry(.3,18,12),brown,.88,1.13,0);oh.scale.set(1.1,.92,.85);
  add(ox,new T.SphereGeometry(.17,12,10),M(0xc9a27e),1.15,1.03,0);
  [-1,1].forEach(s=>{const h=add(ox,new T.ConeGeometry(.05,.32,8),M(0xf1e6cc),.88,1.42,s*.22);h.rotation.x=-s*.7;});
  const oxLegs=[[-.48,-.22],[-.48,.22],[.48,-.22],[.48,.22]].map(([x,z])=>{const l=new T.Group();l.position.set(x,.78,z);add(l,new T.CylinderGeometry(.085,.07,.78,8),M(0x4a2d17),0,-.39,0);ox.add(l);return l;});
  const tail=add(ox,new T.CylinderGeometry(.025,.02,.6,6),brown,-.82,.86,0);tail.rotation.z=.45;
  const rope=add(root,new T.BoxGeometry(1,.04,.04),M(0x3a2815));
  const plow=new T.Group();root.add(plow);
  add(plow,new T.BoxGeometry(.6,.08,.08),M(0x6b4a2b),0,.36,0);
  const blade=add(plow,new T.ConeGeometry(.13,.38,4),M(0x9aa0a8,{m:.6,r:.4}),.28,.16,0);blade.rotation.z=PI/2;
  const handle=add(plow,new T.CylinderGeometry(.03,.03,.95,6),M(0x6b4a2b),-.38,.72,0);handle.rotation.z=.75;
  const farmer=person({cloth:0xb5523a,hat:'straw'});root.add(farmer.g);
  const clods=[];for(let i=0;i<10;i++)clods.push(add(root,new T.SphereGeometry(.05,6,5),M(0x6a4826,{r:1}),0,0,0,{cast:false}));
  // 장인의 작업장
  const ws=new T.Group();ws.position.set(3.3,0,-.9);ws.rotation.y=-.5;root.add(ws);
  add(ws,new T.BoxGeometry(2.3,.08,1.8),M(0x8a6a48,{r:.9}),0,.04,0);
  add(ws,new T.CylinderGeometry(.2,.27,.34,12),M(0x5a3b22),0,.17,.35);
  add(ws,new T.BoxGeometry(.48,.32,.3),M(0x3d4249,{m:.6,r:.45}),0,.5,.35);
  add(ws,new T.BoxGeometry(.82,.12,.34),M(0x4a5058,{m:.7,r:.35}),0,.72,.35);
  const horn=add(ws,new T.ConeGeometry(.12,.34,10),M(0x4a5058,{m:.7,r:.35}),.56,.72,.35);horn.rotation.z=-PI/2;
  const hot=add(ws,new T.BoxGeometry(.32,.05,.1),M(0xff7a2a,{e:0xff5a10,ei:1.6}),0,.8,.35);
  add(ws,new T.BoxGeometry(.7,.5,.5),M(0x7a5a3a),-.8,.25,-.5);add(ws,new T.BoxGeometry(.5,.08,.5),M(0x9a8a7a),-.8,.54,-.5);
  const smith=person({cloth:0x6b5a46,hair:0x2b2118});smith.g.position.set(0,0,-.3);ws.add(smith.g);
  const hammer=new T.Group();hammer.position.set(0,-.64,0);smith.armR.add(hammer);
  add(hammer,new T.CylinderGeometry(.025,.025,.5,6),M(0x8a5a2b),0,0,.2).rotation.x=PI/2;
  add(hammer,new T.BoxGeometry(.12,.12,.2),M(0x9aa0a8,{m:.7,r:.35}),0,0,.45);
  const sparks=[];for(let i=0;i<10;i++){const m=add(ws,new T.SphereGeometry(.025,6,5),M(0xffc060,{e:0xffa020,ei:3}),0,0,0,{cast:false,recv:false});sparks.push(m);}
  const dm=new T.Object3D();
  function update(lt){
    const p=eio(seg(lt,1.2,9.5)),px=-3.65+7.1*p,w=Math.max(.02,px+3.65);
    soil.scale.x=w;soil.position.x=-3.65+w/2;rows.forEach(r=>{r.scale.x=w;r.position.x=-3.65+w/2;});
    crops.forEach((c,n)=>{const g=clamp((px-c.x-.5)/1.6)*seg(lt,2,3),h2=seg(lt,9.5+c.j*.05,12.5+c.j*.05),h=.26*g+.38*h2,sw=Math.sin(lt*2+c.j*.5)*.05*h2;
      dm.position.set(c.x,.08+h/2,c.z);dm.rotation.set(0,0,sw);dm.scale.set(1,Math.max(tiny,h),1);dm.updateMatrix();stem.setMatrixAt(n,dm.matrix);
      [-1,1].forEach((s,k)=>{dm.position.set(c.x+s*.07,.08+h*.55+k*.04,c.z);dm.rotation.set(0,0,s*.6);dm.scale.set(Math.max(tiny,.1*g),Math.max(tiny,.04*g),Math.max(tiny,.05*g));dm.updateMatrix();leaf.setMatrixAt(n*2+k,dm.matrix);});
      dm.position.set(c.x+sw,.08+h+.07,c.z);dm.rotation.set(0,0,0);dm.scale.set(Math.max(tiny,.055*h2),Math.max(tiny,.13*h2),Math.max(tiny,.055*h2));dm.updateMatrix();grain.setMatrixAt(n,dm.matrix);});
    stem.instanceMatrix.needsUpdate=leaf.instanceMatrix.needsUpdate=grain.instanceMatrix.needsUpdate=true;
    const walk=lt>1.2&&lt<9.5?1:0,z=2.55,bob=Math.abs(Math.sin(lt*8))*.035*walk;
    ox.position.set(px+1.65,bob,z);oxLegs.forEach((l,k)=>l.rotation.z=Math.sin(lt*8+(k%2?PI:0)+(k>1?PI/2:0))*.38*walk);tail.rotation.x=Math.sin(lt*3)*.2;
    plow.position.set(px+.3,0,z);
    const fx=px-.45;farmer.g.position.set(fx,bob*.6,z);farmer.g.rotation.y=PI/2;
    farmer.legL.rotation.x=Math.sin(lt*8)*.5*walk;farmer.legR.rotation.x=-Math.sin(lt*8)*.5*walk;farmer.armL.rotation.x=farmer.armR.rotation.x=-.95;
    bar(rope,V3(px+.6,.4,z),V3(px+1.05,.95,z));
    clods.forEach((c,i)=>{const ph=(lt*1.6+rnd(i))%1;c.visible=walk>0;c.position.set(px+.45-ph*.4+rnd(i+3)*.2,.12+Math.sin(ph*PI)*.25,z+(rnd(i+9)-.5)*.3);});
    huts.forEach((h,i)=>{const k=eback(seg(lt,4.8+i*.35,5.5+i*.35));h.visible=k>0;h.scale.setScalar(Math.max(tiny,k));});
    puffs.forEach(({m,h,k,i})=>{const on=seg(lt,5.6+i*.35,6.2+i*.35),ph=(lt*.4+k/4)%1;m.visible=on>0;
      m.position.set(h.position.x+.22+Math.sin(ph*6+i)*.12,1.75+ph*1.5,h.position.z);m.scale.setScalar(.6+ph*1.8);m.material.opacity=(1-ph)*.45*on;});
    const kws=eback(seg(lt,9.6,10.4));ws.visible=kws>0;ws.scale.setScalar(Math.max(tiny,kws));
    const s=Math.abs(Math.sin(lt*4));smith.armR.rotation.x=-1.25-1.15*s;smith.armL.rotation.x=-.9;
    hot.material.emissiveIntensity=1.2+Math.sin(lt*7)*.3;
    sparks.forEach((m,i)=>{m.visible=s<.28&&kws>=1;const a=rnd(i)*TAU,r=(.28-s)*1.6*(.4+rnd(i+5));m.position.set(Math.cos(a)*r,.85+(.28-s)*1.2*rnd(i+2),.35+Math.sin(a)*r*.6);});
  }
  function cam(lt,mode){
    if(mode==='banner')return camPose([0,.5,.7],9.2,-.2+Math.sin(lt*.18)*.18,.36);
    const c=blendCams([{t:0,tg:[0,.2,.3],d:19,yaw:-.6,pitch:.42,sx:.18,sy:-.06},{t:1.5,tg:[0,.2,.3],d:17.5,yaw:.05,pitch:.4,sx:.18,sy:-.06,dur:8},
      {t:9.8,tg:[2.9,.8,-.9],d:9.5,yaw:-.22,pitch:.36,sx:.18,sy:-.06,dur:1.6},{t:13,tg:[1,.3,0],d:17,yaw:.3,pitch:.4,sx:.18,sy:-.06,dur:4}],lt);
    return {...camPose(c.tg,c.d,c.yaw,c.pitch),sx:c.sx,sy:c.sy};
  }
  return {scene,update,cam,anchors:{workshop:()=>ws.localToWorld(V3(0,1.9,0))}};
}

/* =====================================================================
   1차 산업 혁명 · 증기 기관
   ===================================================================== */
const OMAX=TAU*.9,RAMP=3,ST0=7;
function theta(lt){if(lt<ST0)return 0;const a=OMAX/RAMP;if(lt<ST0+RAMP){const u=lt-ST0;return .5*a*u*u;}return .5*OMAX*RAMP+OMAX*(lt-ST0-RAMP);}
function chuffs(dur){const a=OMAX/RAMP,th9=.5*OMAX*RAMP,out=[];for(let k=1;k<400;k++){const tg=k*PI,t=tg<th9?ST0+Math.sqrt(2*tg/a):ST0+RAMP+(tg-th9)/OMAX;if(t>dur)break;out.push(t);}return out;}
function buildSteam(){
  const scene=new T.Scene(),root=new T.Group();scene.add(root);
  lights(scene,{sun:0xffe7c4,si:1.15,dir:[5,12,9],ss:10,hemi:.7,sky:0xfff0d8,ground:0x2a1c12,fill:0x9fb8ff,fi:.4});
  const iron=M(0x3a3d42,{m:.65,r:.42}),iron2=M(0x55595f,{m:.7,r:.38}),brass=M(0xc79a48,{m:.9,r:.3}),copper=M(0xb87333,{m:.85,r:.32}),steel=M(0xc9ced6,{m:.85,r:.25});
  // 받침
  add(root,new T.BoxGeometry(14.5,.5,4.4),M(0x6e3b2a,{r:.95}),.9,-.25,0);
  add(root,new T.BoxGeometry(14.7,.12,4.6),M(0x8a5a45,{r:.9}),.9,-.04,0);
  // 화실
  const fireMat=M(0x2f2a26,{m:.4,r:.6});
  add(root,new T.BoxGeometry(2.4,1.25,2.0),fireMat,-4.5,.62,0);
  const mouth=add(root,new T.PlaneGeometry(1.3,.6),M(0xff6a1a,{e:0xff5a10,ei:2}),-4.5,.55,1.005,{cast:false});
  const coals=[];for(let i=0;i<9;i++)coals.push(add(root,new T.DodecahedronGeometry(.12,0),M(0x1d1a18,{e:0xff4400,ei:.6,r:1}),-5.05+i*.14,.3+rnd(i)*.06,.95,{cast:false}));
  const fireLight=new T.PointLight(0xff7a2a,2,7,2);fireLight.position.set(-4.5,.7,1.6);root.add(fireLight);
  const embers=[];for(let i=0;i<14;i++)embers.push(add(root,new T.SphereGeometry(.03,6,5),M(0xffb040,{e:0xff8a20,ei:3}),0,0,0,{cast:false,recv:false}));
  // 보일러(세로형, 반투명 껍데기)
  const shellMat=new T.MeshPhysicalMaterial({color:0xcfe0ee,metalness:0,roughness:.08,transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false});
  const shell=add(root,new T.CylinderGeometry(1.0,1.0,2.3,40,1,true),shellMat,-4.5,2.4,0,{cast:false,recv:false});
  const bandMat=M(0x8c6b3a,{m:.85,r:.35});
  [1.28,2.4,3.5].forEach(y=>add(root,new T.TorusGeometry(1.0,.06,10,48),bandMat,-4.5,y,0).rotation.x=PI/2);
  const dome=add(root,new T.SphereGeometry(1.0,40,16,0,TAU,0,PI/2),M(0x8c6b3a,{m:.85,r:.35}),-4.5,3.55,0);
  const water=add(root,new T.CylinderGeometry(.92,.92,1.1,40),M(0x2f75b8,{t:true,o:.85,r:.15,m:.1,e:0x0a2a50,ei:.4}),-4.5,1.86,0,{cast:false});
  const steamIn=add(root,new T.CylinderGeometry(.92,.92,1.08,40),M(0xffffff,{t:true,o:.1,r:1,dw:false}),-4.5,2.96,0,{cast:false,recv:false});
  const bubbles=[];for(let i=0;i<22;i++)bubbles.push(add(root,new T.SphereGeometry(.05,8,6),M(0xdaf0ff,{t:true,o:.85,r:.1}),0,0,0,{cast:false,recv:false}));
  const gaugeG=new T.Group();gaugeG.position.set(-4.5,3.05,1.02);root.add(gaugeG);
  add(gaugeG,new T.CylinderGeometry(.24,.24,.06,28),brass,0,0,0).rotation.x=PI/2;
  add(gaugeG,new T.CircleGeometry(.2,28),M(0xf2ead8,{r:.6}),0,0,.035,{cast:false});
  const needle=new T.Group();needle.position.z=.04;gaugeG.add(needle);add(needle,new T.BoxGeometry(.03,.18,.01),M(0xc0392b),0,.08,0,{cast:false});
  // 증기관
  const curve=new T.CatmullRomCurve3([V3(-4.5,4.45,0),V3(-4.4,4.9,0),V3(-3.5,5.05,0),V3(-1.3,4.75,0),V3(-.3,4.1,0),V3(-.2,3.35,0)]);
  add(root,new T.TubeGeometry(curve,80,.16,14,false),copper);
  const flow=[];for(let i=0;i<14;i++)flow.push(add(root,new T.SphereGeometry(.1,10,8),M(0xffffff,{e:0xcfe8ff,ei:1.2,t:true,o:.9}),0,0,0,{cast:false,recv:false}));
  // 밸브실·실린더
  add(root,new T.BoxGeometry(2.2,.45,1.0),iron2,0,3.0,0);
  const valve=add(root,new T.BoxGeometry(.5,.18,.6),brass,0,3.3,0);
  const cylY=2.0,cylL=-1.1,cylR=1.1;
  const glass=new T.MeshPhysicalMaterial({color:0xd8e8f4,metalness:0,roughness:.05,transparent:true,opacity:.18,side:T.DoubleSide,depthWrite:false});
  const cylGeo=new T.CylinderGeometry(.78,.78,cylR-cylL,40,1,true);cylGeo.rotateZ(PI/2);
  add(root,cylGeo,glass,0,cylY,0,{cast:false,recv:false});
  const flangeMat=M(0x6a6e75,{m:.8,r:.35});
  [cylL,cylR].forEach(x=>{const f=add(root,new T.CylinderGeometry(.9,.9,.14,40),flangeMat,x,cylY,0);f.rotation.z=PI/2;});
  [-.4,.4].forEach(x=>add(root,new T.TorusGeometry(.79,.04,8,40),flangeMat,x,cylY,0).rotation.y=PI/2);
  [cylL+.25,cylR-.25].forEach(x=>add(root,new T.BoxGeometry(.25,1.2,.9),iron,x,.6,0));
  const chGeo=new T.CylinderGeometry(.74,.74,1,32);chGeo.rotateZ(PI/2);
  const chL=add(root,chGeo,M(0xffffff,{t:true,o:.2,e:0xbfe0ff,ei:.3,dw:false}),0,cylY,0,{cast:false,recv:false});
  const chR=add(root,chGeo.clone(),M(0xffffff,{t:true,o:.2,e:0xbfe0ff,ei:.3,dw:false}),0,cylY,0,{cast:false,recv:false});
  const pGeo=new T.CylinderGeometry(.74,.74,.22,40);pGeo.rotateZ(PI/2);const piston=add(root,pGeo,steel,0,cylY,0);
  const rodGeo=new T.CylinderGeometry(.07,.07,1,12);rodGeo.rotateZ(PI/2);const rod=add(root,rodGeo,steel,0,cylY,0);
  [-.32,.32].forEach(z=>add(root,new T.BoxGeometry(1.9,.08,.08),iron2,4.0,cylY,z));
  add(root,new T.BoxGeometry(.25,1.9,.9),iron,3.05,1.0,0);
  const cross=add(root,new T.BoxGeometry(.42,.42,.56),iron2,0,cylY,0);
  // 배기 굴뚝
  add(root,new T.CylinderGeometry(.14,.16,1.4,16),iron,.8,3.9,0);
  const puffs=[];for(let i=0;i<24;i++)puffs.push(add(root,new T.SphereGeometry(.3,12,10),M(0xf2f2f4,{t:true,o:.4,r:1,dw:false}),0,0,0,{cast:false,recv:false}));
  // 플라이휠
  const Cx=6.4,Cz=-.45,R=1.75,cr=.6,L=2.4;
  const wheel=new T.Group();wheel.position.set(Cx,cylY,Cz);root.add(wheel);
  const wheelMat=M(0x4a4e55,{m:.75,r:.38});
  add(wheel,new T.TorusGeometry(R,.17,16,80),wheelMat,0,0,0);
  add(wheel,new T.TorusGeometry(R-.12,.08,10,80),M(0x8b919a,{m:.85,r:.3}),0,0,.1);
  for(let k=0;k<6;k++){const s=add(wheel,new T.BoxGeometry(R-.15,.12,.1),wheelMat,0,0,0);s.position.set(Math.cos(k*PI/3)*(R/2),Math.sin(k*PI/3)*(R/2),0);s.rotation.z=k*PI/3;}
  const hub=new T.CylinderGeometry(.28,.28,.4,24);hub.rotateX(PI/2);add(wheel,hub,brass,0,0,0);
  const crankDisc=new T.CylinderGeometry(.75,.75,.14,32);crankDisc.rotateX(PI/2);
  const crank=new T.Group();crank.position.set(Cx,cylY,.05);root.add(crank);add(crank,crankDisc,iron2,0,0,0);
  const pin=new T.CylinderGeometry(.1,.1,.4,14);pin.rotateX(PI/2);const pinM=add(crank,pin,brass,cr,0,.15);
  const axle=new T.CylinderGeometry(.12,.12,1.2,14);axle.rotateX(PI/2);add(root,axle,steel,Cx,cylY,-.2);
  [[-.9,-1],[.9,-1]].forEach(([dx])=>{const a=add(root,new T.BoxGeometry(.18,2.3,.18),iron,Cx+dx*.55,.95,-1.05);a.rotation.z=dx>0?-.32:.32;});
  add(root,new T.BoxGeometry(1.8,.18,.5),iron,Cx,.09,-1.05);
  const conGeo=new T.BoxGeometry(1,.16,.12);const conrod=add(root,conGeo,M(0xd3d6dc,{m:.85,r:.25}),0,0,0);
  const arrowMat=M(0x9bd34a,{e:0x6aa82a,ei:.8});
  const arrow=new T.Mesh(new T.TorusGeometry(R+.45,.05,8,48,PI*.5),arrowMat);arrow.position.set(Cx,cylY,Cz);root.add(arrow);
  const arrowHead=add(root,new T.ConeGeometry(.15,.35,12),arrowMat,0,0,0,{cast:false});
  const CH=chuffs(30);
  const hiMats=[fireMat,bandMat,flangeMat,wheelMat];
  function update(lt){
    const heat=seg(lt,1.5,3.2),boil=seg(lt,4,5.5),pipeP=seg(lt,5.2,6.6),steamOn=seg(lt,6.2,7),th=theta(lt);
    const fl=.75+.25*Math.sin(lt*11)+.12*Math.sin(lt*23);
    mouth.material.emissiveIntensity=.2+2.4*heat*fl;fireLight.intensity=3.2*heat*fl;
    coals.forEach((c,i)=>c.material.emissiveIntensity=.2+1.6*heat*(.6+.4*Math.sin(lt*5+i)));
    embers.forEach((e,i)=>{const ph=(lt*.6+rnd(i))%1;e.visible=heat>0;e.position.set(-4.5+(rnd(i+3)-.5)*1.1+Math.sin(lt*3+i)*.08,.4+ph*1.2,1.1+rnd(i+7)*.3);e.scale.setScalar(1-ph);});
    steamIn.material.opacity=.06+.32*boil;water.position.y=1.86+Math.sin(lt*6)*.015*boil;
    bubbles.forEach((b,i)=>{const ph=(lt*(.8+rnd(i)*.6)+rnd(i+1))%1,a=rnd(i+4)*TAU,r=rnd(i+8)*.75;b.visible=boil>0;b.position.set(-4.5+Math.cos(a)*r,1.35+ph*1.02,Math.sin(a)*r);b.scale.setScalar((.6+ph)*boil);});
    needle.rotation.z=1.9-boil*3.2+Math.sin(lt*20)*.04*boil;
    flow.forEach((f,i)=>{const u=((lt*.45+i/14)%1);f.visible=pipeP>0&&u<=pipeP;f.position.copy(curve.getPointAt(Math.min(u,pipeP)));f.scale.setScalar(.7+.3*Math.sin(lt*6+i));});
    const X=Cx+cr*Math.cos(th)-Math.sqrt(L*L-Math.pow(cr*Math.sin(th),2)),xp=X-3.75;
    const Px=Cx+cr*Math.cos(th),Py=cylY+cr*Math.sin(th);
    piston.position.x=xp;cross.position.x=X;
    rod.position.x=(xp+X)/2;rod.scale.x=Math.max(tiny,X-xp);
    const left=lt>ST0?clamp(.5+3*Math.sin(th)):0,right=lt>ST0?1-left:1;
    const lw=Math.max(tiny,xp-.11-(cylL+.05)),rw=Math.max(tiny,(cylR-.05)-(xp+.11));
    chL.scale.x=lw;chL.position.x=cylL+.05+lw/2;chR.scale.x=rw;chR.position.x=xp+.11+rw/2;
    chL.material.opacity=(.06+.6*left)*steamOn;chR.material.opacity=(.06+.6*right)*steamOn;
    valve.position.x=Math.sin(th)*.45;
    wheel.rotation.z=th;crank.rotation.z=th;
    bar(conrod,V3(X,cylY,.15),V3(Px,Py,.15));conrod.position.z=.2;
    const ak=seg(lt,ST0+.5,ST0+1.5);arrow.visible=arrowHead.visible=ak>0;arrow.material.opacity=ak;arrow.rotation.z=-PI*.1;
    const ea=PI*.4;arrowHead.position.set(Cx+(R+.45)*Math.cos(ea),cylY+(R+.45)*Math.sin(ea),Cz);arrowHead.rotation.z=ea;
    puffs.forEach((p,i)=>{let best=-1;for(let k=CH.length-1;k>=0;k--){if(CH[k]<=lt){best=k;break;}}
      const k=best-Math.floor(i/3),c=CH[k];if(k<0||c===undefined){p.visible=false;return;}const u=(lt-c)/2.6;if(u>1){p.visible=false;return;}
      const j=i%3;p.visible=true;p.position.set(.8+u*1.2+Math.sin(c*7+j)*.3+j*.15,4.7+u*2.6+j*.12,(rnd(k+j)-.5)*.6);p.scale.setScalar(.5+u*2.2-j*.15);p.material.opacity=(1-u)*.38;});
    let act=-1;[1.5,4,7,10.5,14].forEach((s,i)=>{if(lt>=s)act=i;});
    hiMats.forEach((m,i)=>{const on=act===i&&lt<17;m.emissive.copy(LIN(on?0x9bd34a:0x000000));m.emissiveIntensity=on?.05+.05*Math.sin(lt*5):0;});
  }
  function cam(lt,mode){
    if(mode==='banner')return camPose([.9,2.15,0],10.2,.32+Math.sin(lt*.15)*.12,.12);
    const c=blendCams([{t:0,tg:[.9,2.1,0],d:17,yaw:.38,pitch:.2,sx:.09,sy:.03},{t:1.5,tg:[-4.5,1.7,0],d:10.5,yaw:.5,pitch:.14,sx:.09,sy:.03},
      {t:4,tg:[-4.2,2.7,0],d:9.6,yaw:.32,pitch:.16,sx:.09,sy:.03},{t:7,tg:[.4,2.3,0],d:8.6,yaw:.2,pitch:.14,sx:.09,sy:.03},
      {t:10.5,tg:[4.6,2.1,0],d:9.8,yaw:-.28,pitch:.12,sx:.09,sy:.03},{t:14,tg:[.9,2.2,0],d:17.5,yaw:.32,pitch:.18,sx:.09,sy:.03,dur:2},
      {t:17,tg:[.9,2.4,0],d:18.5,yaw:.08,pitch:.16,sx:.09,sy:.08,dur:3}],lt);
    return {...camPose(c.tg,c.d,c.yaw+Math.sin(lt*.25)*.04,c.pitch),sx:c.sx,sy:c.sy};
  }
  return {scene,update,cam,anchors:{boiler:()=>V3(-4.5,4.35,0),fire:()=>V3(-4.5,-.05,1.05),cylinder:()=>V3(0,.95,.9),wheel:()=>V3(Cx,.05,-.4),
    recip:()=>V3(0,3.75,.4),rotate:()=>V3(Cx,cylY+R+.75,Cz)}};
}

/* =====================================================================
   2차 산업 혁명 · 컨베이어
   ===================================================================== */
const CAR_T=[2.2,5.2,8.2,11.2,14.2,17.2],CV=1.71,CST=[-4.5,-1.5,1.5,4.5],CCOL=[0xd9544f,0x3f7fd9,0xe3a33b,0x3fae73,0x8e5fd6,0xe07ab0];
function buildConveyor(){
  const scene=new T.Scene(),root=new T.Group();scene.add(root);
  lights(scene,{sun:0xfff1dc,si:.95,dir:[-4,12,8],ss:11,hemi:.65,sky:0xe8eef5,ground:0x202020,fill:0xaac4ff,fi:.35});
  add(root,new T.BoxGeometry(18,.4,7),M(0x3b3e44,{r:.9}),0,-.2,0);
  add(root,new T.BoxGeometry(18.2,.06,.15),M(0xe3c04a,{r:.6}),0,.02,2.4,{cast:false});
  // 벨트
  const {tex}=canvasTex(256,32,(x)=>{x.fillStyle='#2b2f36';x.fillRect(0,0,256,32);x.fillStyle='#3d434c';for(let i=0;i<8;i++)x.fillRect(i*32,0,14,32);x.fillStyle='rgba(255,255,255,.08)';x.fillRect(0,0,256,3);});
  tex.wrapS=T.RepeatWrapping;tex.repeat.set(16,1);
  add(root,new T.BoxGeometry(16,.3,1.7),M(0x2a2d33,{m:.4,r:.5}),0,.95,0);
  const top=add(root,new T.PlaneGeometry(16,1.6),new T.MeshStandardMaterial({map:tex,roughness:.6,metalness:.2}),0,1.105,0,{cast:false});top.rotation.x=-PI/2;
  const rollers=[];for(let i=0;i<14;i++){const g=new T.CylinderGeometry(.16,.16,1.8,16);g.rotateX(PI/2);const r=add(root,g,M(0x7b828d,{m:.8,r:.3}),-7.6+i*1.17,.95,0,{cast:false});rollers.push(r);}
  for(let i=0;i<7;i++)[-.7,.7].forEach(z=>add(root,new T.BoxGeometry(.14,.8,.14),M(0x2a2d33,{m:.5,r:.5}),-7.2+i*2.4,.4,z));
  // 작업자와 전등
  const workers=CST.map((x,i)=>{const w=person({cloth:0x3c638c,hat:'helmet',helmet:0x9bd34a,pants:0x2b3f55});w.g.position.set(x,0,-1.45);root.add(w.g);return w;});
  const bulbs=[],beams=[],plights=[];
  CST.forEach(x=>{add(root,new T.CylinderGeometry(.02,.02,1.6,6),M(0x222222),x,5.4,-.3,{cast:false});
    const sh=add(root,new T.ConeGeometry(.5,.38,24,1,true),M(0x4a505a,{m:.7,r:.4,side:T.DoubleSide}),x,4.45,-.3,{cast:false});
    const b=add(root,new T.SphereGeometry(.13,14,10),M(0xffe9a8,{e:0xffd060,ei:0}),x,4.3,-.3,{cast:false,recv:false});bulbs.push(b);
    const beam=add(root,new T.ConeGeometry(1.5,3.2,32,1,true),new T.MeshBasicMaterial({color:0xffe1a0,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}),x,2.7,-.3,{cast:false,recv:false});beams.push(beam);
    const pl=new T.PointLight(0xffd890,0,6,2);pl.position.set(x,3.6,-.1);root.add(pl);plights.push(pl);});
  // 자동차
  function makeCar(color){
    const g=new T.Group(),paint=M(color,{m:.35,r:.32}),dark=M(0x1b1b1e,{r:.6}),chrome=M(0xd9dde3,{m:.95,r:.18});
    add(g,new T.BoxGeometry(1.9,.12,.86),M(0x55595f,{m:.6,r:.4}),0,.2,0);
    const body=new T.Group();body.position.y=.26;g.add(body);
    add(body,new T.BoxGeometry(1.86,.44,.9),paint,0,.22,0);
    add(body,new T.BoxGeometry(.95,.5,.86),paint,-.25,.67,0);
    add(body,new T.BoxGeometry(1.08,.06,.94),dark,-.25,.95,0);
    [.432,-.432].forEach(z=>{add(body,new T.PlaneGeometry(.36,.3),M(0xbfdcf0,{m:.2,r:.05,e:0x203040,ei:.3}),-.45,.7,z+(z>0?.002:-.002),{cast:false}).rotation.y=z>0?0:PI;
      add(body,new T.PlaneGeometry(.3,.3),M(0xbfdcf0,{m:.2,r:.05,e:0x203040,ei:.3}),-.05,.7,z+(z>0?.002:-.002),{cast:false}).rotation.y=z>0?0:PI;});
    [-1,1].forEach(s=>add(body,new T.BoxGeometry(.6,.05,.26),paint,.55,.02,s*.5));
    const wheels=[];[[.62,.48],[.62,-.48],[-.62,.48],[-.62,-.48]].forEach(([x,z])=>{const w=new T.Group();w.position.set(x,.27,z);g.add(w);
      const tg=new T.TorusGeometry(.19,.07,10,24);add(w,tg,dark,0,0,0);const hg=new T.CylinderGeometry(.1,.1,.08,14);hg.rotateX(PI/2);add(w,hg,chrome,0,0,0);
      for(let k=0;k<6;k++){const sp=add(w,new T.BoxGeometry(.2,.025,.02),chrome,0,0,0,{cast:false});sp.rotation.z=k*PI/6;}wheels.push(w);});
    const det=new T.Group();det.position.y=.26;g.add(det);
    add(det,new T.BoxGeometry(.06,.42,.6),chrome,.95,.24,0);
    [-1,1].forEach(s=>add(det,new T.SphereGeometry(.09,12,10),M(0xfff0b0,{e:0xffd060,ei:1.2}),.98,.42,s*.3,{cast:false}));
    const sw=new T.TorusGeometry(.12,.02,6,16);add(det,sw,dark,.1,.62,.16).rotation.y=PI/2;
    const {tex}=canvasTex(128,128,(x)=>{x.fillStyle='#4bd17a';x.beginPath();x.arc(64,64,58,0,TAU);x.fill();x.strokeStyle='#fff';x.lineWidth=14;x.lineCap='round';x.beginPath();x.moveTo(36,66);x.lineTo(56,86);x.lineTo(92,44);x.stroke();});
    const badge=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));badge.position.y=1.75;g.add(badge);
    root.add(g);return {g,body,wheels,det,badge};
  }
  const cars=CAR_T.map((_,i)=>makeCar(CCOL[i]));
  function update(lt){
    const bp=lt<2?0:CV*(lt-2);tex.offset.x=-bp/1;rollers.forEach(r=>r.rotation.z=-bp/.16);
    const on=lt<.8?0:lt<1.6?(Math.sin(lt*70)>0?1:.25):1;
    bulbs.forEach(b=>b.material.emissiveIntensity=2.2*on);beams.forEach(b=>b.material.opacity=.1*on);plights.forEach(p=>p.intensity=1.1*on);
    const acts=CST.map(s=>{let a=0;CAR_T.forEach((t0,i)=>{if(lt<t0)return;a=Math.max(a,1-Math.abs(-8.6+CV*(lt-t0)-s)/.9);});return clamp(a);});
    workers.forEach((w,i)=>{const a=acts[i],s=Math.abs(Math.sin(lt*12+i));w.armR.rotation.x=-(.75+.65*s*a);w.armL.rotation.x=-(.5+.4*a);w.head.rotation.x=.25*a;});
    cars.forEach((c,i)=>{const x=-8.6+CV*(lt-CAR_T[i]);c.g.visible=lt>=CAR_T[i]&&x<9.2;if(!c.g.visible)return;
      c.g.position.set(x,1.1,0);const k=CST.map(s=>eback(clamp((x-s)/.55)));
      c.body.visible=k[0]>0;c.body.scale.set(1,Math.max(tiny,k[0]),1);
      c.wheels.forEach(w=>{w.visible=k[1]>0;w.scale.setScalar(Math.max(tiny,k[1]));});
      c.det.visible=k[2]>0;c.det.scale.setScalar(Math.max(tiny,k[2]));
      c.badge.visible=k[3]>0;c.badge.scale.setScalar(Math.max(tiny,.55*k[3]));c.badge.position.y=1.75+Math.sin(lt*3+i)*.05;});
  }
  function cam(lt,mode){
    if(mode==='banner')return camPose([0,1.6,0],10.5,-.28+Math.sin(lt*.15)*.12,.28);
    const y=-.32+.36*eio(clamp(lt/21));return {...camPose([0,1.3,.2],15.5,y,.4),sx:0,sy:-.13};
  }
  return {scene,update,cam,anchors:Object.fromEntries(CST.map((x,j)=>['st'+j,()=>V3(x,.05,1.15)]))};
}

/* =====================================================================
   3차 산업 혁명 · 정보 사회
   ===================================================================== */
function buildInfo(){
  const scene=new T.Scene(),root=new T.Group();scene.add(root);
  scene.add(new T.HemisphereLight(0xbfe6ff,0x0a1422,.7));
  const key=new T.DirectionalLight(0xffffff,.9);key.position.set(3,8,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);
  fitShadow(key,10);scene.add(key);
  const rim=new T.PointLight(0x5bc8e6,1.6,20,2);rim.position.set(0,4,-3);scene.add(rim);
  const A=0x5bc8e6;
  add(root,new T.CylinderGeometry(9,9,.2,64),M(0x0c1c2e,{m:.5,r:.35}),0,-.1,0);
  const grid=new T.GridHelper(18,24,A,0x1e4a6a);grid.material.transparent=true;grid.material.opacity=.25;grid.position.y=.01;root.add(grid);
  // 뒤 네트워크
  const P=[];for(let i=0;i<46;i++)P.push(V3(-12+rnd(i)*24,-.5+rnd(i+50)*7.5,-5-rnd(i+90)*3));
  const pts=new T.Points(new T.BufferGeometry().setFromPoints(P),new T.PointsMaterial({color:0x8fe3ff,size:.12,transparent:true,opacity:.8}));root.add(pts);
  const segs=[];for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++)if(P[i].distanceTo(P[j])<3.6)segs.push(P[i],P[j]);
  root.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(segs),new T.LineBasicMaterial({color:A,transparent:true,opacity:.22})));
  const pk=[];for(let i=0;i<16;i++)pk.push(add(root,new T.SphereGeometry(.06,8,6),M(0xd6f6ff,{e:0xbff0ff,ei:2}),0,0,0,{cast:false,recv:false}));
  // ① 컴퓨터
  const comp=new T.Group();comp.position.set(-4.5,0,0);root.add(comp);
  add(comp,new T.BoxGeometry(3.0,1.9,.14),M(0x1a2632,{m:.4,r:.4}),0,2.05,0);
  const {tex:scr}=canvasTex(512,320,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0c2a44');g.addColorStop(1,'#081a2c');x.fillStyle=g;x.fillRect(0,0,w,h);
    x.strokeStyle='rgba(91,200,230,.25)';x.lineWidth=1;for(let i=0;i<w;i+=24){x.beginPath();x.moveTo(i,0);x.lineTo(i,h);x.stroke();}for(let i=0;i<h;i+=24){x.beginPath();x.moveTo(0,i);x.lineTo(w,i);x.stroke();}
    x.fillStyle='rgba(91,200,230,.6)';x.font='16px monospace';for(let i=0;i<10;i++)x.fillText((i*37%2)+''+(i%2)+'1'+(i*3%2),12,24+i*28);});
  add(comp,new T.PlaneGeometry(2.8,1.7),new T.MeshBasicMaterial({map:scr}),0,2.05,.075,{cast:false});
  const cube=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.9,.9,.9)),new T.LineBasicMaterial({color:0x8fe3ff}));cube.position.set(.15,2.05,.6);comp.add(cube);
  const cube2=new T.LineSegments(new T.EdgesGeometry(new T.OctahedronGeometry(.3)),new T.LineBasicMaterial({color:0xffd36b}));cube2.position.set(.15,2.05,.6);comp.add(cube2);
  add(comp,new T.BoxGeometry(.3,.8,.2),M(0x2a3f55,{m:.5,r:.4}),0,.7,0);add(comp,new T.BoxGeometry(1.2,.08,.7),M(0x2a3f55,{m:.5,r:.4}),0,.3,0);
  add(comp,new T.BoxGeometry(2.4,.1,.8),M(0x1d3247,{m:.4,r:.5}),0,.3,1.1);
  const keys=new T.InstancedMesh(new T.BoxGeometry(.16,.06,.16),M(0xffffff,{r:.5}),36);comp.add(keys);
  {const d=new T.Object3D();for(let i=0;i<36;i++){d.position.set(-1.05+(i%12)*.19,.38,.85+Math.floor(i/12)*.2);d.updateMatrix();keys.setMatrixAt(i,d.matrix);keys.setColorAt(i,new T.Color(0x2e4a66));}}
  // ② 로봇 팔
  const arm=new T.Group();arm.position.set(0,0,0);root.add(arm);
  const armM=M(0xdfe8f0,{m:.55,r:.3}),jointM=M(A,{m:.4,r:.3,e:0x2a7a90,ei:.5});
  const bg=new T.CylinderGeometry(.55,.65,.3,28);add(arm,bg,M(0x3a5874,{m:.5,r:.4}),0,.15,0);
  add(arm,new T.CylinderGeometry(.3,.35,.5,24),armM,0,.55,0);
  const jS=add(arm,new T.SphereGeometry(.24,20,14),jointM,0,.9,0),jE=add(arm,new T.SphereGeometry(.19,18,12),jointM,0,0,0);
  const up=add(arm,new T.BoxGeometry(1,.26,.3),armM),fo=add(arm,new T.BoxGeometry(1,.2,.24),armM);
  const grip=new T.Group();arm.add(grip);add(grip,new T.BoxGeometry(.3,.1,.3),M(0x9fb3c6,{m:.6,r:.35}),0,0,0);
  const fL=add(grip,new T.BoxGeometry(.05,.24,.2),M(0xe8eef5,{m:.6,r:.3}),-.12,-.15,0),fR=add(grip,new T.BoxGeometry(.05,.24,.2),M(0xe8eef5,{m:.6,r:.3}),.12,-.15,0);
  const pad=[-1,1].map(s=>add(arm,new T.BoxGeometry(1.1,.14,.8),M(0x24405c,{m:.3,r:.5}),s*1.55,.07,0));
  const boxM=M(0xe3a33b,{r:.6});const boxA=add(arm,new T.BoxGeometry(.42,.42,.42),boxM),boxB=add(arm,new T.BoxGeometry(.42,.42,.42),boxM.clone()),boxC=add(arm,new T.BoxGeometry(.42,.42,.42),boxM.clone());
  const led=add(arm,new T.SphereGeometry(.08,10,8),M(0x4bd17a,{e:0x4bd17a,ei:2}),.45,.42,.3,{cast:false});
  // ③ 스마트폰 + 지구
  const phone=new T.Group();phone.position.set(3.9,0,.2);root.add(phone);
  add(phone,new T.BoxGeometry(1.15,2.25,.14),M(0x0b0f14,{m:.6,r:.25}),0,2.0,0);
  const pc=canvasTex(256,512,()=>{});
  add(phone,new T.PlaneGeometry(1.02,2.05),new T.MeshBasicMaterial({map:pc.tex}),0,2.0,.075,{cast:false});
  add(phone,new T.BoxGeometry(.5,.12,.4),M(0x1d3247),0,.06,0);
  const globe=new T.Group();globe.position.set(5.6,1.9,-.4);root.add(globe);
  add(globe,new T.SphereGeometry(.92,40,30),M(0x123a5a,{m:.2,r:.4,e:0x0a2a44,ei:.6}),0,0,0);
  const gw=new T.Mesh(new T.SphereGeometry(.95,20,14),new T.MeshBasicMaterial({color:A,wireframe:true,transparent:true,opacity:.35}));globe.add(gw);
  const gp=[];for(let i=0;i<160;i++){const u=rnd(i)*2-1,a=rnd(i+300)*TAU,s=Math.sqrt(1-u*u);gp.push(V3(Math.cos(a)*s*.97,u*.97,Math.sin(a)*s*.97));}
  globe.add(new T.Points(new T.BufferGeometry().setFromPoints(gp),new T.PointsMaterial({color:0xbff0ff,size:.05})));
  const ring=add(globe,new T.TorusGeometry(1.25,.015,6,64),M(A,{e:A,ei:1}),0,0,0,{cast:false});ring.rotation.x=1.2;
  const arcs=[[V3(-3.4,3.2,0),V3(-.6,1.9,0)],[V3(.6,1.9,0),V3(3.4,3.0,.2)],[V3(4.4,3.0,.2),V3(5.2,2.6,-.4)]].map(([a,b])=>{const m=a.clone().lerp(b,.5);m.y+=1.3;const c=new T.QuadraticBezierCurve3(a,m,b);
    root.add(new T.Line(new T.BufferGeometry().setFromPoints(c.getPoints(40)),new T.LineBasicMaterial({color:0x8fe3ff,transparent:true,opacity:.55})));return c;});
  const arcP=[];arcs.forEach((c,k)=>{for(let q=0;q<3;q++)arcP.push({c,k,q,m:add(root,new T.SphereGeometry(.07,10,8),M(0xffffff,{e:0xd6f6ff,ei:2.5}),0,0,0,{cast:false,recv:false})});});
  const items=[comp,arm,[phone,globe]];
  const L1=1.5,L2=1.26,base=V3(0,.9,0);
  function armPose(lt){
    const c=((lt-5.4)/2.4%1+1)%1;let m,carry=false;if(c<.15){m=0;carry=true;}else if(c<.5){m=eio((c-.15)/.35);carry=true;}else if(c<.65)m=1;else m=1-eio((c-.65)/.35);
    const lift=(c>.15&&c<.5)||(c>.65)?Math.sin(PI*(c<.5?(c-.15)/.35:(c-.65)/.35)):0;
    const a1=lerp(-2.0,-1.1416,m),a2=lerp(2.3,.8416,m)-.7*lift;
    const e=V3(base.x+L1*Math.cos(a1),base.y-L1*Math.sin(a1),0),g=V3(e.x+L2*Math.cos(a2),e.y-L2*Math.sin(a2),0);return {c,carry,e,g};}
  function update(lt){
    const ks=[.8,5,9.5].map(t=>eback(seg(lt,t,t+.8)));
    items.forEach((it,i)=>[].concat(it).forEach(o=>{o.visible=ks[i]>0;o.scale.setScalar(Math.max(tiny,ks[i]));}));
    cube.rotation.set(lt*.5,lt*.8,0);cube2.rotation.set(-lt*.7,lt*.4,0);
    for(let i=0;i<36;i++)keys.setColorAt(i,new T.Color(Math.floor(lt*8+i*3)%9===0?A:0x2e4a66));keys.instanceColor.needsUpdate=true;
    const ap=armPose(lt);jE.position.copy(ap.e);bar(up,base,ap.e);bar(fo,ap.e,ap.g);grip.position.set(ap.g.x,ap.g.y-.1,0);
    const open=ap.carry&&ap.c<.5?0:.06;fL.position.x=-.12-open;fR.position.x=.12+open;
    boxA.visible=!(ap.carry&&ap.c<.5);boxA.position.set(-1.55,.35,0);
    boxB.visible=ap.carry&&ap.c<.5;boxB.position.set(ap.g.x,ap.g.y-.45,0);
    const sl=ap.c<.5?-1:ap.c<.65?0:(ap.c-.65)/.35;boxC.visible=sl>=0;boxC.position.set(1.55+Math.max(0,sl)*.9,.35,0);boxC.material.opacity=1;
    led.material.emissiveIntensity=Math.sin(lt*6)>0?2.5:.3;
    const lt3=lt-9.5,x=pc.ctx;x.clearRect(0,0,256,512);const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,'#14324e');g.addColorStop(1,'#0e2238');x.fillStyle=g;x.fillRect(0,0,256,512);
    ['안녕! 👋','사진 보낼게','📷 바다 사진','좋아요 👍','내일 봐!'].forEach((m,j)=>{const k=eo(seg(lt3,.6+j*.75,1+j*.75));if(k<=0)return;const mine=j%2===1,w=170,yy=40+j*84;x.globalAlpha=k;
      x.fillStyle=mine?'#5bc8e6':'#e8eef5';x.beginPath();x.roundRect?x.roundRect(mine?256-16-w:16,yy,w,58,18):x.rect(mine?256-16-w:16,yy,w,58);x.fill();
      x.fillStyle='#0b1c2c';x.font='bold 24px "Noto Sans KR","Malgun Gothic","Segoe UI Emoji",sans-serif';x.textAlign='center';x.fillText(m,(mine?256-16-w:16)+w/2,yy+38);x.globalAlpha=1;});
    pc.tex.needsUpdate=true;
    globe.rotation.y=lt*.35;
    pk.forEach((p,i)=>{const a=P[(i*7)%P.length],b=P[(i*7+3)%P.length],u=(lt*.3+rnd(i))%1;p.position.lerpVectors(a,b,u);});
    arcP.forEach(o=>{const on=[seg(lt,1.5,2.5),seg(lt,5.8,6.8),seg(lt,10.2,11.2)][o.k];const u=(lt*.5+o.q/3+o.k*.2)%1;o.m.visible=on>0;o.m.position.copy(o.c.getPoint(u));o.m.scale.setScalar(on);});
  }
  function cam(lt,mode){
    if(mode==='banner')return camPose([.6,1.9,0],9.6,Math.sin(lt*.18)*.16,.14);
    return {...camPose([0,1.62,0],13.2,Math.sin(lt*.22)*.07,.1),sx:0,sy:.02};
  }
  return {scene,update,cam,anchors:{c0:()=>V3(-4.5,3.35,0),c1:()=>V3(0,3.35,0),c2:()=>V3(4.6,3.35,0)}};
}

/* =====================================================================
   4차 산업 혁명 · 지능 정보 사회
   ===================================================================== */
const DEV=['🏭','🚗','🏠','🥽','🚁','⌚'];
function buildAI(){
  const scene=new T.Scene(),root=new T.Group();scene.add(root);
  scene.add(new T.HemisphereLight(0xd8d0ff,0x120f24,.75));
  const key=new T.DirectionalLight(0xffffff,.85);key.position.set(4,9,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);fitShadow(key,10);scene.add(key);
  const A=0xa99cf0;
  const hub=new T.Group();hub.position.set(-2.7,2.2,0);root.add(hub);
  const coreLight=new T.PointLight(0xb8a8ff,2.4,12,2);hub.add(coreLight);
  const core=add(hub,new T.IcosahedronGeometry(.85,1),M(0x2a2258,{m:.3,r:.3,e:0x5a48c8,ei:.6,flat:true}),0,0,0);
  const wire=new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(1.05,1)),new T.LineBasicMaterial({color:0xcfc6ff,transparent:true,opacity:.7}));hub.add(wire);
  const inner=add(hub,new T.SphereGeometry(.45,24,18),M(0xffffff,{e:0xc8b8ff,ei:2.2}),0,0,0,{cast:false});
  const rings=[1.5,1.85].map((r,i)=>{const m=add(hub,new T.TorusGeometry(r,.03,8,96),M(A,{e:A,ei:1.2}),0,0,0,{cast:false});m.rotation.x=PI/2+(i?.5:-.4);return m;});
  const {tex:aiTex}=canvasTex(256,128,(x)=>{x.fillStyle='#fff';x.font='bold 96px "Noto Sans KR","Malgun Gothic",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('AI',128,70);});
  const aiLabel=new T.Sprite(new T.SpriteMaterial({map:aiTex,transparent:true,depthWrite:false,depthTest:false}));aiLabel.scale.set(1.1,.55,1);hub.add(aiLabel);
  add(root,new T.CylinderGeometry(4.4,4.6,.25,64),M(0x1a1534,{m:.5,r:.35}),-2.7,-.12,0);
  const glowRing=add(root,new T.TorusGeometry(4.45,.04,8,96),M(A,{e:A,ei:1.4}),-2.7,.02,0,{cast:false});glowRing.rotation.x=PI/2;
  const devs=DEV.map(ch=>{const g=new T.Group();root.add(g);
    add(g,new T.CylinderGeometry(.5,.55,.18,6),M(0x241d48,{m:.4,r:.35}),0,0,0);
    add(g,new T.TorusGeometry(.5,.03,6,6),M(A,{e:A,ei:1.4}),0,.1,0,{cast:false}).rotation.x=PI/2;
    const s=emojiSprite(ch,.75);s.position.y=.6;g.add(s);
    const ln=new T.Line(new T.BufferGeometry().setFromPoints([V3(0,0,0),V3(1,0,0)]),new T.LineBasicMaterial({color:A,transparent:true,opacity:.5}));root.add(ln);
    const pin=add(root,new T.SphereGeometry(.08,10,8),M(0x7fe0ff,{e:0x7fe0ff,ei:2.5}),0,0,0,{cast:false,recv:false});
    const pout=add(root,new T.SphereGeometry(.08,10,8),M(0xffd36b,{e:0xffd36b,ei:2.5}),0,0,0,{cast:false,recv:false});
    return {g,ln,pin,pout};});
  const stars=[];for(let i=0;i<220;i++)stars.push(V3(-16+rnd(i)*32,-1+rnd(i+40)*12,-6-rnd(i+80)*8));
  root.add(new T.Points(new T.BufferGeometry().setFromPoints(stars),new T.PointsMaterial({color:0xcfc6ff,size:.07,transparent:true,opacity:.7})));
  // 식당 + 서빙 로봇
  const din=new T.Group();din.position.set(3.9,-.3,3.6);root.add(din);
  add(din,new T.CylinderGeometry(2.3,2.4,.2,48),M(0x2b2448,{m:.3,r:.5}),0,-.1,0);
  const dl=new T.PointLight(0xffe0b0,1.2,6,2);dl.position.set(-.3,2.6,.8);din.add(dl);
  add(din,new T.CylinderGeometry(.85,.85,.08,32),M(0xd8c7a6,{r:.6}),-.7,1.0,0);add(din,new T.CylinderGeometry(.08,.12,1,10),M(0x8a7a6a),-.7,.5,0);
  [[-.7,.25],[.05,.12]].forEach(([x,z])=>add(din,new T.CylinderGeometry(.14,.12,.12,16),M(0xffffff,{r:.4}),x-.2+(z>.2?0:.4),1.1,z));
  const ppl=[[-1.75,0,0xe98a5a,PI/2],[.35,0,0x6fb3e0,-PI/2]].map(([x,z,c,ry])=>{const p=person({cloth:c,hair:0x2b2118,pants:0x40394f});p.g.position.set(x,0,z);p.g.rotation.y=ry;din.add(p.g);
    p.legL.rotation.x=p.legR.rotation.x=-1.3;p.g.position.y=-.32;p.armL.rotation.x=p.armR.rotation.x=-1.1;return p;});
  const bot=new T.Group();din.add(bot);
  const white=M(0xeeedf6,{m:.25,r:.3});
  add(bot,new T.CylinderGeometry(.42,.48,.5,28),white,0,.32,0);
  [-.3,.3].forEach(z=>{const w=new T.CylinderGeometry(.09,.09,.06,14);w.rotateX(PI/2);add(bot,w,M(0x222222),.25,.08,z);add(bot,w.clone(),M(0x222222),-.25,.08,z);});
  [.95,1.45].forEach(y=>add(bot,new T.CylinderGeometry(.42,.42,.05,28),white,0,y,0));
  [[.28,.28],[-.28,.28],[.28,-.28],[-.28,-.28]].forEach(([x,z])=>add(bot,new T.CylinderGeometry(.025,.025,1.5,8),M(0xcfcbe0,{m:.6,r:.3}),x,1.2,z));
  add(bot,new T.CylinderGeometry(.12,.1,.16,14),M(0xffffff),.12,1.07,.08);add(bot,new T.BoxGeometry(.22,.14,.18),M(0xe3a33b),-.12,1.05,-.05);add(bot,new T.SphereGeometry(.11,12,10),M(0xd9544f),0,1.56,0);
  const head=new T.Group();head.position.y=2.15;bot.add(head);
  add(head,new T.BoxGeometry(.7,.48,.42),M(0x1b1830,{r:.35,m:.2}),0,0,0);
  const eyes=[-1,1].map(s=>add(head,new T.SphereGeometry(.06,10,8),M(0x7fe0ff,{e:0x7fe0ff,ei:2.5}),.22,.03,s*.12,{cast:false}));
  add(head,new T.CylinderGeometry(.015,.015,.25,6),M(0xcfcbe0),0,.36,0);const ant=add(head,new T.SphereGeometry(.05,8,6),M(0x7fe0ff,{e:0x7fe0ff,ei:2}),0,.5,0,{cast:false});
  function update(lt){
    const pu=.5+.5*Math.sin(lt*3),hk=eo(seg(lt,.3,1));hub.scale.setScalar(Math.max(tiny,hk));
    core.rotation.set(lt*.3,lt*.5,0);wire.rotation.set(-lt*.2,lt*.35,0);inner.scale.setScalar(.9+.15*pu);inner.material.emissiveIntensity=1.6+pu;coreLight.intensity=1.8+1.2*pu;
    rings[0].rotation.z=lt*.6;rings[1].rotation.z=-lt*.45;
    devs.forEach((d,i)=>{const k=eback(seg(lt,.8+i*.25,1.4+i*.25)),an=lt*.18+i*PI/3;d.g.visible=k>0;d.g.scale.setScalar(Math.max(tiny,k));
      const p=V3(hub.position.x+3.3*Math.cos(an),.15+Math.sin(lt*1.5+i)*.08,hub.position.z+2.2*Math.sin(an));d.g.position.copy(p);
      const top=p.clone().add(V3(0,.25,0)),hc=hub.position;d.ln.geometry.setFromPoints([hc,top]);d.ln.visible=k>0;
      const on=seg(lt,2.5,3.2),u=(lt*.7+i*.17)%1,v=(lt*.7+i*.17+.5)%1;d.pin.visible=d.pout.visible=on>0&&k>0;
      d.pin.position.lerpVectors(top,hc,u);d.pout.position.lerpVectors(hc,top,v);});
    const sk=eo(seg(lt,8.4,9.2));din.visible=sk>0;din.scale.setScalar(Math.max(tiny,sk));
    const rx=lerp(3.2,.95,eio(seg(lt,9.2,13))),moving=lt>9.2&&lt<13;bot.position.set(rx,Math.abs(Math.sin(lt*10))*.02*(moving?1:0),.1);bot.rotation.y=PI;
    const blink=(lt%3)<.12;eyes.forEach(e=>e.scale.set(1,blink?.15:1,1));ant.material.emissiveIntensity=1.2+Math.sin(lt*6)*1;
    ppl.forEach((p,i)=>{p.head.rotation.y=lt>13.1?(i?.5:-.5)*eo(seg(lt,13.1,13.6)):0;});
  }
  function cam(lt,mode){
    if(mode==='banner')return camPose([.6,1.8,1],11,Math.sin(lt*.15)*.14-.05,.2);
    return {...camPose([.9,1.25,1.3],12.6,-.18+.28*eio(clamp(lt/17)),.26),sx:0,sy:-.02};
  }
  const an={robot:()=>bot.localToWorld(V3(0,2.65,0))};DEV.forEach((_,i)=>an['dev'+i]=()=>devs[i].g.localToWorld(V3(0,-.35,0)));
  return {scene,update,cam,anchors:an};
}

/* ---------- 렌더 ---------- */
const BUILD={agri:buildAgri,steam:buildSteam,conveyor:buildConveyor,info:buildInfo,ai:buildAI};
const S={},camera=new T.PerspectiveCamera(35,16/9,.1,200);
function get(k){if(!S[k]&&BUILD[k]){S[k]=BUILD[k]();S[k].camera=camera.clone();}return S[k];}
function render(key,lt,w,h,mode='main'){
  const s=get(key);if(!s)return null;
  const cap=Math.min(1,1600/Math.max(1,w)),rw=Math.max(2,Math.round(w*cap)),rh=Math.max(2,Math.round(h*cap));
  const el=renderer.domElement;if(el.width!==rw||el.height!==rh)renderer.setSize(rw,rh,false);
  s.update(lt,mode);const c=s.cam(lt,mode),cam=s.camera;
  cam.fov=35;cam.aspect=rw/rh;cam.position.copy(c.pos);cam.lookAt(c.tg);
  if(c.sx||c.sy)cam.setViewOffset(rw,rh,c.sx*rw,c.sy*rh,rw,rh);else cam.clearViewOffset();
  cam.updateProjectionMatrix();
  renderer.render(s.scene,cam);s.ready=true;return el;
}
function project(key,name){const s=S[key];if(!s||!s.ready||!s.anchors[name])return null;const v=s.anchors[name]().project(s.camera);return {x:(v.x+1)/2,y:(1-v.y)/2,vis:v.z<1};}
window.S3={ok:true,render,project,carTimes:CAR_T};
})();
