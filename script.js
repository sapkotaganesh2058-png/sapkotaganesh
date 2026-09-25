(() => {
  const progress=document.getElementById('progress');
  const year=document.getElementById('year');
  const hero=document.getElementById('heroVisual');
  year.textContent=new Date().getFullYear();
  const updateProgress=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';};
  addEventListener('scroll',updateProgress,{passive:true});updateProgress();
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  if(hero&&matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    hero.addEventListener('mousemove',e=>{const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;hero.style.transform='perspective(1100px) rotateY('+(x*4.5)+'deg) rotateX('+(-y*4.5)+'deg) translateY(-4px)';});
    hero.addEventListener('mouseleave',()=>hero.style.transform='');
  }
})();