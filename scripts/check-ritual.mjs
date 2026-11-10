import assert from 'node:assert/strict';
import {mountRitualCarousel} from '../ritual-carousel.js';

export function checkRitual(html) {
  const markup=html.match(/<section[^>]*data-ritual>[\s\S]*?<\/section>/)?.[0];
  assert(markup,'Seção do ritual ausente');
  assert.equal((markup.match(/<img\b/g)||[]).length,1,'O ritual deve carregar a mesma arte uma única vez');
  const entries=[...markup.matchAll(/<li class="ritual-slide"[^>]*data-focus="([^"]+)" data-name="([^"]+)" data-caption="([^"]+)"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3><p>([^<]+)<\/p>/g)];
  assert.equal(entries.length,4,'As quatro instruções precisam estar no HTML para funcionar sem JavaScript');
  assert(!/<li class="ritual-slide"[^>]*\shidden/.test(markup),'O fallback precisa manter as instruções legíveis');
  assert(!markup.includes('data-ritual-announcement'),'As instruções não devem ser duplicadas abaixo dos controles');
  function node(extra={}) {
    const events=new Map(),classes=new Set();
    const n={hidden:false,dataset:{},attrs:{},textContent:'',animationCount:0,
      classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),toggle:(x,on)=>on?classes.add(x):classes.delete(x),contains:x=>classes.has(x)},
      style:{setProperty(name,value){n.attrs[name]=value;}},
      setAttribute(name,value){n.attrs[name]=value;},removeAttribute(name){delete n.attrs[name];},
      addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);},
      fire(name,event={}){events.get(name)?.({target:{closest:()=>null},...event});},
      focus(){n.focused=true;},
      animate(){n.animationCount++;return {cancel(){n.cancelled=true;}};},...extra};
    return n;
  }
  const slides=entries.map(([,focus,name,caption,title,description])=>node({dataset:{focus,name,caption},querySelector:selector=>({textContent:selector==='h3'?title:description})}));
  const tabs=slides.map(()=>node()),highlights=slides.map(()=>node());
  const controls=new Map(['[data-ritual-visual]','.ritual-overlay','[data-ritual-caption]','[data-ritual-kicker]','[data-ritual-count]','.ritual-steps','[data-ritual-prev]','[data-ritual-next]','.ritual-tabs','.ritual-controls','.ritual-swipe-hint'].map(key=>[key,node()]));
  const media=node({matches:false});
  const section=node({querySelector:selector=>controls.get(selector),querySelectorAll:selector=>{
    if(selector==='[data-ritual-slide]') return slides;
    if(selector==='[data-ritual-step]') return tabs;
    if(selector==='[data-ritual-highlight]') return highlights;
    return ['.ritual-tabs','.ritual-controls','.ritual-swipe-hint','.ritual-overlay'].map(key=>controls.get(key));
  }});
  const carousel=mountRitualCarousel(section,{view:{matchMedia:()=>media}});
  assert.equal(carousel.index,0);
  assert.deepEqual(slides.map(slide=>slide.hidden),[false,true,true,true]);
  assert.equal(controls.get('.ritual-steps').attrs['aria-live'],'off','A inicialização não deve interromper leitores de tela');
  tabs[2].fire('click');
  assert.equal(carousel.index,2);
  assert.equal(controls.get('[data-ritual-visual]').dataset.focus,'laranja');
  assert.equal(controls.get('[data-ritual-caption]').textContent,slides[2].dataset.caption);
  assert.equal(controls.get('[data-ritual-count]').textContent,'03 / 04');
  assert.equal(tabs[2].attrs['aria-pressed'],'true');
  assert.equal(tabs[0].attrs['aria-pressed'],'false');
  assert.equal(section.attrs['--ritual-progress'],'0.75');
  let prevented=false;
  tabs[2].fire('keydown',{key:'End',preventDefault(){prevented=true;}});
  assert(prevented);assert.equal(carousel.index,3);assert(tabs[3].focused);
  assert.equal(controls.get('[data-ritual-next]').attrs['aria-label'],'Recomeçar o ritual');
  controls.get('[data-ritual-next]').fire('click');assert.equal(carousel.index,0);
  controls.get('[data-ritual-prev]').fire('click');assert.equal(carousel.index,3);
  tabs[0].fire('keydown',{key:'Home',preventDefault(){}});assert.equal(carousel.index,0);
  tabs[0].fire('keydown',{key:'ArrowLeft',preventDefault(){}});assert.equal(carousel.index,3);
  carousel.select(0);
  const swipe=(x,y,overLink=false)=>{
    section.fire('pointerdown',{pointerId:1,pointerType:'touch',isPrimary:true,clientX:200,clientY:200,target:{closest:()=>overLink?{}:null}});
    section.fire('pointerup',{pointerId:1,clientX:200+x,clientY:200+y});
  };
  swipe(-90,8);assert.equal(carousel.index,1,'Deslizar para a esquerda deve avançar');
  swipe(90,8);assert.equal(carousel.index,0,'Deslizar para a direita deve voltar');
  swipe(-10,90);assert.equal(carousel.index,0,'Rolagem vertical não deve mudar a etapa');
  swipe(-90,8,true);assert.equal(carousel.index,0,'Links e botões não devem iniciar gestos');
  section.fire('pointerdown',{pointerId:1,pointerType:'touch',clientX:200,clientY:200});
  section.fire('pointercancel');section.fire('pointerup',{pointerId:1,clientX:100,clientY:200});assert.equal(carousel.index,0);
  media.matches=true;media.fire('change',{matches:true});
  const animations=slides.reduce((sum,slide)=>sum+slide.animationCount,0);
  tabs[1].fire('click');
  assert.equal(slides.reduce((sum,slide)=>sum+slide.animationCount,0),animations,'Movimento reduzido deve desativar animações');
  assert.equal(controls.get('.ritual-steps').attrs['aria-live'],'polite','O próprio bloco de instruções deve anunciar as trocas');
  assert.equal(controls.get('.ritual-steps').attrs['aria-busy'],'false');
  carousel.destroy();
  assert(slides.every(slide=>!slide.hidden));
  assert(!section.classList.contains('is-enhanced'));
  assert.equal(controls.get('[data-ritual-visual]').dataset.focus,undefined);
  tabs[3].fire('click');assert.equal(carousel.index,1,'A desmontagem deve remover os listeners');
  console.log('OK: ritual por etapas, teclado, gestos, sincronização, fallback e movimento reduzido.');
}
