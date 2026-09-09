/* ==========================================================
   Magnus Academy — home page (index.html) behaviour
   Theme menu, headline character-reveal animation,
   and the Three.js particle background.
   ========================================================== */

/* =========================================================
   Theme menu
   ========================================================= */
(function themeMenu(){
  const root = document.documentElement;
  const brand = document.querySelector('.brand');
  const toggle = document.getElementById('theme-menu-toggle');
  const menu = document.getElementById('theme-menu');
  const choices = [...menu.querySelectorAll('[data-theme-choice]')];

  const queryTheme = new URLSearchParams(location.search).get('theme');
  if(queryTheme === 'dark' || queryTheme === 'light'){
    root.dataset.theme = queryTheme;
  }else{
    try{
      const saved = localStorage.getItem('magnus-theme');
      if(saved === 'dark') root.dataset.theme = 'dark';
    }catch(err){}
  }

  function updateChoices(){
    const activeTheme = root.dataset.theme === 'dark' ? 'dark' : 'light';
    choices.forEach(choice => {
      choice.setAttribute('aria-checked', String(choice.dataset.themeChoice === activeTheme));
    });
  }

  function closeMenu(){
    menu.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', event => {
    event.stopPropagation();
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
  });

  function chooseTheme(event){
    event.stopPropagation();
    const choice = event.target.closest('[data-theme-choice]');
    if(!choice) return;
    const nextTheme = choice.dataset.themeChoice;
    root.dataset.theme = nextTheme;
    try{ localStorage.setItem('magnus-theme', nextTheme); }catch(err){}
    updateChoices();
    closeMenu();
  }

  menu.addEventListener('pointerup', chooseTheme);
  menu.addEventListener('click', chooseTheme);

  document.addEventListener('click', event => {
    if(!brand.contains(event.target)) closeMenu();
  });

  updateChoices();
})();

/* =========================================================
   Headline: character-reveal, same treatment as the source
   ========================================================= */
(function typeHeadline(){
  const el = document.getElementById('headline');
  const lines = ["Precision coaching for", "JEE & NEET achievers", "Magnus Academy"];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let globalIndex = 0;

  lines.forEach((lineText, li) => {
    const lineEl = document.createElement('span');
    lineEl.className = 'line';
    const words = lineText.split(' ');
    words.forEach((word, wi) => {
      const wordEl = document.createElement('span');
      wordEl.className = 'word';
      [...word].forEach(ch => {
        const charEl = document.createElement('span');
        charEl.className = 'char';
        charEl.textContent = ch;
        const idx = globalIndex++;
        if(!reduce){
          charEl.style.opacity = '0';
          charEl.style.transform = 'translateY(30px)';
          charEl.style.filter = 'blur(7px)';
          charEl.style.transition = 'opacity 1.4s cubic-bezier(.16,1,.3,1), transform 1.4s cubic-bezier(.16,1,.3,1), filter 1.4s cubic-bezier(.16,1,.3,1)';
          setTimeout(() => {
            charEl.style.opacity = '1';
            charEl.style.transform = 'translateY(0)';
            charEl.style.filter = 'blur(0px)';
          }, 500 + idx * 55);
        }
        wordEl.appendChild(charEl);
      });
      lineEl.appendChild(wordEl);
      if(wi < words.length - 1) lineEl.appendChild(document.createTextNode('\u00A0'));
    });
    el.appendChild(lineEl);
  });
})();

/* =========================================================
   Background particle field (adapted from LuminousFieldHero)
   ========================================================= */
