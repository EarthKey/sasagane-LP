(function () {
  const GRID_ID = 'tweet-grid';
  // ここにサムネ化したいXのURLを追加してください
  const X_URLS = [
    'https://x.com/EarthGigantea/status/1956917956883145095/history',
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

  function createCard({ url, image, title }) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'tweet-card';
    if (!reduce) a.classList.add('fade-in');

    if (image) {
      a.style.setProperty('--bg', `url('${image}')`);
    }
    a.innerHTML = `
      <span class="tweet-card__overlay" aria-hidden="true"></span>
      <span class="tweet-card__label">${escapeHtml(title || 'View on X')}</span>
    `;
    return a;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    for (const url of X_URLS) {
      const meta = await fetchOGP(url);
      const img = meta && (meta.image || meta.ogImage || meta.twitterImage);
      const title = meta && (meta.ogTitle || meta.twitterTitle || meta.title);
      const card = createCard({ url, image: img, title });
      grid.appendChild(card);
      // 即時可視化（IO初期化済みでない動的要素のため）
      if (!reduce) requestAnimationFrame(() => card.classList.add('visible'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

