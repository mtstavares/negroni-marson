import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';

export async function checkStory({html,storyHtml,config,out,root}) {
  assert.equal(await readFile(path.join(root,'historia.html'),'utf8'),storyHtml,'A história também precisa ser publicada pela raiz');
  assert.equal(await readFile(path.join(out,'historia.html'),'utf8'),storyHtml);
  assert(html.indexOf('class="founder-intro section"')<html.indexOf('class="hero"'),'A história deve vir antes da abertura original');
  assert(html.includes('href="historia.html"'));
  assert.match(html,/<h2 class="hero-title"[^>]*>Um clássico\.<br><em>O seu momento\.<\/em><\/h2>/,'Manter a abertura original');
  assert.equal((storyHtml.match(/<h1\b/g)||[]).length,1);
  assert(!storyHtml.includes('{{'));
  assert(!/<script[^>]+src="app\.js/.test(storyHtml),'A página de história não deve carregar o controlador da caixa presente');
  assert.match(storyHtml,/<script[^>]+src="site\.js\?v=/);
  assert.match(storyHtml,/<html lang="pt-BR">/);
  const homeIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  const ids=[...storyHtml.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const [,href] of storyHtml.matchAll(/href="([^"]+)"/g)) {
    if(href.startsWith('#')) assert(ids.includes(href.slice(1)),`Âncora da história ausente: ${href}`);
    else if(href.startsWith('index.html#')) assert(homeIds.includes(href.split('#')[1]),`Retorno à home inválido: ${href}`);
    else if(!href.startsWith('https:')) await access(path.join(out,href.split('?')[0]));
  }
  for(const [,src] of storyHtml.matchAll(/src="([^"]+)"/g)) await access(path.join(out,src.split('?')[0]));
  for(const [,srcset] of storyHtml.matchAll(/srcset="([^"]+)"/g)) for(const candidate of srcset.split(',')) await access(path.join(out,candidate.trim().split(' ')[0]));
  for(const [tag] of storyHtml.matchAll(/<img\b[^>]*>/g)) {
    assert.match(tag,/alt="[^"]+"/);assert.match(tag,/width="\d+"/);assert.match(tag,/height="\d+"/);
  }
  if(config.siteUrl) {
    const url=config.siteUrl.replace(/\/$/,'');
    assert.equal(storyHtml.match(/rel="canonical" href="([^"]+)"/)?.[1],`${url}/historia.html`);
    assert.equal(storyHtml.match(/property="og:url" content="([^"]+)"/)?.[1],`${url}/historia.html`);
    assert.equal(storyHtml.match(/property="og:image" content="([^"]+)"/)?.[1],`${url}/assets/img1.jpeg`);
  }
  for(const [tag] of storyHtml.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag,/rel="noopener noreferrer"/);
  const channel=new URL(config.orderBaseUrl);
  const orders=[...storyHtml.matchAll(/href="(https:[^"]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&'))).filter(u=>u.hostname===channel.hostname);
  assert(orders.length>=2);
  for(const order of orders) {assert.equal(order.pathname,channel.pathname);assert(order.searchParams.get('text').includes('Negroni Marson'));}
  console.log('OK: história na raiz e dist, navegação entre páginas, imagens, metadados, pedidos e abertura original preservada.');
}