(function particleField(){
  if(typeof THREE === 'undefined'){ return; }
  const canvas = document.getElementById('particle-canvas');
  const container = canvas.parentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020611, 0.055);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true, powerPreference:'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const isCompact = window.matchMedia('(max-width: 640px)').matches;
  const particleCount = isCompact ? 6000 : 12000;

  const positions = new Float32Array(particleCount * 3);
  const origins = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const blue = new THREE.Color('#1689fe');
  const cyan = new THREE.Color('#74e8ff');
  const violet = new THREE.Color('#8b7cff');
  const color = new THREE.Color();

  for(let i = 0; i < particleCount; i += 1){
    const idx = i * 3;
    const t = (i / particleCount) * Math.PI * 6;
    const phase = Math.random() * Math.PI * 2;
    const spread = (Math.random() - 0.5) * 0.34;
    const haze = (Math.random() - 0.5) * 0.13;
    const ring = 1.32 + 0.5 * Math.cos(3 * t);

    const x = ring * Math.cos(2*t) + Math.cos(phase)*spread + haze;
    const y = ring * Math.sin(2*t) + Math.sin(phase)*spread + haze;
    const z = 0.62 * Math.sin(3*t) + Math.sin(phase*1.7)*spread;

    positions[idx] = x; positions[idx+1] = y; positions[idx+2] = z;
    origins[idx] = x; origins[idx+1] = y; origins[idx+2] = z;

    const mix = (Math.sin(t*0.65)+1)*0.5;
    color.copy(mix < 0.55 ? blue : violet).lerp(cyan, mix < 0.55 ? mix/0.55 : (1-mix)/0.45);
    const brightness = 0.68 + Math.random()*0.32;
    colors[idx] = color.r*brightness; colors[idx+1] = color.g*brightness; colors[idx+2] = color.b*brightness;
  }

  const geometry = new THREE.BufferGeometry();
  const positionAttribute = new THREE.BufferAttribute(positions, 3);
  positionAttribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: isCompact ? 0.035 : 0.024,
    sizeAttenuation:true,
    vertexColors:true,
    transparent:true,
    opacity:0.8,
    depthWrite:false,
    blending:THREE.AdditiveBlending
  });

  const cloud = new THREE.Points(geometry, material);
  cloud.rotation.x = -0.18;
  scene.add(cloud);

  let pointerActive = false, pointerX = 10, pointerY = 10, smoothX = 10, smoothY = 10;
  let frameId = 0, running = true;
  const clock = new THREE.Clock();

  function resize(){
    const b = container.getBoundingClientRect();
    const w = Math.max(1,b.width), h = Math.max(1,b.height);
    camera.aspect = w/h; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompact ? 1.5 : 1.8));
    renderer.setSize(w,h,false);
    const scale = w < 520 ? 0.72 : w < 900 ? 0.86 : 1;
    cloud.scale.setScalar(scale);
  }

  function updatePointer(e){
    const b = container.getBoundingClientRect();
    pointerX = (((e.clientX-b.left)/b.width)*2-1)*3.15;
    pointerY = (1-((e.clientY-b.top)/b.height)*2)*2.25;
    pointerActive = true;
  }
  function clearPointer(){ pointerActive = false; pointerX = 10; pointerY = 10; }

  function animate(){
    if(!running) return;
    frameId = requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    smoothX += (pointerX - smoothX) * 0.08;
    smoothY += (pointerY - smoothY) * 0.08;

    if(!reduceMotion){
      const radius = 1.35, radiusSq = radius*radius;
      for(let i=0;i<particleCount;i+=1){
        const idx = i*3;
        const x = positions[idx], y = positions[idx+1], z = positions[idx+2];
        let vx = velocities[idx], vy = velocities[idx+1], vz = velocities[idx+2];

        if(pointerActive){
          const dx = x - smoothX, dy = y - smoothY;
          const distSq = dx*dx + dy*dy + z*z*0.22;
          if(distSq < radiusSq){
            const dist = Math.sqrt(distSq) + 0.0001;
            const force = (1 - dist/radius) * 0.026;
            vx += (dx/dist)*force; vy += (dy/dist)*force; vz += (z/dist)*force*0.35;
          }
        }
        const drift = Math.sin(time*0.8 + i*0.017)*0.008;
        vx += (origins[idx]-x)*0.013;
        vy += (origins[idx+1]+drift-y)*0.013;
        vz += (origins[idx+2]-z)*0.013;
        vx*=0.91; vy*=0.91; vz*=0.91;

        positions[idx]+=vx; positions[idx+1]+=vy; positions[idx+2]+=vz;
        velocities[idx]=vx; velocities[idx+1]=vy; velocities[idx+2]=vz;
      }
      positionAttribute.needsUpdate = true;
      cloud.rotation.y = time*0.075 + smoothX*0.018;
      cloud.rotation.x = -0.18 - smoothY*0.012;
    }
    renderer.render(scene, camera);
  }

  function handleVisibility(){
    if(document.hidden){ running=false; cancelAnimationFrame(frameId); }
    else if(!running){ running=true; clock.getDelta(); animate(); }
  }

  new ResizeObserver(resize).observe(container);
  window.addEventListener('pointermove', updatePointer, {passive:true});
  window.addEventListener('blur', clearPointer);
  document.addEventListener('visibilitychange', handleVisibility);

  resize();
  animate();
})();
