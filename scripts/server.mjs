import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {watch,createReadStream} from 'node:fs';
import {pipeline} from 'node:stream/promises';
import path from 'node:path';
import {build,root,pageNames} from './build.mjs';

const production=process.argv.includes('--production');
const port=Number(process.env.PORT||4173);
const out=path.join(root,'dist');
if(!production) await build();
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.avif':'image/avif','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.ico':'image/x-icon','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.mp4':'video/mp4','.vtt':'text/vtt; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(out,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(out+path.sep)){res.writeHead(403);res.end('Acesso negado');return;}
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
    if(path.extname(file)==='.mp4') {
      const {size}=await stat(file);
      Object.assign(headers,{'Accept-Ranges':'bytes','Content-Length':size});
      let start=0,end=size-1,status=200;
      // Seeking must also work in the local preview, without buffering the MP4.
      if(req.headers.range) {
        const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if(!range || (!range[1]&&!range[2])) {res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
        start=range[1]?Number(range[1]):Math.max(0,size-Number(range[2]));
        end=range[1]&&range[2]?Math.min(Number(range[2]),size-1):size-1;
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size) {res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
        status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;headers['Content-Length']=end-start+1;
      }
      res.writeHead(status,headers);
      if(req.method==='HEAD') {res.end();return;}
      await pipeline(createReadStream(file,{start,end}),res);
      return;
    }
    const data=await readFile(file);
    res.writeHead(200,{...headers,'Content-Length':data.length});
    if(req.method==='HEAD') {res.end();return;}
    res.end(data);
  }catch{if(!res.headersSent){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Página não encontrada');}else res.destroy();}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
server.on('error',error=>{console.error(error.message);process.exit(1);});
if(!production){
  let debounce;
  for(const file of [...pageNames.map(name=>`src/${name}.template.html`),'styles.css','app.js','site.js','label-story.js','ritual-carousel.js','collection-carousel.js','site.config.json','assets']) watch(path.join(root,file),()=>{
    clearTimeout(debounce);debounce=setTimeout(()=>build().then(()=>console.log('Atualizado. Recarregue a página.')).catch(error=>console.error(error.message)),120);
  });
}
