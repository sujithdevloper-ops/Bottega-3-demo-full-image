/* Animate only existing foreground foliage; CSS photo remains the fallback. */
window.createHeroFoliage = function (layers, motion) {
    'use strict';
    const vertex = `attribute vec2 position; varying vec2 uv; void main(){ uv=position*.5+.5; gl_Position=vec4(position,0.,1.); }`;
    const fragment = `precision mediump float;
        uniform sampler2D photo; uniform vec2 viewport; uniform vec2 imageSize;
        uniform float time; uniform int kind; varying vec2 uv;
        void main(){
            float scale=max(viewport.x/imageSize.x,viewport.y/imageSize.y);
            vec2 visible=viewport/(imageSize*scale);
            vec2 p=(vec2(uv.x,1.-uv.y)-.5)*visible+.5;
            vec4 original=texture2D(photo,p);
            float green=smoothstep(.015,.09,original.g-max(original.r*.88,original.b));
            float region=0.;
            if(kind==1) region=(1.-smoothstep(.25,.40,p.x))*(1.-smoothstep(.23,.38,p.y));
            if(kind==2) region=(1.-smoothstep(.25,.42,p.x))*(1.-smoothstep(.12,.25,p.y));
            if(kind==3){
                region=(1.-smoothstep(.18,.32,p.x))*(1.-smoothstep(.38,.55,p.y));
                region=max(region,smoothstep(.82,.96,p.x)*smoothstep(.70,.88,p.y));
            }
            float wind=sin(time*.85+p.y*7.)*.65+sin(time*1.4+p.x*9.)*.25;
            // Maximum movement is about two CSS pixels; no movement across the buildings.
            vec2 shift=vec2(wind,sin(time*.7+p.x*6.)*.25)*2./(imageSize*scale);
            gl_FragColor=texture2D(photo,clamp(p+shift*region*green,vec2(.001),vec2(.999)));
        }`;
    const states=[]; let frame=null, last=0, inView=true;
    function compile(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Foliage shader unavailable');return shader;}
    function create(layer){
        const canvas=document.createElement('canvas');canvas.className='hero-foliage-canvas';canvas.setAttribute('aria-hidden','true');
        const gl=canvas.getContext('webgl',{alpha:false,antialias:false,preserveDrawingBuffer:false});if(!gl)return null;
        const program=gl.createProgram();gl.attachShader(program,compile(gl,gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl,gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return null;
        gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
        const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
        const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        const state={canvas,gl,program,texture,layer,on:false,ready:false,width:1,height:1,kind:0,uniforms:{}};
        for(const name of ['photo','viewport','imageSize','time','kind'])state.uniforms[name]=gl.getUniformLocation(program,name);
        canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();state.on=false;canvas.hidden=true;});
        layer.appendChild(canvas);return state;
    }
    // On unsupported devices, retain the unmodified CSS background image.
    try { layers.forEach(layer=>states.push(create(layer))); } catch (_) { states.forEach(s=>{if(s)s.canvas.hidden=true;});return null; }
    function running(){return !document.hidden&&inView&&!motion.matches&&states.some(s=>s&&s.on);}
    function draw(timestamp){
        frame=null;if(!running())return;
        if(timestamp-last>=32){last=timestamp;
            for(const s of states){if(!s||!s.on)continue;
                const w=s.layer.clientWidth,h=s.layer.clientHeight;if(!w||!h)continue;
                const ratio=Math.min(window.devicePixelRatio||1,1.25),cw=Math.round(w*ratio),ch=Math.round(h*ratio);
                if(s.canvas.width!==cw||s.canvas.height!==ch){s.canvas.width=cw;s.canvas.height=ch;s.gl.viewport(0,0,cw,ch);}
                const gl=s.gl;gl.useProgram(s.program);gl.uniform1i(s.uniforms.photo,0);gl.uniform2f(s.uniforms.viewport,w,h);gl.uniform2f(s.uniforms.imageSize,s.width,s.height);gl.uniform1f(s.uniforms.time,timestamp/1000);gl.uniform1i(s.uniforms.kind,s.kind);gl.drawArrays(gl.TRIANGLES,0,6);s.ready=true;s.canvas.hidden=false;
            }
        }
        frame=requestAnimationFrame(draw);
    }
    function sync(){states.forEach(s=>{if(s)s.canvas.hidden=!s.on||!s.ready||motion.matches;});if(!running()){if(frame!==null)cancelAnimationFrame(frame);frame=null;}else if(frame===null)frame=requestAnimationFrame(draw);}
    document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
    window.addEventListener('pagehide',()=>{inView=false;sync();});window.addEventListener('pageshow',()=>{inView=true;sync();});
    if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();}).observe(layers[0].parentElement);
    return {
        set(index,image,url){const s=states[index];if(!s||s.gl.isContextLost())return;s.ready=false;s.canvas.hidden=true;s.kind=url.includes('omkar')?1:url.includes('dhanvantari')?2:url.includes('tropical-patio')?3:0;s.on=false;
            if(s.kind){try{s.gl.bindTexture(s.gl.TEXTURE_2D,s.texture);s.gl.texImage2D(s.gl.TEXTURE_2D,0,s.gl.RGBA,s.gl.RGBA,s.gl.UNSIGNED_BYTE,image);s.width=image.naturalWidth;s.height=image.naturalHeight;s.on=true;}catch(_){s.on=false;}}
            sync();
        },
        hide(index){if(states[index])states[index].on=false;sync();}
    };
};
