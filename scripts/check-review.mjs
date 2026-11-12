import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import path from 'node:path';

export async function checkReview(html,out,root,pages) {
  const section=html.match(/<section class="expert-review section"[\s\S]*?<\/section>/)?.[0];
  assert(section,'Review ausente');
  const video=section.match(/<video\b[^>]*>/)?.[0];
  assert(video?.includes('controls')&&video.includes('playsinline')&&video.includes('preload="none"'));
  assert(!/\b(autoplay|muted|loop)\b/.test(video),'A reprodução deve depender do visitante');
  const source='assets/review-murilo-fazolin.mp4';
  const size=(await stat(path.join(out,source))).size;
  assert(size<25*1024*1024,'MP4 acima do limite por arquivo do Cloudflare Pages');
  const poster=video.match(/poster="([^"]+)"/)[1].split('?')[0];
  assert((await stat(path.join(out,poster))).size<100_000,'Capa muito pesada');
  const track=section.match(/<track[^>]+src="([^"]+)"[^>]*>/);
  assert(track?.[0].includes('srclang="pt-BR"')&&track[0].includes('default'));
  const captions=(await readFile(path.join(out,track[1]),'utf8')).replace(/\r\n/g,'\n');
  assert(captions.startsWith('WEBVTT'));
  const seconds=time=>time.split(':').reduce((sum,part)=>sum*60+Number(part),0);
  let previousEnd=0,count=0;
  for(const cue of captions.matchAll(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})\n([^\n]+(?:\n[^\n]+)?)/g)) {
    const start=seconds(cue[1]),end=seconds(cue[2]);
    assert(start>=previousEnd&&end>start&&end<282,'Legenda fora de ordem ou duração');
    assert(!cue[3].includes('-->'));
    previousEnd=end;count++;
  }
  assert(count>=40,'Legendas incompletas');
  // MP4 metadata must precede media data for a quick start on static hosting.
  const bytes=await readFile(path.join(out,source));
  assert(bytes.indexOf(Buffer.from('moov'))<bytes.indexOf(Buffer.from('mdat')));
  const server=spawn(process.execPath,['scripts/server.mjs','--production'],{cwd:root,env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
  try {
    const base=await new Promise((resolve,reject)=>{
      let output='';
      const timeout=setTimeout(()=>reject(new Error('Servidor não iniciou')),10000);
      server.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timeout);resolve(match[0]);}});
      server.once('error',error=>{clearTimeout(timeout);reject(error);});
      server.once('exit',code=>{clearTimeout(timeout);reject(new Error(`Servidor encerrou: ${code}`));});
    });
    const request=(file,options={})=>fetch(`${base}/${file}`,{...options,signal:AbortSignal.timeout(10000)});
    for(const [name,expected] of Object.entries(pages)) {
      const response=await request(name);
      assert.equal(response.status,200,`Página indisponível: ${name}`);
      assert.match(response.headers.get('content-type'),/^text\/html/);
      assert.equal(await response.text(),expected);
    }
    const head=await request(source,{method:'HEAD'});
    assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');assert.equal(Number(head.headers.get('content-length')),size);
    for(const [range,start,end] of [['bytes=0-1023',0,1023],['bytes=100-',100,size-1],['bytes=-1024',size-1024,size-1]]) {
      const response=await request(source,{headers:{Range:range}});
      assert.equal(response.status,206);
      assert.equal(response.headers.get('content-range'),`bytes ${start}-${end}/${size}`);
      if(end-start<2000) assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes.subarray(start,end+1));
      else await response.body.cancel();
    }
    for(const range of [`bytes=${size}-`,'bytes=20-10','bytes=-0','bytes=0-1,4-8']) {
      const response=await request(source,{headers:{Range:range}});
      assert.equal(response.status,416);assert.equal(response.headers.get('content-range'),`bytes */${size}`);
    }
    for(const file of [poster,track[1]]) {
      const response=await request(file);assert.equal(response.status,200);
      if(file.endsWith('.vtt')) assert.match(response.headers.get('content-type'),/^text\/vtt/);
      await response.arrayBuffer();
    }
  } finally {
    const stopped=once(server,'exit');server.kill();await stopped;
  }
  console.log(`Review: MP4 ${(size/1e6).toFixed(1)} MB, ${count} legendas, capa, MIME e navegação por intervalos OK.`);
}
