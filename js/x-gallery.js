(function () {
  const GRID_ID = 'tweet-grid';
  // ここにサムネ化したいXのURLを追加してください（複数対応）
  const X_URLS = [
    'https://x.com/EarthGigantea/status/1956917956883145095/history',
    'https://x.com/EarthGigantea/status/1959430857061802093',
    'https://x.com/EarthGigantea/status/1959042911036674556',
    'https://x.com/EarthGigantea/status/1959163700457480345',
  ];

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function fetchOGP(url) {
    try {
      const res = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('OGP fetch failed', e);
      return null;
    }
  }

  function createShell(url) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.dataset.url = url;
    a.className = 'tweet-card loading';
    if (!reduce) a.classList.add('fade-in');
    a.innerHTML = `
      <span class="tweet-card__overlay" aria-hidden="true"></span>
      <span class="tweet-card__label">読み込み中…</span>
    `;
    return a;
  }

  function fillCard(a, meta) {
    const img = meta && (meta.image || meta.ogImage || meta.twitterImage);
    const title = meta && (meta.ogTitle || meta.twitterTitle || meta.title) || 'View on X';
    if (img) a.style.setProperty('--bg', `url('${img}')`);
    a.querySelector('.tweet-card__label').textContent = title;
    a.classList.remove('loading');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    // まずはプレースホルダを並べる
    const cards = X_URLS.map(url => {
      const shell = createShell(url);
      grid.appendChild(shell);
      return shell;
    });

    // 遅延ロード: ビューポートに入ったときだけOGPを取得
    const io = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        io.unobserve(el);
        const url = el.dataset.url;
        const meta = await fetchOGP(url);
        fillCard(el, meta);
        if (!reduce) requestAnimationFrame(() => el.classList.add('visible'));
      });
    }, { rootMargin: '0px 0px 10% 0px', threshold: 0.1 });

    cards.forEach(el => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
