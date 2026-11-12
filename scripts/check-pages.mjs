import assert from 'node:assert/strict';
import {access,readFile} from 'node:fs/promises';
import path from 'node:path';

export async function checkPages({pages,config,out,root}) {
  const idsFor=html=>[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  const navigation=['index.html','rotulo.html','colecao.html','review.html','presentes.html','ritual.html'];
  for(const [name,html] of Object.entries(pages)) {
    assert.equal(await readFile(path.join(root,name),'utf8'),html,`${name}: raiz desatualizada`);
    assert(!html.includes('{{'),`${name}: marcador pendente`);
    assert.equal((html.match(/<h1\b/g)||[]).length,1,`${name}: título principal`);
    const ids=idsFor(html);
    assert.equal(new Set(ids).size,ids.length,`${name}: IDs duplicados`);
    assert.match(html,/<html lang="pt-BR">/);
    assert.match(html,/<meta name="description" content="[^"]+"/);
    if(config.siteUrl) assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1],`${config.siteUrl.replace(/\/$/,'')}/${name==='index.html'?'':name}`);
    for(const match of html.matchAll(/\b(?:src|href|poster)="([^"]+)"/g)) {
      const url=new URL(match[1].replaceAll('&amp;','&'),`https://local.test/${name}`);
      if(url.origin!=='https://local.test') continue;
      const file=decodeURIComponent(url.pathname.slice(1));
      await access(path.join(out,file));
      if(url.hash) {
        assert(pages[file],`${name}: página da âncora não encontrada`);
        assert(idsFor(pages[file]).includes(decodeURIComponent(url.hash.slice(1))),`${name}: âncora inexistente ${match[1]}`);
      }
    }
    for(const match of html.matchAll(/srcset="([^"]+)"/g)) for(const candidate of match[1].split(',')) await access(path.join(out,candidate.trim().split(/\s+/)[0]));
    for(const match of html.matchAll(/aria-controls="([^"]+)"/g)) for(const id of match[1].split(' ')) assert(ids.includes(id),`${name}: controle sem destino ${id}`);
    for(const match of html.matchAll(/<img\b[^>]*>/g)) {
      assert(/alt="[^"]+"/.test(match[0])||/alt=""[^>]*aria-hidden="true"/.test(match[0]),`${name}: imagem sem descrição`);
      assert.match(match[0],/width="\d+"/);
      assert.match(match[0],/height="\d+"/);
    }
    for(const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(match[0],/rel="noopener noreferrer"/);
    for(const label of ['Navegação principal','Menu do site']) {
      const nav=html.match(new RegExp(`<nav aria-label="${label}">([\\s\\S]*?)<\\/nav>`))?.[1];
      assert(nav,`${name}: menu ausente`);
      for(const target of navigation) assert(nav.includes(`href="${target}"`),`${name}: link ${target} ausente`);
      if(navigation.includes(name)) assert(nav.includes(`href="${name}" aria-current="page"`),`${name}: página atual não identificada`);
    }
    // Only load the interaction belonging to the visited page.
    const controllers={'rotulo.html':'label-story.js','colecao.html':'collection-carousel.js','presentes.html':'app.js','ritual.html':'ritual-carousel.js'};
    for(const [page,script] of Object.entries(controllers)) assert.equal(html.includes(`src="${script}?v=`),name===page,`${name}: script indevido ou ausente: ${script}`);
  }
  const home=pages['index.html'];
  assert.equal((home.match(/<section\b/g)||[]).length,2,'Home deve conter somente fundador e hero');
  assert.match(home,/<a class="button button-gold" href="colecao.html">Quero meu Negroni/);
  const sections={'rotulo.html':'rotulo','colecao.html':'negronis','review.html':'review','presentes.html':'presentes','ritual.html':'ritual'};
  for(const [name,id] of Object.entries(sections)) {
    assert(pages[name].includes(`id="${id}"`));
    assert(!home.includes(`id="${id}"`),`Seção ${id} ainda está na home`);
    assert.equal((pages[name].match(/<section\b/g)||[]).length,1);
  }
  console.log('Páginas: 7 HTMLs, navegação desktop/mobile, destinos locais, imagens, metadados e scripts OK.');
}
