import assert from 'node:assert/strict';
import {readFile,access,stat,readdir} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {build,root} from './build.mjs';
import {createStoryPlayback,mountLabelExplorer} from '../label-story.js';

const {html,config,out}=await build();
assert.equal(await readFile(path.join(root,'index.html'),'utf8'),html,'A raiz do GitHub Pages deve conter o HTML final');
assert(!html.includes('{{'),'GitHub Pages não deve receber marcadores de template');
const sourceCname=await readFile(path.join(root,'CNAME'),'utf8').catch(error=>{
  if(error.code==='ENOENT') return null;
  throw error;
});
if(sourceCname!==null) assert.equal(await readFile(path.join(out,'CNAME'),'utf8'),sourceCname,'O domínio deve ser preservado no build');
else await assert.rejects(access(path.join(out,'CNAME')),{code:'ENOENT'},'Build sem domínio não deve conservar CNAME antigo');
assert(html.includes(config.whatsappDisplay),'O telefone oficial precisa estar visível');
assert(html.includes(config.facebookUrl),'Link oficial do Facebook ausente');
if(config.siteUrl) {
  const publicUrl=config.siteUrl.replace(/\/$/,'');
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],`${publicUrl}/`);
  assert.equal(html.match(/<meta property="og:image" content="([^"]+)"/)?.[1],`${publicUrl}/assets/social.jpg`);
}
assert(!(await readdir(path.join(out,'assets'))).some(name=>name.startsWith('WhatsApp Image ')),'Capturas originais não devem entrar no build');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'IDs duplicados');
assert.equal((html.match(/<h1\b/g)||[]).length,1,'A página deve ter um H1');
assert.match(html,/<html lang="pt-BR">/);
for(const m of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(m[1]),`Âncora ausente: ${m[1]}`);
for(const m of html.matchAll(/(?:src|href)="((?:assets\/|styles\.css|app\.js|label-story\.js)[^"]*)"/g)) await access(path.join(out,m[1].split('?')[0]));
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
for(const id of ['#gift-image','#gift-order','#gift-status','#year','#gift-scene','#gift-bottle-overlay','#gift-bottle-avif','#gift-image-retry']) elements.set(id,{dataset:{classico:'https://wa.me/5519999060077?text=classico',defumado:'https://wa.me/5519999060077?text=defumado'},attrs:{},setAttribute(name,value){this.attrs[name]=value;},removeAttribute(name){delete this[name];},addEventListener(name,callback){this[name]=callback;},replaceChildren(node){this.label=node.textContent;},append(){}});
const background=elements.get('#gift-image');
background.src='assets/presente-classico-960.webp';
background.srcset='assets/presente-classico-640.webp 640w, assets/presente-classico-1216.webp 1216w';
elements.get('#gift-scene').dataset.version='classico';
elements.get('#gift-scene').clientWidth=1000;
elements.get('#gift-bottle-overlay').style={};
elements.get('#gift-bottle-overlay').dataset.src='assets/presente-defumado-960.webp';
elements.get('#gift-bottle-overlay').dataset.srcset='assets/presente-defumado-640.webp 640w, assets/presente-defumado-1216.webp 1216w';
elements.get('#gift-bottle-avif').media='not all';
elements.get('#gift-bottle-overlay').decode=async()=>{};
const inputs=['classico','defumado'].map(value=>({value,addEventListener(event,handler){this.change=handler;}}));
const document={querySelector:id=>elements.get(id),querySelectorAll:()=>inputs,createTextNode:textContent=>({textContent}),createElement:()=>({setAttribute(){}})};
const giftContext={document,Date};
vm.runInNewContext(await readFile(path.join(root,'app.js'),'utf8'),giftContext);
assert.equal(elements.get('#gift-bottle-overlay').src,undefined,'A imagem opcional deve aguardar a escolha do visitante');
assert.equal(elements.get('#gift-bottle-avif').media,'not all');
// The printed label must follow the same four corners at every viewport size.
const labelCorners=[[[741,530],[747,489]],[[898,549],[891,517]],[[699,730],[716,657]],[[879,755],[868,686]]];
for(const width of [320,640,1000]) {
  giftContext.registerGiftPerspective(width);
  const matrix=elements.get('#gift-bottle-overlay').style.transform.slice(9,-1).split(',').map(Number);
  for(const [[x,y],[u,v]] of labelCorners) {
    const sx=x*width/1000,sy=y*width/1000;
    const denominator=matrix[3]*sx+matrix[7]*sy+matrix[15];
    const actualX=(matrix[0]*sx+matrix[4]*sy+matrix[12])/denominator;
    const actualY=(matrix[1]*sx+matrix[5]*sy+matrix[13])/denominator;
    assert(Math.hypot(actualX-u*width/1000,actualY-v*width/1000)<.01,'Perspectiva desalinhada');
  }
}
for(const input of [inputs[1],inputs[0]]){
  await input.change();
  assert.equal(background.src,'assets/presente-classico-960.webp','O cenário deve permanecer estático');
  assert.equal(background.srcset,'assets/presente-classico-640.webp 640w, assets/presente-classico-1216.webp 1216w');
  assert.equal(elements.get('#gift-scene').dataset.version,input.value);
  assert.equal(elements.get('#gift-order').href,elements.get('#gift-order').dataset[input.value]);
  assert(elements.get('#gift-image').alt.includes(input.value==='classico'?'Clássico':'Defumado'));
  assert(elements.get('#gift-order').label.includes(input.value==='classico'?'Clássico':'Defumado'));
}
assert.equal(elements.get('#gift-bottle-avif').media,'all');
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
assert.equal(elements.get('#gift-image-retry').hidden,false);
elements.get('#gift-bottle-overlay').decode=async()=>{};
await elements.get('#gift-image-retry').click();
assert.equal(elements.get('#gift-scene').dataset.version,'defumado');
assert.equal(elements.get('#gift-image-retry').hidden,true);
assert.equal(elements.get('#gift-scene').attrs['aria-busy'],'false');
elements.set('input[name="gift"]:checked',{value:'classico'});
await giftContext.syncGiftSelection();
assert.equal(elements.get('#gift-scene').dataset.version,'classico','Restaurar a opção marcada pelo navegador');
assert.equal(elements.get('#gift-order').href,elements.get('#gift-order').dataset.classico);
elements.delete('input[name="gift"]:checked');
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

