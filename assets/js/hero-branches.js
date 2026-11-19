/* One transparent botanical overlay per hero scene; continuous mesh avoids cut seams. */
(() => {
'use strict';
const root = document.querySelector('.hero-corner-branches');
if (!root) return;
const scenes = [...root.querySelectorAll('.hero-botanical-scene')];
let active = 0, visible = true, frame = 0, last = 0;
const renderers = [], sways = [];
const vertex = `
attribute vec2 point; varying vec2 uv;
uniform float time; uniform float rightSide; uniform float phase;
void main() {
 uv=point;
 vec2 p=point;
 float x=mix(p.x,1.-p.x,rightSide);
 float reach=clamp(length(vec2(x,p.y))*.75,0.,1.);
 float wind=sin(time*.8+phase+p.y*2.8);
 float flutter=sin(time*2.4+p.x*18.+p.y*13.+phase);
 p.x += (.013*wind+.0038*flutter)*reach;
 p.y += (.010*sin(time*.65+phase+p.x*3.)+.003*sin(time*2.8+p.y*21.+p.x*8.))*reach;
 // A little transparent padding keeps tips inside the canvas during bending.
 vec2 pos=(p-.5)*1.88;
 gl_Position=vec4(pos.x,-pos.y,0.,1.);
}`;
const fragment = `
precision mediump float;
varying vec2 uv; uniform sampler2D photo;
void main() {
 vec4 c=texture2D(photo,uv);
 c.a=smoothstep(.16,.9,c.a);
 gl_FragColor=c;
}`;
function renderer(img,index) {
 const canvas=document.createElement('canvas');
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:true,depth:false,stencil:false,powerPreference:'low-power'});
 if(!gl) return;
 let program,texture,buffer;
 try {
  const shader=(type,source)=>{
   const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
   if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader unavailable');
   return s;
  };
  program=gl.createProgram();
  const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  gl.deleteShader(vs);gl.deleteShader(fs);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Program unavailable');
  gl.useProgram(program);
  const points=[],steps=44;
  for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){
   const a=x/steps,b=y/steps,c=(x+1)/steps,d=(y+1)/steps;
   points.push(a,b,c,b,a,d,a,d,c,b,c,d);
  }
  buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(points),gl.STATIC_DRAW);
  const point=gl.getAttribLocation(program,'point');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,2,gl.FLOAT,false,0,0);
  texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
  gl.uniform1i(gl.getUniformLocation(program,'photo'),0);
  gl.uniform1f(gl.getUniformLocation(program,'rightSide'),index===4?1:0);
  gl.uniform1f(gl.getUniformLocation(program,'phase'),index*1.7);
  const clock=gl.getUniformLocation(program,'time');
  const draw=t=>{
   const width=Math.max(1,Math.round(canvas.clientWidth*Math.min(window.devicePixelRatio||1,1.25)));
   const height=Math.max(1,Math.round(width*img.naturalHeight/img.naturalWidth));
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
   gl.viewport(0,0,width,height);gl.uniform1f(clock,t/1000);gl.drawArrays(gl.TRIANGLES,0,points.length/2);
  };
  canvas.style.aspectRatio=img.naturalWidth+'/'+img.naturalHeight;
  canvas.setAttribute('aria-hidden','true');
  img.after(canvas);draw(performance.now());img.hidden=true;
  scenes[index].setAttribute('data-motion','mesh');
  canvas.addEventListener('webglcontextlost',e=>{
   e.preventDefault();canvas.hidden=true;img.hidden=false;renderers[index]=null;
   scenes[index].setAttribute('data-motion','sway');
  });
  renderers[index]=draw;
 } catch (_) {
  if(texture)gl.deleteTexture(texture);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);
  canvas.remove();
 }
}
function tick(now) {
 frame=0;
 if(document.hidden||!visible)return;
 if(now-last>=33){last=now;renderers.forEach((draw,index)=>{if(draw&&(index===active||scenes[index].classList.contains('is-leaving')))draw(now);});}
 frame=requestAnimationFrame(tick);
}
function update() {
 const paused=document.hidden||!visible;
 sways.forEach(a=>paused?a.pause():a.play());
 if(paused){cancelAnimationFrame(frame);frame=0;}
 else if(!frame)frame=requestAnimationFrame(tick);
}
const leaveTimers=[];
window.prepareHeroBranchScene=index=>{
 const img=scenes[index]?.querySelector('img');
 if(!img||!img.decode)return Promise.resolve();
 return img.decode().catch(()=>{});
};
window.setHeroBranchScene=index=>{
 if(!Number.isInteger(index)||!scenes[index])return;
 if(index===active&&scenes[index].classList.contains('is-active'))return;
 const previous=active;active=index;
 scenes.forEach((scene,i)=>{
  clearTimeout(leaveTimers[i]);
  scene.classList.toggle('is-active',i===active);
  scene.classList.toggle('is-leaving',i===previous&&i!==active);
  if(i===previous&&i!==active)leaveTimers[i]=setTimeout(()=>scene.classList.remove('is-leaving'),2150);
 });
};
scenes.forEach((scene,index)=>{
 const art=scene.querySelector('.hero-botanical-art'),img=scene.querySelector('img');
 art.style.transformOrigin=index===4?'100% 0':'0 0';
 if(art.animate)sways.push(art.animate([
 {transform:'rotate(-1.5deg)'},{transform:'rotate(1.5deg)'},{transform:'rotate(-1.5deg)'}
 ],{duration:7000+index*550,delay:-index*900,iterations:Infinity,easing:'ease-in-out'}));
 const loaded=()=>renderer(img,index);
 if(img.complete&&img.naturalWidth)loaded();else img.addEventListener('load',loaded,{once:true});
});
window.setHeroBranchScene(0);
document.addEventListener('visibilitychange',update);
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();}).observe(root);
update();
})();

