// 追加のUIや埋め込み実装はここに

// 桜の落下アニメーション
document.addEventListener('DOMContentLoaded', () => {
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const container = document.querySelector('.sakura');
  if (!container || reduce) return;

  const COUNT = 24;
  for (let i = 0; i < COUNT; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    const size = 8 + Math.random() * 10; // 8px - 18px
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 0.8}px`;
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
    petal.style.animationDelay = `${(-Math.random() * 12).toFixed(2)}s`;
    petal.style.setProperty('--fd', `${(10 + Math.random() * 10).toFixed(2)}s`); // fall duration
    petal.style.setProperty('--sd', `${(3 + Math.random() * 4).toFixed(2)}s`);  // sway duration
    petal.style.setProperty('--amp', `${(10 + Math.random() * 20).toFixed(0)}px`); // sway amplitude
    container.appendChild(petal);
  }
});

// ===== Scroll Fade-in with IntersectionObserver
(function () {
  // モーション控えめ設定なら何もしない
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // 対象: セクションや主要カード類を包括的に
  const selectors = [
    'header', 'footer', 'section', 'main',
    '.cards li', '.card', 'figure', '.grid > *',
    '.btn', '.btn--lg', '.hero', '#hero', '.programs li'
  ];
  const nodes = document.querySelectorAll(selectors.join(','));

  // 既にクラスが付いていなければ付与
  nodes.forEach(el => {
    if (!el.classList.contains('fade-in')) el.classList.add('fade-in');
  });

  // ビューポートに入ったら可視化
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // 一度表示したら監視解除（無駄なコスト削減）
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  nodes.forEach(el => io.observe(el));
})();
