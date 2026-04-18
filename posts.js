// Runtime post loader — fetches posts.json written by Decap CMS,
// converts markdown body to HTML, and exposes window.POSTS (keyed by id).
// Pages should await window.POSTS_READY before rendering.
(function () {
  const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const MONTHS_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function parseDate(v) {
    if (!v) return new Date(NaN);
    if (v.length <= 10) return new Date(v + 'T00:00:00');
    return new Date(v);
  }
  function formatDate(v) {
    const d = parseDate(v);
    return `${MONTHS_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
  function formatShortDate(v) {
    const d = parseDate(v);
    return `${MONTHS_SHORT[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}`;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function inline(s) {
    return s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  }
  function mdToHtml(md) {
    if (!md) return '';
    const blocks = String(md).replace(/\r\n/g, '\n').split(/\n{2,}/).map(s => s.trim()).filter(Boolean);
    return blocks.map(block => {
      const onlyImg = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (onlyImg) {
        return `<figure class="post-image"><img src="${escapeHtml(onlyImg[2])}" alt="${escapeHtml(onlyImg[1])}" loading="lazy" /></figure>`;
      }
      if (block.startsWith('>')) {
        const inner = block.replace(/^>\s?/gm, '');
        return `<blockquote>${inline(escapeHtml(inner)).replace(/\n/g, '<br>')}</blockquote>`;
      }
      let escaped = escapeHtml(block)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, src) => `<img src="${src}" alt="${alt}" loading="lazy" />`);
      return `<p>${inline(escaped).replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
  }

  function deriveExcerpt(body, limit) {
    const max = limit || 90;
    const plain = String(body || '')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^>\s*/gm, '')
      .replace(/\n+/g, ' ')
      .trim();
    if (plain.length <= max) return plain;
    return plain.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  window.POSTS_READY = fetch('posts.json', { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : (data.posts || []);
      const obj = {};
      for (const p of list) {
        obj[p.id] = {
          kind: p.kind,
          isoDate: p.date,
          date: formatDate(p.date),
          shortDate: formatShortDate(p.date),
          title: p.title,
          excerpt: p.excerpt || deriveExcerpt(p.body),
          body: mdToHtml(p.body),
          image: p.image || undefined,
          source: p.source || undefined,
        };
      }
      window.POSTS = obj;
      return obj;
    })
    .catch(err => {
      console.error('Failed to load posts.json', err);
      window.POSTS = {};
      return {};
    });
})();
