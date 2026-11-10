import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {watch} from 'node:fs';
import path from 'node:path';
import {build,root} from './build.mjs';

const production=process.argv.includes('--production');
const port=Number(process.env.PORT||4173);
const out=path.join(root,'dist');
if(!production) await build();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(out,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(out+path.sep)){res.writeHead(403);res.end('Acesso negado');return;}
    const data=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
server.on('error',error=>{console.error(error.message);process.exit(1);});
if(!production){
  let debounce;
  for(const file of ['src/index.template.html','styles.css','app.js','label-story.js','ritual-carousel.js','site.config.json','assets']) watch(path.join(root,file),()=>{
    clearTimeout(debounce);debounce=setTimeout(()=>build().then(()=>console.log('Atualizado. Recarregue a página.')).catch(error=>console.error(error.message)),120);
  });
}
