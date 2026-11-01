import * as THREE from 'https://esm.sh/three@0.170.0';
import {gsap} from 'https://esm.sh/gsap@3.12.5';
const years=Array.from({length:22},(_,i)=>2023-i);
const verified={2023:['等露','尋常院','借墨','掬茶金'],2021:['一院久樹','山茶花森','花曆河','日光耶加']};
const $=s=>document.querySelector(s);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,120);
camera.position.set(0,0,36);
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;
$('#scene').append(renderer.domElement);
scene.add(new THREE.AmbientLight(0xffe1b0,2.1));
const light=new THREE.DirectionalLight(0xffd18a,3.1);light.position.set(-5,7,12);scene.add(light);
const rim=new THREE.DirectionalLight(0x2a7190,1.4);rim.position.set(6,2,-9);scene.add(rim);
const orbit=new THREE.Group();orbit.position.y=-4.2;scene.add(orbit);
const N=years.length,R=17,angleStep=2*Math.PI/N;
const cards=[];
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
function face(year,back=false){
 const c=document.createElement('canvas');c.width=768;c.height=1152;const g=c.getContext('2d');
 let gr=g.createLinearGradient(0,0,768,1152);gr.addColorStop(0,'#19323b');gr.addColorStop(.45,'#10232c');gr.addColorStop(1,'#08121d');g.fillStyle=gr;g.fillRect(0,0,768,1152);
 g.strokeStyle='#caa365';g.lineWidth=7;g.strokeRect(21,21,726,1110);g.lineWidth=2;g.strokeRect(39,39,690,1074);g.strokeStyle='#8c7147';g.strokeRect(53,53,662,1046);g.strokeStyle='rgba(230,190,111,.28)';g.lineWidth=1;for(let q=0;q<14;q++){const y=94+q*68;g.beginPath();g.moveTo(78,y);g.lineTo(110,y+9);g.moveTo(658,y+9);g.lineTo(690,y);g.stroke()}
 for(let k=0;k<4;k++){g.save();g.translate(k%2?768:0,k>1?1152:0);g.rotate(k*Math.PI/2);g.strokeStyle='#e4c387';g.lineWidth=3;g.beginPath();g.moveTo(62,174);g.lineTo(62,63);g.lineTo(174,63);g.moveTo(78,139);g.quadraticCurveTo(78,78,139,78);g.stroke();g.restore()}
 g.save();g.translate(384,470);g.strokeStyle='#aa9165';g.lineWidth=3;
 for(let i=0;i<4;i++){g.beginPath();g.arc(0,0,175-i*28,0,Math.PI*2);g.stroke()}
 for(let i=0;i<20;i++){const a=i*Math.PI/10;g.beginPath();g.moveTo(Math.cos(a)*185,Math.sin(a)*185);g.lineTo(Math.cos(a)*215,Math.sin(a)*215);g.stroke()}
 g.restore();
 const celestial=g.createRadialGradient(384,385,6,384,385,255);celestial.addColorStop(0,'rgba(255,240,171,.8)');celestial.addColorStop(.2,'rgba(238,184,80,.33)');celestial.addColorStop(1,'rgba(238,184,80,0)');g.fillStyle=celestial;g.fillRect(95,100,580,600);g.save();g.translate(384,470);g.strokeStyle='rgba(244,203,122,.3)';for(let j=0;j<24;j++){const a=j*Math.PI/12;g.beginPath();g.moveTo(Math.cos(a)*220,Math.sin(a)*220);g.lineTo(Math.cos(a)*245,Math.sin(a)*245);g.stroke()}g.restore();
 if(back){g.textAlign='center';g.fillStyle='#f5dfaf';g.font='54px Georgia';g.fillText('DE-YI',384,465);g.font='22px Georgia';g.fillText('ARCHITECTURAL ARCHIVE',384,510)}
 else{
  g.fillStyle='#c3ab83';g.fillRect(135,560,498,322);g.fillStyle='#e2d0ad';g.fillRect(245,488,280,392);g.fillStyle='#8d8b80';g.fillRect(315,407,155,473);
  for(const [x,y,w,h] of [[135,560,498,322],[245,488,280,392],[315,407,155,473]])for(let yy=y+30;yy<y+h-26;yy+=57)for(let xx=x+23;xx<x+w-27;xx+=64){g.fillStyle='#203f49';g.fillRect(xx,yy,32,37);g.strokeStyle='#dec89d';g.lineWidth=2;g.strokeRect(xx,yy,32,37)}
  const fade=g.createLinearGradient(0,830,0,1020);fade.addColorStop(0,'#08131a00');fade.addColorStop(.6,'#08131af0');fade.addColorStop(1,'#08131aff');g.fillStyle=fade;g.fillRect(80,820,608,245);
  g.textAlign='center';g.fillStyle='#f5dfaf';g.shadowColor='#d7ac5d';g.shadowBlur=15;g.font='bold 96px Georgia';g.fillText(String(year),384,1014);g.shadowBlur=0;g.font='21px Georgia';g.fillStyle='#d1a968';g.fillText('DE-YI  ·  CLASSIC WORKS',384,1065);
 }
 return c;
}
const backTex=new THREE.CanvasTexture(face(2023,true));backTex.colorSpace=THREE.SRGBColorSpace;
const gold=new THREE.MeshStandardMaterial({color:'#caa268',metalness:.72,roughness:.25});
const geom=new THREE.BoxGeometry(3.25,4.82,.22);
years.forEach((year,i)=>{
 const a=i*angleStep;
 const group=new THREE.Group();group.position.set(Math.sin(a)*R,0,Math.cos(a)*R);group.rotation.y=a;
 const tex=new THREE.CanvasTexture(face(year));tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
 const mesh=new THREE.Mesh(geom,[gold,gold,gold,gold,new THREE.MeshStandardMaterial({map:tex,roughness:.55}),new THREE.MeshStandardMaterial({map:backTex,roughness:.55})]);
 group.add(mesh);orbit.add(group);cards.push({group,mesh,year,a,home:group.position.clone(),base:group.rotation.clone()});group.scale.setScalar(.001);
 gsap.to(group.scale,{x:1,y:1,z:1,delay:reduced?0:i*.026,duration:reduced?0:.9,ease:'back.out(1.3)'});
});
let focus=0,target=0,locked=false,selected=null;
function normalize(v){return ((v%N)+N)%N}
function updateLabel(){const y=years[focus];$('#focus-year').textContent=y;$('#open-label').textContent='探索 '+y+' 年';$('#focus-desc').textContent=verified[y]?.join(' · ')||'得邑經典建案'}
function select(i){if(locked)return;focus=normalize(i);let want=-focus*angleStep;while(want-target>Math.PI)want-=2*Math.PI;while(want-target< -Math.PI)want+=2*Math.PI;target=want;updateLabel()}
updateLabel();
let dragging=false,startX=0,startTarget=0,moved=false;
renderer.domElement.addEventListener('pointerdown',e=>{if(locked)return;dragging=true;moved=false;startX=e.clientX;startTarget=target;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging||locked)return;const d=e.clientX-startX;if(Math.abs(d)>7)moved=true;target=startTarget+d*.006;focus=normalize(Math.round(-target/angleStep));updateLabel()});
renderer.domElement.addEventListener('pointerup',e=>{dragging=false;if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);select(focus)});
renderer.domElement.addEventListener('click',()=>{if(!moved&&!locked)openYear()});
$('#prev').onclick=()=>select(focus-1);$('#next').onclick=()=>select(focus+1);
$('#explore').onclick=openYear;$('#shuffle').onclick=()=>select(Math.floor(Math.random()*N));
const grid=$('#year-grid');years.forEach((y,i)=>{const b=document.createElement('button');b.textContent=y;b.onclick=()=>{$('#index').classList.remove('open');select(i)};grid.append(b)});
$('#all-years').onclick=()=>$('#index').classList.add('open');$('#close-index').onclick=()=>$('#index').classList.remove('open');
function openYear(){
 if(locked)return;locked=true;selected=cards[focus];const c=selected;
 gsap.timeline({onComplete:()=>showDetail(c.year)})
 .to(c.group.position,{x:0,y:0,z:17.5,duration:.65,ease:'power3.inOut'})
 .to(c.group.rotation,{x:0,y:Math.PI,z:0,duration:.6,ease:'power2.inOut'},'<');
}
function showDetail(y){
 $('#detail-year').textContent=y;$('#projects').replaceChildren();
 const arr=verified[y]||[];
 if(arr.length){arr.forEach(n=>{const d=document.createElement('div');d.className='project';const strong=document.createElement('strong');strong.textContent=n;const span=document.createElement('span');span.textContent='得邑經典作品';d.append(strong,span);$('#projects').append(d)})}
 else{$('#projects').innerHTML='<p>此年度作品內容請於得邑官網查看；尚未匯入完整的原始資料。</p>'}
 $('#official').href='https://www.de-yi.com.tw/classic.htm';$('#detail').classList.add('open');
}
function closeDetail(){
 if(!locked)return;
 $('#detail').classList.remove('open');const c=selected;
 gsap.to(c.group.rotation,{y:0,duration:.6});
 locked=false;selected=null;
}
$('#close-detail').onclick=closeDetail;$('#detail').addEventListener('click',e=>{if(e.target.id==='detail')closeDetail()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDetail();$('#index').classList.remove('open')}if(!locked&&e.key==='ArrowLeft')select(focus-1);if(!locked&&e.key==='ArrowRight')select(focus+1)});
function resize(){camera.aspect=innerWidth/innerHeight;camera.position.z=innerWidth<700?44:36;camera.fov=innerWidth<700?45:38;orbit.position.y=innerWidth<700?-5.8:-4.2;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)}window.addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
// Explicit visual carousel: the focused card is 1.28x, neighbors step down dramatically.
const carouselSizes=[1.28,.84,.58,.4,.27,.18];
function tick(){
 const t=clock.getElapsedTime();
 orbit.rotation.y=0;
 cards.forEach((c,i)=>{
  if(c===selected)return;
  let offset=i-focus;
  if(offset>N/2)offset-=N;if(offset< -N/2)offset+=N;
  const n=Math.abs(offset),side=Math.sign(offset);
  const visible=n<=5;
  c.group.visible=visible;
  if(!visible)return;
  const scale=carouselSizes[Math.min(n,5)];
  const x=side*([0,3.8,6.75,8.9,10.65,12.1][n]);
  const z=[12.8,8.7,4.7,1.3,-1.4,-3.6][n];
  const y=-Math.min(n,5)*.33+(reduced?0:Math.sin(t*.7+i*.4)*.035);
  const ease=.14;
  c.group.position.x+=(x-c.group.position.x)*ease;
  c.group.position.y+=(y-c.group.position.y)*ease;
  c.group.position.z+=(z-c.group.position.z)*ease;
  c.group.rotation.y+=(side*Math.min(n*.23,.95)-c.group.rotation.y)*ease;
  c.group.rotation.z+=(-side*Math.min(n*.045,.2)-c.group.rotation.z)*ease;
  c.group.scale.setScalar(c.group.scale.x+(scale-c.group.scale.x)*ease);
 });
 renderer.render(scene,camera);
}
renderer.setAnimationLoop(tick);
