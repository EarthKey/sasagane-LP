// Vercel Serverless Function: Fetch OGP metadata
export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).json({ error: 'Missing url param' });
    return;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(target, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timeout);
    const finalUrl = resp.url || target;
    const html = await resp.text();

    const meta = extractMeta(html, finalUrl);
    meta.url = target;
    meta.finalUrl = finalUrl;
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=86400');
    res.status(200).json(meta);
  } catch (e) {
    res.status(200).json(null); // graceful fallback
  }
}

function extractMeta(html, baseUrl) {
  const get = (pattern) => {
    const m = html.match(pattern);
    return m ? decodeHTMLEntities(m[1]) : '';
  };
  const relToAbs = (u) => {
    try { return new URL(u, baseUrl).toString(); } catch { return u; }
  };

  const ogTitle = get(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                  get(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i);
  const ogDescription = get(/<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                        get(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i);
  let ogImage = get(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
                get(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);
  if (ogImage) ogImage = relToAbs(ogImage);
  const ogSiteName = get(/<meta[^>]+property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i);

  const twitterTitle = get(/<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  const twitterDescription = get(/<meta[^>]+name=["']twitter:description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  let twitterImage = get(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (twitterImage) twitterImage = relToAbs(twitterImage);

  const title = get(/<title[^>]*>([^<]+)<\/title>/i);
  const description = get(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);

  return {
    ogTitle, ogDescription, ogImage, ogSiteName,
    twitterTitle, twitterDescription, twitterImage,
    title, description,
    image: ogImage || twitterImage || '',
    siteName: ogSiteName || '',
  };
}

function decodeHTMLEntities(str) {
  if (!str) return str;
  return str.replace(/&(#\d+|#x[\da-fA-F]+|[a-zA-Z]+);/g, (m, code) => {
    if (code[0] === '#') {
      const isHex = code[1].toLowerCase() === 'x';
      const num = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return String.fromCodePoint(num);
    }
    const map = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
    return map[code] || m;
  });
}

