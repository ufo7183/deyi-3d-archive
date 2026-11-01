import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {gsap} from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';

const years=Array.from({length:22},(_,i)=>2023-i);
const works={
  2023:['等露','尋常院','借墨','掬茶金'],
  2022:['海洋恰恰','知一二','金宴'],
  2021:['一院九樹','山茶花森','花曆河','日光耶加'],
  2018:['白鹿山丘','18富','大藏'],
  2017:['和簷．悅舍','河日子','得邑萬市興'],
  2016:['里山六帖','早稻墅','得邑希真'],
  2015:['得邑倫敦大道','得邑巨商','墨問'],
  2014:['得邑．羅森堡','得邑捷市堡','得邑大道東','得邑道後'],
  2013:['得邑愛丁堡Ⅱ','得邑獅子堡','得邑香波堡Ⅱ','得邑佩納堡'],
  2009:['寬御','河堤大樂 No. 12','青年巨商No.13','青年巨商No.15']
};
const $=sel=>document.querySelector(sel);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,140);
camera.position.set(0,6.2,34);
camera.lookAt(0,-0.8,0);
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
$('#scene').appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff,2.3));
const key=new THREE.DirectionalLight(0xffefd2,3.2);key.position.set(-6,12,16);scene.add(key);
const rim=new THREE.DirectionalLight(0xffdca4,1.15);rim.position.set(8,4,-5);scene.add(rim);
const stage=new THREE.Group();stage.rotation.x=-0.18;scene.add(stage);
const goldEdge=new THREE.MeshStandardMaterial({color:0xd3b57b,metalness:.45,roughness:.28});
const cardShape=new THREE.BoxGeometry(3.15,4.65,.19);
const C=years.length;
const cards=[];
function path(g,points,color){g.fillStyle=color;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()}
function elliptic(g,x,y,rx,ry,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()}
function building(g,seed){
 const shades=[['#e9ddc6','#c0ad8d','#978975'],['#deded4','#c0bdb1','#858e91'],['#e9d9c4','#d0b28d','#9f8a78'],['#e8e2d7','#b7b5aa','#8d928f']];
 const p=shades[seed%shades.length], bx=238+(seed%3)*11, by=345-(seed%4)*19, bw=225+(seed%2)*28, bottom=788, dep=48;
 g.save();g.shadowColor='rgba(63,69,57,.20)';g.shadowBlur=21;g.shadowOffsetY=15;
 path(g,[[bx,by],[bx+bw,by-13],[bx+bw,bottom],[bx,bottom+7]],p[0]);
 path(g,[[bx+bw,by-13],[bx+bw+dep,by+10],[bx+bw+dep,bottom-10],[bx+bw,bottom]],p[1]);
 path(g,[[bx,by],[bx+dep,by-37],[bx+bw+dep,by-38],[bx+bw,by-13]],'#f1eadb');
 g.restore();
 g.fillStyle='#fff8ee';g.fillRect(bx+14,by+12,bw-28,10);
 const floors=10;for(let floor=0;floor<floors;floor++){
  const yy=by+36+floor*((bottom-by-65)/floors);
  g.fillStyle=p[2];g.fillRect(bx+5,yy,bw-10,3);
  for(let col=0;col<4;col++){
   const w=33,xx=bx+19+col*(bw-38)/4;
   const glass=g.createLinearGradient(xx,0,xx+w,0);glass.addColorStop(0,'#6c939f');glass.addColorStop(.52,'#d8e9e8');glass.addColorStop(1,'#829aa1');
   g.fillStyle=glass;g.fillRect(xx,yy+6,w,22);
   g.fillStyle='#f3ede2';g.fillRect(xx-4,yy+28,w+9,5)
  }
  g.fillStyle='#9f9b8b';g.fillRect(bx+bw+8,yy+8,26,4);
 }
 g.fillStyle='#e9e1d2';g.fillRect(bx-21,bottom-25,bw+37,22);
 g.fillStyle='#687e76';g.fillRect(bx+15,bottom-7,bw-30,11);
}
function tree(g,x,y,seed,scale=1){
 g.save();g.translate(x,y);g.scale(scale,scale);
 g.strokeStyle='#796d4f';g.lineWidth=9;g.lineCap='round';
 g.beginPath();g.moveTo(0,30);g.lineTo(0,-94);g.lineTo(-34,-141);g.moveTo(0,-79);g.lineTo(47,-141);g.stroke();
 const variants=['#729268','#91a56b','#638969','#b2b376','#8fa86a'];
 for(let i=0;i<28;i++){
  const a=i*2.4+seed, rr=Math.sqrt(i/28);
  const x=Math.cos(a)*(60*rr),y=-156+Math.sin(a)*(50*rr);
  elliptic(g,x,y,28+seed%5,20,variants[(i+seed)%5]);
 }
 g.restore();
}
function cover(year){
 const c=document.createElement('canvas');c.width=640;c.height=930;const g=c.getContext('2d');const seed=year-2000;
 const paper=g.createLinearGradient(0,0,640,930);paper.addColorStop(0,'#fffefb');paper.addColorStop(.55,'#fcfaf4');paper.addColorStop(1,'#ede3ce');
 g.fillStyle=paper;g.fillRect(0,0,640,930);
 g.strokeStyle='#c4a16b';g.lineWidth=3;g.strokeRect(17,17,606,896);
 g.strokeStyle='#f1e7d7';g.lineWidth=2;g.strokeRect(28,28,584,874);
 g.fillStyle='#766349';g.font='500 13px Georgia';g.textAlign='right';g.fillText('DEYI',580,65);g.fillText('ARCHITECTURE',580,84);g.fillText('COLLECTION',580,103);
 g.textAlign='left';g.fillStyle='#b58b4c';g.font='500 93px Georgia';g.fillText(String(year),57,129);
 g.fillStyle='#4d4235';g.font='500 28px "Noto Serif TC",serif';
 const title=works[year]?.[0]||'年度建築典藏';g.fillText(title,58,189,495);
 g.strokeStyle='#bfa371';g.lineWidth=2;g.beginPath();g.moveTo(58,207);g.lineTo(578,207);g.stroke();
 g.save();g.beginPath();g.rect(35,226,570,630);g.clip();
 const skies=[['#c8dcef','#fef6e7'],['#b4d4dd','#fff2df'],['#d8dfdc','#fff6e7'],['#c4dce4','#fff6ed']];
 const sky=skies[seed%4],grad=g.createLinearGradient(0,229,0,825);grad.addColorStop(0,sky[0]);grad.addColorStop(.72,sky[1]);grad.addColorStop(1,'#d8ceac');g.fillStyle=grad;g.fillRect(35,226,570,630);
 const sun=g.createRadialGradient(469,346,6,469,346,146);sun.addColorStop(0,'rgba(255,255,230,.97)');sun.addColorStop(.3,'rgba(255,244,208,.54)');sun.addColorStop(1,'rgba(255,244,208,0)');g.fillStyle=sun;g.fillRect(310,210,320,350);
 for(let i=0;i<7;i++){elliptic(g,90+i*85,438+(i%3)*16,96,22,'rgba(255,255,255,.34)')}
 path(g,[[35,687],[104,664],[196,671],[286,653],[401,671],[529,634],[605,670],[605,856],[35,856]],'#b6c9ae');
 path(g,[[35,742],[157,703],[271,722],[386,681],[505,713],[605,688],[605,856],[35,856]],'#86a083');
 building(g,seed);
 path(g,[[50,855],[229,754],[382,749],[594,855]],'#dbd4bf');
 path(g,[[108,855],[256,757],[363,757],[530,855]],'#efebe2');
 g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=6;g.beginPath();g.moveTo(267,760);g.lineTo(164,855);g.moveTo(350,761);g.lineTo(478,855);g.stroke();
 tree(g,155,753,seed,1.05);tree(g,544,781,seed+3,.87);
 for(let i=0;i<13;i++){elliptic(g,50+i*46,820+((i*13)%23),24,13,i%2?'#819f65':'#71945e')}
 g.restore();
 // Fashion-editorial white sweep and elegant gold corner accent.
 path(g,[[35,836],[183,806],[321,839],[474,806],[605,784],[605,887],[35,887]],'rgba(255,255,255,.9)');
 g.strokeStyle='#d4b178';g.lineWidth=2;g.beginPath();g.moveTo(35,838);g.bezierCurveTo(180,788,344,870,605,782);g.stroke();
 path(g,[[520,887],[605,800],[605,887]],'#debd85');
 g.fillStyle='#806a4e';g.font='500 15px Georgia';g.textAlign='left';g.fillText('DE-YI CONSTRUCTION',58,896);
 g.textAlign='right';g.fillStyle='#b3915f';g.font='12px Georgia';g.fillText('VOL. '+String(year),576,896);
 return c;
}
function backCover(){
 const c=document.createElement('canvas');c.width=640;c.height=930;const g=c.getContext('2d');
 const grd=g.createLinearGradient(0,0,640,930);grd.addColorStop(0,'#fdf9f0');grd.addColorStop(1,'#e6dcc8');g.fillStyle=grd;g.fillRect(0,0,640,930);
 for(let inset=24;inset<=68;inset+=22){g.strokeStyle='#ba9d6f';g.lineWidth=inset===24?4:1;g.strokeRect(inset,inset,640-inset*2,930-inset*2)}
 g.strokeStyle='#baa275';g.lineWidth=2;g.beginPath();g.arc(320,465,160,0,Math.PI*2);g.stroke();
 g.fillStyle='#8d7046';g.textAlign='center';g.font='600 53px "Noto Serif TC",serif';g.fillText('得 邑',320,466);g.font='18px Georgia';g.fillText('DE-YI ARCHITECTURAL ARCHIVE',320,510);return c;
}
const backTex=new THREE.CanvasTexture(backCover());backTex.colorSpace=THREE.SRGBColorSpace;
years.forEach((year,i)=>{
 const group=new THREE.Group();
 const tex=new THREE.CanvasTexture(cover(year));tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 const mesh=new THREE.Mesh(cardShape,[goldEdge,goldEdge,goldEdge,goldEdge,new THREE.MeshStandardMaterial({map:tex,metalness:0,roughness:.8}),new THREE.MeshStandardMaterial({map:backTex,metalness:0,roughness:.8})]);
 group.add(mesh);stage.add(group);cards.push({year,index:i,group,mesh});mesh.userData.index=i;group.scale.setScalar(.01);
});
document.fonts?.ready.then(()=>{cards.forEach(c=>{const t=c.mesh.material[4].map;t.image=cover(c.year);t.needsUpdate=true})});
// A single forward-tilted, bowl-shaped loop. The rear semicircle rises above the front cards.
const track={
 x:[0,5.55,10.45,14.4,17.6,18.3,15.4,12.5,9,5.7,2.8,0],
 z:[13.6,11.5,8.7,5.8,3,0,-2.6,-5,-7.5,-9.5,-11,-12],
 y:[-1,-1.22,-1.15,-.9,-.15,.45,1.6,2,2.3,2.4,2.5,2.6],
 size:[1.79,1.22,.94,.75,.58,.45,.4,.36,.31,.28,.26,.24]
};
const steps=track.x.length-1;
let cursor=0,target=0,dragging=false,dragged=false,dragOrigin=0,dragCursor=0,locked=false,active=null;
function mod(n){return ((n%C)+C)%C}
function wrapped(v){while(v>C/2)v-=C;while(v< -C/2)v+=C;return v}
function interpolate(field,d){const j=Math.min(steps,Math.floor(d)),h=Math.min(steps,j+1),t=d-j;return THREE.MathUtils.lerp(track[field][j],track[field][h],t)}
function layout(c,off,time,force=false){
 const n=Math.abs(off),side=Math.sign(off)||0;c.group.visible=n<=steps+.1;
 if(!c.group.visible)return;
 const targetX=side*interpolate('x',n),targetZ=interpolate('z',n),targetY=interpolate('y',n)+(reduced?0:Math.sin(time*.65+c.index*.6)*.045);
 const desired=interpolate('size',n);
 const p=c.group.position,e=force?1:.13;
 p.x+=(targetX-p.x)*e;p.y+=(targetY-p.y)*e;p.z+=(targetZ-p.z)*e;
 c.group.rotation.y+=(side*Math.min(.82,n*.14)-c.group.rotation.y)*e;
 c.group.rotation.x+=(-Math.min(n*.025,.18)-c.group.rotation.x)*e;
 c.group.rotation.z+=(-side*Math.min(.13,n*.019)-c.group.rotation.z)*e;
 const scale=c.group.scale.x+(desired-c.group.scale.x)*(force?1:.13);c.group.scale.setScalar(scale);
}
function label(){const idx=mod(Math.round(target)),year=years[idx];$('#focus-year').textContent=year;$('#focus-desc').textContent=(works[year]||[]).join(' · ')||'經典作品典藏';$('#open-label').textContent='探索 '+year+' 年'}
function select(index){if(locked)return;const nearest=Math.round(target);const i=mod(index);const adjustment=wrapped(i-mod(nearest));target=nearest+adjustment;label()}
function move(n){select(mod(Math.round(target)+n))}
const view=$('#scene');
view.addEventListener('pointerdown',e=>{if(locked)return;dragging=true;dragged=false;dragOrigin=e.clientX;dragCursor=target;view.classList.add('dragging');renderer.domElement.setPointerCapture(e.pointerId)});
view.addEventListener('pointermove',e=>{if(!dragging||locked)return;let d=e.clientX-dragOrigin;if(Math.abs(d)>7)dragged=true;target=dragCursor-d/(innerWidth<700?92:180);label()});
function stopDrag(e){if(!dragging)return;dragging=false;view.classList.remove('dragging');target=Math.round(target);label();if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId)}
view.addEventListener('pointerup',stopDrag);view.addEventListener('pointercancel',stopDrag);
const raycaster=new THREE.Raycaster(),ndc=new THREE.Vector2();
renderer.domElement.addEventListener('click',e=>{
 if(dragged||locked)return;
 const r=renderer.domElement.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
 raycaster.setFromCamera(ndc,camera);
 const hits=raycaster.intersectObjects(cards.filter(c=>c.group.visible).map(c=>c.mesh));
 if(hits.length){const i=hits[0].object.userData.index;if(i===mod(Math.round(target)))openYear();else select(i)}
 else openYear();
});
$('#prev').addEventListener('click',()=>move(-1));$('#next').addEventListener('click',()=>move(1));
$('#shuffle').addEventListener('click',()=>select(Math.floor(Math.random()*C)));
$('#explore').addEventListener('click',openYear);
years.forEach((year,i)=>{const b=document.createElement('button');b.textContent=year;b.addEventListener('click',()=>{$('#index').classList.remove('open');select(i)});$('#year-grid').appendChild(b)});
$('#all-years').addEventListener('click',()=>$('#index').classList.add('open'));
$('#close-index').addEventListener('click',()=>$('#index').classList.remove('open'));
function openYear(){
 if(locked)return;locked=true;target=Math.round(target);active=cards[mod(target)];
 const c=active;gsap.timeline({onComplete:()=>showYear(c.year)})
 .to(c.group.position,{x:0,y:-2,z:17.6,duration:reduced?0:.7,ease:'power3.inOut'})
 .to(c.group.rotation,{x:0,y:Math.PI,z:0,duration:reduced?0:.65,ease:'power3.inOut'},'<');
}
function showYear(year){
 $('#detail-year').textContent=year;$('#projects').replaceChildren();
 const list=works[year]||[];
 if(list.length){list.forEach(title=>{const box=document.createElement('article');box.className='project';const strong=document.createElement('strong');strong.textContent=title;const sub=document.createElement('span');sub.textContent='得邑建設經典作品';box.append(strong,sub);$('#projects').appendChild(box)})}
 else{const p=document.createElement('p');p.textContent='此年份尚待匯入完整作品名稱，請參考官網原始資料。';$('#projects').appendChild(p)}
 $('#official').href='https://www.de-yi.com.tw/'+year+'.htm';
 $('#detail').classList.add('open');$('#close-detail').focus();
}
function closeYear(){
 if(!locked)return;
 $('#detail').classList.remove('open');const a=active;
 gsap.to(a.group.rotation,{x:0,y:0,z:0,duration:reduced?0:.45});
 gsap.to(a.group.position,{z:track.z[0],duration:reduced?0:.45,onComplete:()=>{locked=false;active=null}});
}
$('#close-detail').addEventListener('click',closeYear);
$('#detail').addEventListener('click',e=>{if(e.target.id==='detail')closeYear()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#index').classList.remove('open');if(locked)closeYear()}if(!locked&&e.key==='ArrowLeft')move(-1);if(!locked&&e.key==='ArrowRight')move(1)});
function resize(){
 const isMobile=innerWidth<700;
 camera.aspect=innerWidth/innerHeight;camera.position.set(0,isMobile?7.6:6.2,isMobile?43:34);
 camera.fov=isMobile?45:38;camera.lookAt(0,-0.8,0);camera.updateProjectionMatrix();
 stage.scale.setScalar(isMobile?.78:1);
 renderer.setSize(innerWidth,innerHeight);
}
window.addEventListener('resize',resize);resize();
const clock=new THREE.Clock();let first=true;
function tick(){
 const t=clock.getElapsedTime();
 if(!dragging&&!locked)cursor+=(target-cursor)*.15;
 if(dragging)cursor+=(target-cursor)*.3;
 if(!locked)cards.forEach(c=>layout(c,wrapped(c.index-cursor),t,first));
 first=false;
 renderer.render(scene,camera);
}
label();renderer.setAnimationLoop(tick);
