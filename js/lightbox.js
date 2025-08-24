(function(){
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function createLightbox(){
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = '<img class="lightbox-image" alt="expanded image">';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e)=>{
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape') close();
    });
    return overlay;
  }
  let overlayEl = null;
  function open(src, alt){
    if (!overlayEl) overlayEl = createLightbox();
    const img = overlayEl.querySelector('.lightbox-image');
    img.src = src;
    img.alt = alt || '';
    overlayEl.classList.add('show');
  }
  function close(){
    if (overlayEl) overlayEl.classList.remove('show');
  }

  function init(){
    const imgs = document.querySelectorAll('main .grid img');
    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', ()=> open(img.src, img.alt));
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

