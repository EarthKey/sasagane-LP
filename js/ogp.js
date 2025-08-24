(() => {
  async function fetchOGP(url) {
    try {
      const res = await fetch(`/api/ogp?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('OGP fetch failed', e);
      return null;
    }
  }

  function renderCard(el, data) {
    if (!data) {
      el.innerHTML = `<div>プレビューを取得できませんでした。<a href="${el.dataset.url}" target="_blank" rel="noopener">リンクを開く</a></div>`;
      return;
    }
    const title = data.title || data.ogTitle || data.twitterTitle || '(無題)';
    const desc = data.description || data.ogDescription || data.twitterDescription || '';
    const img = data.image || data.ogImage || data.twitterImage || '';
    const site = data.siteName || data.ogSiteName || new URL(data.finalUrl || data.url).hostname;

    el.innerHTML = `
      ${img ? `<img class="ogp-card__img" src="${img}" alt="">` : ''}
      <div class="ogp-card__body">
        <a class="ogp-card__title" href="${data.finalUrl || data.url}" target="_blank" rel="noopener">${escapeHtml(title)}</a>
        ${desc ? `<p class="ogp-card__desc">${escapeHtml(desc)}</p>` : ''}
        <div class="ogp-card__site">${escapeHtml(site)}</div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async function init() {
    const els = document.querySelectorAll('.ogp-card[data-url]');
    for (const el of els) {
      const url = el.dataset.url;
      const data = await fetchOGP(url);
      renderCard(el, data);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

