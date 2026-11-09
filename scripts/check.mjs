import assert from 'node:assert/strict';
import {readFile,access,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {build,root} from './build.mjs';
import {createStoryPlayback,mountLabelExplorer} from '../label-story.js';

const {html,config,out}=await build();
assert(!(await readdir(path.join(out,'assets'))).some(name=>name.startsWith('WhatsApp Image ')),'Capturas originais não devem entrar no build');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'IDs duplicados');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'A página deve ter um H1');
assert.match(html,/<html lang="pt-BR">/);
for(const m of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(m[1]),`Âncora ausente: ${m[1]}`);
for(const m of html.matchAll(/(?:src|href)="((?:assets\/|styles\.css|app\.js|label-story\.js)[^"]*)"/g)) await access(path.join(out,m[1]));
for(const m of html.matchAll(/srcset="([^"]+)"/g)) for(const candidate of m[1].split(',')) await access(path.join(out,candidate.trim().split(' ')[0]));
for(const m of html.matchAll(/<img\b[^>]*>/g)){
  assert(/alt="[^"]+"/.test(m[0]) || /alt=""[^>]*aria-hidden="true"/.test(m[0]),'Imagem sem descrição ou identificação decorativa');
  assert.match(m[0],/width="\d+"/,'Imagem sem largura');
  assert.match(m[0],/height="\d+"/,'Imagem sem altura');
}
const channel=new URL(config.orderBaseUrl);
const orderLinks=[...html.matchAll(/href="(https:\/\/[^\"]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&'))).filter(url=>url.hostname===channel.hostname && url.pathname===channel.pathname);
assert(orderLinks.length>=7,'CTAs insuficientes');
for(const url of orderLinks){
  assert.equal(url.pathname,channel.pathname,'Canal de pedido divergente');
  if(['wa.me','api.whatsapp.com'].includes(channel.hostname)) assert(url.searchParams.get('text')?.includes('Negroni Marson'),'Mensagem do pedido ausente');
}
for(const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0],/rel="noopener noreferrer"/);
assert(!html.includes('{{'),'Placeholder não resolvido');
assert.match(html,/name="viewport"/);
assert.match(html,/property="og:image"/);
assert.match(html,/name="twitter:card"/);

// Exercise the actual gift-selection event handler without a browser dependency.
const elements=new Map();
for(const id of ['#gift-image','#gift-order','#gift-status','#year','#gift-scene','#gift-bottle-overlay']) elements.set(id,{dataset:{classico:'https://wa.me/5519999060077?text=classico',defumado:'https://wa.me/5519999060077?text=defumado'},replaceChildren(node){this.label=node.textContent;},append(){}});
const background=elements.get('#gift-image');
background.src='assets/presente-classico-1000.webp';
background.srcset='assets/presente-classico-640.webp 640w, assets/presente-classico-1000.webp 1000w';
elements.get('#gift-scene').dataset.version='classico';
elements.get('#gift-bottle-overlay').decode=async()=>{};
const inputs=['classico','defumado'].map(value=>({value,addEventListener(event,handler){this.change=handler;}}));
const document={querySelector:id=>elements.get(id),querySelectorAll:()=>inputs,createTextNode:textContent=>({textContent}),createElement:()=>({setAttribute(){}})};
vm.runInNewContext(await readFile(path.join(root,'app.js'),'utf8'),{document,Date});
for(const input of [inputs[1],inputs[0]]){
  await input.change();
  assert.equal(background.src,'assets/presente-classico-1000.webp','O cenário deve permanecer estático');
  assert.equal(background.srcset,'assets/presente-classico-640.webp 640w, assets/presente-classico-1000.webp 1000w');
  assert.equal(elements.get('#gift-scene').dataset.version,input.value);
  assert.equal(elements.get('#gift-order').href,elements.get('#gift-order').dataset[input.value]);
  assert(elements.get('#gift-image').alt.includes(input.value==='classico'?'Clássico':'Defumado'));
  assert(elements.get('#gift-order').label.includes(input.value==='classico'?'Clássico':'Defumado'));
}
// A slow first decode must never overwrite a newer selection.
let finishDecode;
elements.get('#gift-bottle-overlay').decode=()=>new Promise(resolve=>{finishDecode=resolve;});
const delayedSelection=inputs[1].change();
await inputs[0].change();
finishDecode();await delayedSelection;
assert.equal(elements.get('#gift-scene').dataset.version,'classico');
assert.equal(elements.get('#gift-order').href,elements.get('#gift-order').dataset.classico);
elements.get('#gift-bottle-overlay').decode=async()=>{throw new Error('Imagem indisponível');};
await inputs[1].change();
assert.equal(elements.get('#gift-scene').dataset.version,'classico');
assert(elements.get('#gift-status').textContent.includes('não pôde ser carregada'));
await access(path.join(out,'assets/mascara-garrafa-presente.svg'));

// Automatic label exploration must stop offscreen, when paused, on a hidden
// page and for reduced-motion users. A manual selection pauses the sequence.
assert.equal([...html.matchAll(/data-label-step="/g)].length,5);
assert.equal([...html.matchAll(/data-label-part="/g)].length,5);
assert.equal([...html.matchAll(/data-label-hotspot="/g)].length,5);
for(const match of html.matchAll(/aria-controls="([^"]+)"/g)) assert(ids.includes(match[1]),`Controle sem destino: ${match[1]}`);
let pending;
let playing;
const selections=[];
const story=createStoryPlayback({length:5,onSelect:(index,manual)=>selections.push({index,manual}),onPlaybackChange:value=>{playing=value;},setTimer:callback=>{pending=callback;return 1;},clearTimer:()=>{pending=undefined;}});
assert.equal(playing,false);
story.setInView(true);assert.equal(playing,true);
pending();assert.equal(selections.at(-1).index,1);
story.select(4,true);assert.equal(playing,false);assert.equal(pending,undefined);
assert.deepEqual(selections.at(-1),{index:4,manual:true});
story.togglePaused();pending();assert.equal(selections.at(-1).index,0);
story.setReducedMotion(true);assert.equal(playing,false);assert.equal(pending,undefined);
story.setReducedMotion(false);assert.equal(playing,true);
story.setHidden(true);assert.equal(playing,false);
story.setHidden(false);story.setInView(false);assert.equal(playing,false);
story.setInView(true);story.setTouchMode(true);assert.equal(playing,false);assert.equal(pending,undefined);
story.select(2,true);assert.equal(selections.at(-1).index,2);assert.equal(playing,false);
story.togglePaused();assert.equal(playing,false,'O mobile deve depender de interação manual');
story.setTouchMode(false);assert.equal(playing,true);
story.destroy();story.setInView(true);assert.equal(playing,false);

// Exercise the real marker listeners and detail-card rendering in touch mode.
function uiNode(textContent='') {
  const events=new Map(),classes=new Set();
  return {textContent, dataset:{}, attrs:{}, hidden:false, animationCount:0,
    style:{values:{},setProperty(name,value){this.values[name]=value;}},
    classList:{add:name=>classes.add(name),toggle(name,on){on?classes.add(name):classes.delete(name);}},
    setAttribute(name,value){this.attrs[name]=value;},
    addEventListener(name,callback){events.set(name,callback);},removeEventListener(name){events.delete(name);},
    fire(name,event={}){events.get(name)?.(event);},focus(){this.focused=true;},
    animate(){this.animationCount++;return {cancel(){}};}
  };
}
const sourceStories=[...html.matchAll(/<button[^>]+data-label-step="(\d+)"[^>]*>[\s\S]*?<strong>([^<]+)<\/strong><span>([^<]+)<\/span>/g)];
assert.equal(sourceStories.length,5);
const storyButtons=sourceStories.map(([_,index,title,description])=>{
  const node=uiNode();node.dataset.labelStep=index;
  node.querySelector=selector=>({textContent:selector==='strong'?title:description});return node;
});
const markerButtons=Array.from({length:5},(_,i)=>{const node=uiNode();node.dataset.labelHotspot=String(i);return node;});
const sceneParts=Array.from({length:5},()=>uiNode());
const touchNodes=new Map(['#label-motion-toggle','#label-caption','#label-announcement','#label-detail-card','#label-card-title','#label-card-description','#label-card-count','#label-reset'].map(id=>[id,uiNode(id)]));
const touchSection=uiNode();
touchSection.querySelector=id=>touchNodes.get(id);
touchSection.querySelectorAll=selector=>({'[data-label-step]':storyButtons,'[data-label-hotspot]':markerButtons,'[data-label-part]':sceneParts}[selector]);
const mobileMedia=uiNode(),motionMedia=uiNode(),page=uiNode();
mobileMedia.matches=true;motionMedia.matches=false;page.hidden=false;
const explorer=mountLabelExplorer(touchSection,{view:{matchMedia:query=>query.includes('max-width')?mobileMedia:motionMedia},page,setTimer:callback=>{pending=callback;return 1;},clearTimer:()=>{pending=undefined;}});
assert.equal(pending,undefined);
assert.equal(touchNodes.get('#label-motion-toggle').hidden,true);
assert.equal(touchSection.dataset.exploring,'false');
markerButtons[2].fire('click');
assert.equal(touchSection.dataset.exploring,'true');
assert.equal(touchNodes.get('#label-card-title').textContent,'O Cristo');
assert.equal(markerButtons[2].attrs['aria-pressed'],'true');
assert.equal(markerButtons[0].attrs['aria-pressed'],'false');
assert.equal(touchSection.style.values['--label-focus-x'],'75%');
assert.equal(touchNodes.get('#label-reset').hidden,false);
assert.equal(pending,undefined);
assert(touchNodes.get('#label-announcement').textContent.includes('Amparo'));
motionMedia.matches=true;motionMedia.fire('change',{matches:true});
const animationCount=touchNodes.get('#label-detail-card').animationCount;
markerButtons[4].fire('click');
assert.equal(touchNodes.get('#label-card-title').textContent,'A assinatura');
assert.equal(touchNodes.get('#label-detail-card').animationCount,animationCount,'Respeitar movimento reduzido');
let keyPrevented=false;
markerButtons[4].fire('keydown',{key:'ArrowRight',preventDefault(){keyPrevented=true;}});
assert(keyPrevented);assert(markerButtons[0].focused);
assert.equal(touchNodes.get('#label-card-title').textContent,'As montanhas');
touchNodes.get('#label-reset').fire('click');
assert.equal(touchSection.dataset.exploring,'false');
assert(markerButtons.every(button=>button.attrs['aria-pressed']==='false'));
assert.equal(touchNodes.get('#label-card-title').textContent,'#label-card-title');
assert.equal(touchNodes.get('#label-reset').hidden,true);
explorer.destroy();assert.equal(pending,undefined);

const luminance=hex=>{
  const [r,g,b]=hex.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*r+.7152*g+.0722*b;
};
const contrast=(a,b)=>{const x=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (x[0]+.05)/(x[1]+.05);};
for(const [label,a,b] of [['Texto principal','#f6f1e6','#0b0b09'],['Texto secundário','#b4b0a5','#0b0b09'],['Botão dourado','#0b0b09','#e2be7b'],['Texto no creme','#575348','#f2ecdf'],['Destaque no creme','#76532c','#f2ecdf'],['Pedido: texto secundário','#bdb7a8','#181811']]){
  const ratio=contrast(a,b);assert(ratio>=4.5,`${label}: contraste insuficiente`);console.log(`${label}: ${ratio.toFixed(2)}:1`);
}
const heroSize=(await stat(path.join(out,'assets/classico-800.webp'))).size;
assert(heroSize<100_000,'Imagem principal acima do orçamento de 100 KB');
console.log(`OK: HTML, âncoras, imagens, CTAs (${orderLinks.length}), metadados, presente, animação do rótulo, pausa, movimento reduzido e contraste. Hero: ${heroSize} bytes.`);
