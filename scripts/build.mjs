import {readFile,writeFile,mkdir,cp,readdir,unlink} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';

export const root = fileURLToPath(new URL('../',import.meta.url));
export const pageNames=['index','historia','rotulo','colecao','review','presentes','ritual'];
export async function build(){
  const config=JSON.parse(await readFile(path.join(root,'site.config.json'),'utf8'));
  const destination=new URL(config.orderBaseUrl);
  if(destination.protocol!=='https:') throw new Error('O canal de pedidos precisa usar HTTPS.');
  const siteUrl=config.siteUrl?.trim().replace(/\/$/,'');
  if(siteUrl && new URL(siteUrl).protocol!=='https:') throw new Error('siteUrl precisa usar HTTPS.');
  const escape=(s)=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const order=(key)=>{
    if(!config.orderMessages[key]) throw new Error(`Mensagem ausente para ${key}`);
    const url=new URL(destination);
    if(['wa.me','api.whatsapp.com'].includes(url.hostname)) url.searchParams.set('text',config.orderMessages[key]);
    return url.href;
  };
  const template=await readFile(path.join(root,'src/index.template.html'),'utf8');
  const header=template.match(/<header class="header">[\s\S]*?<\/header>/)?.[0];
  const footer=template.match(/<footer class="footer">[\s\S]*?<\/footer>/)?.[0];
  const mobileOrder=template.match(/<div class="mobile-order">[\s\S]*?<\/div>/)?.[0];
  if(!header||!footer||!mobileOrder) throw new Error('Cabeçalho ou rodapé compartilhado ausente.');
  const homeLinks=markup=>markup.replace(/href="#([^"]+)"/g,'href="index.html#$1"');
  const render=(source,pagePath='',socialImage='assets/social.jpg')=>{
    const canonical=siteUrl?`${siteUrl}/${pagePath}`:'';
    const activePage=pagePath||'index.html';
    const pageHeader=homeLinks(header).replaceAll(`href="${activePage}"`,`href="${activePage}" aria-current="page"`);
    const result=source.replaceAll('{{siteHeader}}',pageHeader)
    .replaceAll('{{siteFooter}}',homeLinks(footer+mobileOrder))
    .replace(/\{\{order:([^}]+)\}\}/g,(_,key)=>escape(order(key)))
    .replaceAll('{{instagramUrl}}',escape(config.instagramUrl))
    .replaceAll('{{reviewerInstagramUrl}}',escape(config.reviewerInstagramUrl))
    .replaceAll('{{catalogUrl}}',escape(config.catalogUrl))
    .replaceAll('{{facebookUrl}}',escape(config.facebookUrl))
    .replaceAll('{{whatsappDisplay}}',escape(config.whatsappDisplay))
    .replaceAll('{{socialImage}}',escape(siteUrl?`${siteUrl}/${socialImage}`:socialImage))
    .replaceAll('{{canonical}}',canonical?`<link rel="canonical" href="${escape(canonical)}"><meta property="og:url" content="${escape(canonical)}">`:'');
    if(result.includes('{{')) throw new Error(`Placeholder pendente em ${pagePath||'index.html'}.`);
    return result;
  };
  const pages={};
  for(const name of pageNames) {
    const source=name==='index'?template.replace(header,'{{siteHeader}}'):await readFile(path.join(root,`src/${name}.template.html`),'utf8');
    pages[`${name}.html`]=render(source,name==='index'?'':`${name}.html`,name==='historia'?'assets/img1.jpeg':'assets/social.jpg');
  }
  // Give returning GitHub Pages visitors the matching assets after each edit.
  for(const file of ['styles.css','app.js','site.js','label-story.js','ritual-carousel.js','collection-carousel.js','assets/review-murilo-fazolin.mp4','assets/review-murilo-fazolin-capa.webp','assets/favicon-marson.ico','assets/favicon-marson-32.png','assets/apple-touch-icon-marson.png']) {
    const bytes=await readFile(path.join(root,file));
    const content=/\.(css|js)$/.test(file)?bytes.toString('utf8').replace(/\r\n/g,'\n'):bytes;
    const hash=createHash('sha256').update(content).digest('hex').slice(0,10);
    for(const name of Object.keys(pages)) pages[name]=pages[name].replaceAll(`"${file}"`,`"${file}?v=${hash}"`);
  }
  const out=path.join(root,'dist');
  await mkdir(out,{recursive:true});
  // GitHub Pages can serve the repository root directly. Keep that entry point
  // valid static HTML, including working contacts before any JavaScript runs.
  for(const [name,content] of Object.entries(pages)) {
    await writeFile(path.join(out,name),content);
    const entry=path.join(root,name);
    if(await readFile(entry,'utf8').catch(()=>'') !== content) await writeFile(entry,content);
  }
  await writeFile(path.join(out,'.nojekyll'),'');
  // Pages stores the custom domain in the source root. Preserve it when
  // publishing dist as well, and clear an old generated copy after removal.
  const cname=await readFile(path.join(root,'CNAME'),'utf8').catch(error=>{
    if(error.code==='ENOENT') return null;
    throw error;
  });
  if(cname!==null) await writeFile(path.join(out,'CNAME'),cname);
  else await unlink(path.join(out,'CNAME')).catch(error=>{
    if(error.code!=='ENOENT') throw error;
  });
  for(const file of ['styles.css','app.js','site.js','label-story.js','ritual-carousel.js','collection-carousel.js','assets']) await cp(path.join(root,file),path.join(out,file),{
    recursive:true,
    // Keep supplied Instagram captures in the workspace; ship optimized assets.
    filter:source=>!/^WhatsApp (Image|Video) /.test(path.basename(source))
  });
  // Remove only stale generated copies left by earlier builds. Originals in
  // the workspace's assets directory are never modified or removed here.
  const assetOutput=path.join(out,'assets');
  for(const name of await readdir(assetOutput)) {
    if(/^WhatsApp (Image|Video) /.test(name) && /\.(jpe?g|mp4)$/i.test(name)) await unlink(path.join(assetOutput,name));
  }
  if(siteUrl) await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n`);
  return {out,config,pages,html:pages['index.html'],storyHtml:pages['historia.html']};
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const {out,config}=await build();
  console.log(`Build concluído: ${out}`);
  if(!config.siteUrl) console.log('Publicação: configure siteUrl para URLs absolutas de compartilhamento e canonical.');
}
