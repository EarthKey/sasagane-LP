(function () {
  const GRID_ID = 'tweet-grid';
  const FEATURED_ID = 'tweet-featured';
  // 特集カード（上部中央に1枚）: アースキー対談編に固定
  const FEATURED_URL = 'https://x.com/EarthGigantea/status/1959812991295316296';
  // 表示するXのURL一覧（順序通りに表示）: 新規4件 + これまでの全件
  const ALL_URLS = [
    // 新規4件
    'https://x.com/EarthGigantea/status/1963162906574668192', // ささがねワールド編
    'https://x.com/EarthGigantea/status/1963013770307109212', // LIFE IS MAMAGOTO編
    'https://x.com/EarthGigantea/status/1962849293414658123', // CNPお薬手帳編
    'https://x.com/EarthGigantea/status/1963528771186954396', // CNGT配布編
    // 既存（従来の掲載分）
    'https://x.com/EarthGigantea/status/1956917956883145095/history',
    'https://x.com/EarthGigantea/status/1959430857061802093',
    'https://x.com/EarthGigantea/status/1959042911036674556',
    'https://x.com/EarthGigantea/status/1958050239568572489',
    'https://x.com/EarthGigantea/status/1959812991295316296',
    'https://x.com/EarthGigantea/status/1959858281838694710',
    'https://x.com/EarthGigantea/status/1959567152262062271',
    'https://x.com/EarthGigantea/status/1959912101096694106',
    'https://x.com/EarthGigantea/status/1958509076658434275',
  ];
  const GRID_URLS = ALL_URLS.filter(u => u !== FEATURED_URL);

  // 各URLに表示したいカスタムタイトル（指定がある場合）
  const CUSTOM_TITLES = {
    // 新規4件
    'https://x.com/EarthGigantea/status/1963162906574668192': 'ささがねワールド編',
    'https://x.com/EarthGigantea/status/1963013770307109212': 'LIFE IS MAMAGOTO編',
    'https://x.com/EarthGigantea/status/1962849293414658123': 'CNPお薬手帳編',
    'https://x.com/EarthGigantea/status/1963528771186954396': 'CNGT配布編',
    // 既存タイトル（維持）
    'https://x.com/EarthGigantea/status/1956917956883145095/history': 'CNPトレカ編',
    'https://x.com/EarthGigantea/status/1959430857061802093': 'にんセレ参加編',
    'https://x.com/EarthGigantea/status/1959042911036674556': 'クリプトニンジャ咲耶OP編',
    'https://x.com/EarthGigantea/status/1958050239568572489': 'クリプトニンジャオンライン編',
    'https://x.com/EarthGigantea/status/1959812991295316296': 'アースキー対談編',
    'https://x.com/EarthGigantea/status/1959858281838694710': '投票権（CNGT）編',
    'https://x.com/EarthGigantea/status/1959567152262062271': 'ワンドロ大会編',
    'https://x.com/EarthGigantea/status/1959912101096694106': 'ささがね　MV編',
    'https://x.com/EarthGigantea/status/1958509076658434275': 'ささがね誕生編',
  };

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
    const overrideTitle = CUSTOM_TITLES[a.dataset.url];
    const title = overrideTitle || (meta && (meta.ogTitle || meta.twitterTitle || meta.title)) || 'Xの投稿を開く';
    const labelEl = a.querySelector('.tweet-card__label');
    labelEl.textContent = title;
    if (img) {
      a.style.setProperty('--bg', `url('${img}')`);
      a.classList.remove('no-image');
    } else {
      a.style.removeProperty('--bg');
      a.classList.add('no-image');
    }
    a.setAttribute('aria-label', title);
    a.classList.remove('loading');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    const featured = document.getElementById(FEATURED_ID);
    if (!grid) return;

    const cards = [];

    // 特集カードを先に配置（中央・大きめ）
    if (featured && FEATURED_URL) {
      const shell = createShell(FEATURED_URL);
      shell.classList.add('tweet-card--featured');
      featured.appendChild(shell);
      cards.push(shell);
    }

    // そのほかのカードをグリッドに並べる
    GRID_URLS.forEach(url => {
      const shell = createShell(url);
      grid.appendChild(shell);
      cards.push(shell);
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
