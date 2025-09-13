// Reorder course units on individual course pages and normalize titles
(function(){
  function normalizeUnitTitle(title) {
    if (!title) return '';
    const m = title.match(/unit\s*(\d+)\s*:\s*(.*)/i);
    if (m) {
      const num = m[1];
      const rest = m[2].trim();
      return `Unit ${num}: ${rest}`;
    }
    return title.replace(/\s+/g, ' ').trim();
  }

  function reorderUnits() {
    const acc = document.querySelector('.accordion');
    if (!acc) return;
    const items = Array.from(acc.querySelectorAll('.accordion-item'));
    if (!items.length) return;

    const parsed = items.map((item, idx) => {
      const titleEl = item.querySelector('.accordion-title');
      const raw = titleEl ? titleEl.textContent || '' : '';
      const norm = normalizeUnitTitle(raw);
      if (titleEl && norm !== raw) titleEl.textContent = norm;
      const m = norm.match(/Unit\s*(\d+)/i);
      const num = m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY;
      return { item, num, norm, idx };
    });

    const originalOrder = parsed.map(p => p.num).join(',');
    parsed.sort((a,b) => (a.num - b.num) || (a.idx - b.idx));
    const sortedOrder = parsed.map(p => p.num).join(',');
    if (originalOrder !== sortedOrder) {
      console.info('Reordered units:', originalOrder, '=>', sortedOrder);
    }

    // Append in sorted order
    const frag = document.createDocumentFragment();
    parsed.forEach(p => frag.appendChild(p.item));
    acc.innerHTML = '';
    acc.appendChild(frag);

    // Basic anomaly checks
    const nums = parsed.filter(p => isFinite(p.num)).map(p => p.num);
    if (nums.length) {
      const set = new Set(nums);
      if (set.size !== nums.length) {
        console.warn('Duplicate unit numbers detected:', nums);
      }
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const expectedCount = max - min + 1;
      if (expectedCount !== nums.length) {
        console.warn('Missing or non-sequential unit numbers. Found:', nums, 'Expected range:', min, 'to', max);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', reorderUnits);
  } else {
    reorderUnits();
  }
})();

