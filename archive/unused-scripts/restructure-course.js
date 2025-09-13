// Standardize course banner and move description into an Overview section
(function(){
  function getCourseTitle() {
    const h1 = document.querySelector('main h1, h1');
    if (h1 && h1.textContent.trim()) return h1.textContent.trim();
    const t = document.title || '';
    return t.split('|')[0].trim() || 'Course';
  }

  function ensureHero() {
    if (document.getElementById('course-hero')) return;
    const title = getCourseTitle();
    const hero = document.createElement('section');
    hero.id = 'course-hero';
    hero.className = 'py-4 text-center bg-100';
    hero.style.marginTop = '72px';
    hero.style.paddingBottom = '8px';
    hero.innerHTML = '<div class="container"><h1 class="fs-sm-5 mb-2"></h1><p class="text-700 mb-0"></p></div>';
    hero.querySelector('h1').textContent = title;
    const ref = document.querySelector('nav.navbar.navbar-theme.fixed-top') || document.querySelector('nav.navbar');
    // insert after navbar
    if (ref && ref.parentNode) {
      ref.parentNode.insertBefore(hero, ref.nextSibling);
    } else {
      document.body.insertBefore(hero, document.body.firstChild);
    }
  }

  function moveOverview() {
    const descs = Array.from(document.querySelectorAll('.course-description'));
    if (!descs.length) return;
    const overview = document.createElement('section');
    overview.id = 'overview';
    overview.className = 'container';
    overview.style.padding = '1rem 1rem 1.5rem 1rem';
    overview.innerHTML = '<div class="section-header"><h2>Overview</h2></div>';
    const list = document.createElement('div');
    overview.appendChild(list);
    descs.forEach(p => list.appendChild(p));
    const acc = document.querySelector('.accordion');
    const main = document.querySelector('main') || document.body;
    if (acc && acc.parentElement) {
      const section = acc.closest('section');
      if (section) {
        // Minimize top padding on the section that contains the accordion
        section.style.paddingTop = '0';
        section.style.marginTop = '0';
        section.insertBefore(overview, section.firstElementChild);
      } else {
        acc.parentElement.parentElement.insertBefore(overview, acc.parentElement);
      }
    } else {
      main.insertBefore(overview, main.firstChild);
    }
  }

  function run(){
    ensureHero();
    moveOverview();
    stripNumberingFromListItems();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

// Remove leading numeric prefixes (e.g., "1. ", "2. ") so lists render as plain bullets
function stripNumberingFromListItems() {
  try {
    // Scope to course pages only by looking for accordion or main content
    const scope = document.querySelector('main') || document.body;
    const items = scope.querySelectorAll('li');
    if (!items || !items.length) return;

    const re = /(\s|^)\d+\.\s*/g; // matches "1.", "1. ", " 2. ", at start or after whitespace

    items.forEach(li => {
      const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, null, false);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(textNode => {
        const before = textNode.nodeValue;
        const after = before.replace(re, (m, p1) => p1);
        if (after !== before) textNode.nodeValue = after;
      });
    });
  } catch (e) {
    // Non-fatal; leave as-is if anything throws
  }
}