// Mobile navigation must close on selection, Escape and an outside click.
const menu=uiNode(),menuSummary=uiNode(),menuLinks=Array.from({length:4},()=>uiNode());
menu.querySelector=()=>menuSummary;menu.querySelectorAll=()=>menuLinks;
menu.contains=target=>target===menu||target===menuSummary||menuLinks.includes(target);
elements.set('#mobile-navigation',menu);
const documentEvents=new Map();
const menuDocument={...document,addEventListener:(name,callback)=>documentEvents.set(name,callback)};
vm.runInNewContext(await readFile(path.join(root,'app.js'),'utf8'),{document:menuDocument,Date});
menu.open=true;menuLinks[2].fire('click');assert.equal(menu.open,false);
menu.open=true;documentEvents.get('click')({target:menuSummary});assert.equal(menu.open,true);
documentEvents.get('click')({target:{}});assert.equal(menu.open,false);
menu.open=true;let escapePrevented=false;
documentEvents.get('keydown')({key:'Escape',preventDefault(){escapePrevented=true;}});
assert.equal(menu.open,false);assert(menuSummary.focused);assert(escapePrevented);

assert.match(html,/<link rel="preload"[^>]+type="image\/avif"/);
for(const name of ['classico-1024.avif','defumado-1024.avif','presente-classico-1216.avif','presente-defumado-1216.avif','rotulo-detalhe-360.avif']) await access(path.join(out,'assets',name));
const deferredTag=html.match(/<img[^>]*id="gift-bottle-overlay"[^>]*>/)?.[0];
assert(deferredTag && !/\ssrc=/.test(deferredTag),'A foto do Defumado deve ser solicitada somente após seleção');
assert((await stat(path.join(out,'assets/favicon-marson.ico'))).size<20_000,'Favicon desnecessariamente pesado');

const luminance=hex=>{
  const [r,g,b]=hex.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return .2126*r+.7152*g+.0722*b;
};
const contrast=(a,b)=>{const x=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (x[0]+.05)/(x[1]+.05);};
for(const [label,a,b] of [['Texto principal','#f6f1e6','#0b0b09'],['Texto secundário','#b4b0a5','#0b0b09'],['Botão dourado','#0b0b09','#e2be7b'],['Texto no creme','#575348','#f2ecdf'],['Destaque no creme','#76532c','#f2ecdf'],['Pedido: texto secundário','#bdb7a8','#181811']]){
  const ratio=contrast(a,b);assert(ratio>=4.5,`${label}: contraste insuficiente`);console.log(`${label}: ${ratio.toFixed(2)}:1`);
}
const heroSize=(await stat(path.join(out,'assets/classico-1024.avif'))).size;
assert(heroSize<110_000,'Imagem principal em resolução nativa acima do orçamento de 110 KB');
console.log(`OK: HTML, âncoras, imagens, CTAs (${orderLinks.length}), metadados, presente, animação do rótulo, pausa, movimento reduzido e contraste. Hero: ${heroSize} bytes.`);
