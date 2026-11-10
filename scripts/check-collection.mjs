import assert from 'node:assert/strict';
import {mountCollectionCarousel} from '../collection-carousel.js';

export function checkCollection(html) {
  const markup=html.match(/<section class="collection section"[\s\S]*?<\/section>/)?.[0];
  const products=[...markup.matchAll(/<article class="product-card">[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<a class="text-link" href="([^"]+)"[\s\S]*?<\/article>/g)];
  assert.equal(products.length,2,'Os dois produtos originais devem permanecer no HTML');
  function node(extra={}) {
    const events=new Map(),classes=new Set();
    const n={attrs:{},hidden:false,inert:false,textContent:'',
      classList:{add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x)},
      setAttribute(name,value){n.attrs[name]=value;},removeAttribute(name){delete n.attrs[name];},
      addEventListener(name,fn){events.set(name,fn);},removeEventListener(name){events.delete(name);},
      fire(name,event={}){events.get(name)?.(event);},...extra};
    return n;
  }
  let width=340;
  const document={activeElement:null};
  const track=node({children:[],scrollLeft:0,ownerDocument:document,scrollTo({left,behavior}){this.scrollLeft=left;this.behavior=behavior;},
    prepend(...children){this.children.unshift(...children);},append(...children){this.children.push(...children);}});
  Object.defineProperty(track,'firstElementChild',{get:()=>track.children[0]});
  const card=(name,url)=>{
    const link={href:url,focus(){document.activeElement=link;}};
    const n=node({querySelector:selector=>selector==='h3'?{textContent:name}:link,
      querySelectorAll:()=>[],contains:target=>target===link,
      cloneNode:()=>card(name,url),remove(){track.children.splice(track.children.indexOf(n),1);}});
    Object.defineProperty(n,'offsetLeft',{get:()=>8+track.children.indexOf(n)*(width+20)});
    return n;
  };
  const cards=products.map(([,name,url])=>card(name,url));track.children.push(...cards);
  track.querySelectorAll=()=>cards;
  const controls=node({hidden:true}),status=node(),previous=node(),next=node();
  const elements={'.product-grid':track,'.collection-controls':controls,'[data-collection-status]':status,'[data-collection-prev]':previous,'[data-collection-next]':next};
  const section=node({querySelector:selector=>elements[selector]});
  const mobile=node({matches:true}),motion=node({matches:false});
  const timers=new Map();let timerId=0;
  const view=node({matchMedia:query=>query.includes('760')?mobile:motion,
    setTimeout:callback=>{timers.set(++timerId,callback);return timerId;},clearTimeout:id=>timers.delete(id),
    requestAnimationFrame:fn=>{fn();return 1;},cancelAnimationFrame(){}});
  const carousel=mountCollectionCarousel(section,{view});
  const offset=index=>(index+2)*(width+20);
  const check=index=>{
    assert.equal(carousel.index,index);
    assert.equal(track.scrollLeft,offset(index),'O repouso deve voltar à cópia central sem fim lateral');
    assert.deepEqual(cards.map(c=>c.inert),index===0?[false,true]:[true,false]);
    assert.equal(status.textContent,`${products[index][1]} · ${index+1} de 2`);
    assert.equal(cards[index].querySelector('a').href,products[index][2],'Pedido deve corresponder ao produto exibido');
    assert(track.children.filter(c=>!cards.includes(c)).every(c=>c.inert&&c.attrs['aria-hidden']==='true'));
  };
  assert.equal(track.children.length,6);assert.equal(controls.hidden,false);check(0);
  for(const direction of [1,-1]) for(let i=0;i<12;i++) {
    const expected=(carousel.index+1)%2;
    (direction===1?next:previous).fire('click');track.fire('scrollend');check(expected);
  }
  // A native swipe can settle on either surrounding copy, at different widths.
  for(const viewport of [280,350,700]) {
    width=viewport;view.fire('resize');check(carousel.index);
    for(const slide of [1,4,0,5]) {track.scrollLeft=slide*(width+20);track.fire('scrollend');check(slide%2);}
  }
  // A drag is not recentered while the pointer is still held.
  track.fire('pointerdown',{isPrimary:true});track.scrollLeft=4*(width+20);track.fire('scrollend');
  assert.equal(track.scrollLeft,4*(width+20));view.fire('pointerup');track.fire('scrollend');check(0);
  next.fire('click');next.fire('click');next.fire('click');track.fire('scrollend');check(1);
  document.activeElement=cards[1].querySelector('a');
  let prevented=false;track.fire('keydown',{key:'ArrowRight',preventDefault(){prevented=true;}});track.fire('scrollend');
  assert(prevented);check(0);assert.equal(document.activeElement,cards[0].querySelector('a'));
  motion.matches=true;motion.fire('change');next.fire('click');check(1);assert.equal(track.behavior,'instant');
  mobile.matches=false;mobile.fire('change');
  assert.equal(carousel.enabled,false);assert.equal(controls.hidden,true);assert.deepEqual(track.children,cards);
  assert(cards.every(c=>!c.inert&&!('aria-hidden' in c.attrs)));assert.equal(track.scrollLeft,0);
  next.fire('click');assert.equal(carousel.index,1,'Desktop não deve iniciar navegação');
  mobile.matches=true;mobile.fire('change');check(1);assert.equal(track.children.length,6);
  carousel.destroy();assert.deepEqual(track.children,cards);assert.equal(timers.size,0);
  next.fire('click');assert.equal(carousel.index,1);assert(!section.classList.contains('is-carousel'));
  console.log('OK: coleção contínua nos dois sentidos, pedidos, teclado, trocas rápidas, resize, desktop e movimento reduzido.');
}
