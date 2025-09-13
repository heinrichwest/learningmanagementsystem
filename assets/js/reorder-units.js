// Reorder course accordion units by numeric order (Study Unit 1, 2, 3, ...)
// Applies to pages with a container #course-outline and .accordion-item blocks.
(function () {
  function parseUnitOrder(title) {
    if (!title) return { order: Number.MAX_SAFE_INTEGER - 1, type: 'other' };
    const t = String(title).trim();
    const m = t.match(/study\s*unit\s*(\d+)/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n)) return { order: n, type: 'unit' };
    }
    if (/^author\s*:/i.test(t)) return { order: Number.MAX_SAFE_INTEGER, type: 'author' };
    return { order: Number.MAX_SAFE_INTEGER - 2, type: 'other' };
  }

  function reorder() {
    const container = document.querySelector('#course-outline');
    if (!container) return;
    const items = Array.from(container.querySelectorAll('.accordion-item'));
    if (!items.length) return;
    const mapped = items.map((el, idx) => {
      const titleEl = el.querySelector('.accordion-title') || el.querySelector('.accordion-header') || el.querySelector('h3');
      const title = titleEl ? titleEl.textContent : '';
      const info = parseUnitOrder(title);
      return { el, idx, order: info.order, type: info.type };
    });
    mapped.sort((a, b) => (a.order === b.order ? a.idx - b.idx : a.order - b.order));
    // Append back in new order
    mapped.forEach(({ el }) => container.appendChild(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reorder);
  } else {
    reorder();
  }
})();

