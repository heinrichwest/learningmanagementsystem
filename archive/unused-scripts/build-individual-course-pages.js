// Build individual course pages from formatted text using the HTML template
// Input: Course layout/TAP Courses - formatted.txt
// Template: courses/course_template.html
// Output: courses/individual/<slug>.html

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT_TXT = path.join(ROOT, 'Course layout', 'TAP Courses - formatted.txt');
const TEMPLATE_HTML = path.join(ROOT, 'courses', 'course_template.html');
const OUTPUT_DIR = path.join(ROOT, 'courses', 'individual');

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function minutesToHuman(mins) {
  const m = parseInt(mins, 10);
  if (!Number.isFinite(m) || m <= 0) return 'N/A';
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (h && mm) return `${h}h ${mm}m`;
  if (h) return `${h}h`;
  return `${mm}m`;
}

function parseCoursesFromText(raw) {
  const lines = raw.split(/\r?\n/);
  const courses = [];
  let cur = null;
  let inUnits = false;

  function pushCurrent() {
    if (cur && cur.name) {
      // Finalize any pending unit
      if (cur.units && cur.units.length > 0) {
        const last = cur.units[cur.units.length - 1];
        if (last && !last.topics) last.topics = [];
      }
      courses.push(cur);
    }
    cur = null;
    inUnits = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine == null ? '' : String(rawLine).trim();
    if (!line) continue;

    // Detect start of a new course block
    if (/^Course\s+\d+\s+of\s+\d+/i.test(line)) {
      pushCurrent();
      cur = { name: '', description: '', overview: '', durationMinutes: null, units: [] };
      continue;
    }

    if (!cur) continue; // skip any header noise until a course starts

    // Key fields
    let m;
    m = line.match(/^Course\s*Name:\s*(.+)$/i);
    if (m) { cur.name = m[1].trim(); continue; }

    m = line.match(/^Course\s*Description:\s*(.+)$/i);
    if (m) { cur.description = m[1].trim(); continue; }

    m = line.match(/^Course\s*Overview:\s*(.+)$/i);
    if (m) { cur.overview = m[1].trim(); continue; }

    m = line.match(/^Duration\s*\(minutes\)\s*:\s*(\d+)/i);
    if (m) { cur.durationMinutes = parseInt(m[1], 10); continue; }

    if (/^Units:$/i.test(line)) { inUnits = true; continue; }

    if (inUnits) {
      // Unit title
      let um = line.match(/^-\s*Unit\s*\d+\s*:\s*(.+)$/i);
      if (um) {
        const title = um[1].trim();
        cur.units.push({ title, topics: [] });
        continue;
      }
      // Unit topic lines like "- Topic ..." with extra indentation retained as in source
      um = rawLine.match(/^\s{2,}-\s*(.+)$/);
      if (um && cur.units.length > 0) {
        const topicLine = um[1].trim();
        // Split topic lines that are obviously comma-separated enumerations into bullets
        const splitCandidates = topicLine.split(/\s*,\s+/).map(s => s.trim()).filter(Boolean);
        if (splitCandidates.length > 1 && splitCandidates.join(', ').length <= topicLine.length + 5) {
          cur.units[cur.units.length - 1].topics.push(...splitCandidates);
        } else {
          cur.units[cur.units.length - 1].topics.push(topicLine);
        }
        continue;
      }
      // If we hit a new course marker unexpectedly (without blank line), next loop will push
    }
  }
  pushCurrent();
  return courses;
}

function adjustPathsForSubdir(html) {
  // All asset and page links in the template are relative to courses/; we need one more ../ for courses/individual/
  return html
    .replace(/href=\"\.\//g, 'href="../')
    .replace(/href=\"\.\.\//g, 'href="../../')
    .replace(/src=\"\.\.\//g, 'src="../../')
    .replace(/content=\"\.\.\//g, 'content="../../');
}

function buildAccordion(units) {
  if (!Array.isArray(units) || units.length === 0) return '';
  return [
    '<div class="accordion" id="course-outline">',
    ...units.map((u, idx) => {
      const title = u.title && u.title.trim() ? u.title.trim() : `Unit ${idx + 1}`;
      const items = Array.isArray(u.topics) && u.topics.length
        ? u.topics
        : [];
      const lis = items.map(t => `                <li>${escapeHtml(t)}</li>`).join('\n');
      return [
        '            <div class="accordion-item">',
        '              <div class="accordion-header" onclick="toggleItem(this)">',
        `                <h3 class="accordion-title">${escapeHtml(title)}</h3>`,
        '                <span class="accordion-toggle">+</span>',
        '              </div>',
        '              <div class="accordion-content">',
        '                <ul>',
        lis || '                  <li>See course content for details</li>',
        '                </ul>',
        '              </div>',
        '            </div>'
      ].join('\n');
    }),
    '          </div>'
  ].join('\n');
}

function populateTemplate(tpl, course) {
  const durationHuman = minutesToHuman(course.durationMinutes);
  const safeName = escapeHtml(course.name || 'Course');
  const teaser = escapeHtml(course.description || course.overview || '');
  const infoText = escapeHtml(course.overview || course.description || '');

  // Start with template and adjust asset/link paths for subdirectory placement
  let html = adjustPathsForSubdir(tpl);

  // Simple textual replacements
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeName} | TAP</title>`);
  html = html.replace('Course Title Goes Here', safeName);
  html = html.replace('Short teaser or course intro copy can go here.', teaser);
  html = html.replace('Replace placeholder text below with your actual course details.', infoText);
  html = html.replace('Level: Placeholder', 'Level: All Levels');
  html = html.replace('Duration: 00h', `Duration: ${durationHuman}`);

  // Course meta line under the title
  html = html.replace(/<p class=\"course-meta mt-2 mb-0\">[\s\S]*?<\/p>/, `<p class="course-meta mt-2 mb-0">All Levels • ~${durationHuman}</p>`);

  // Replace accordion block content
  const accordionStart = html.indexOf('<div class="accordion" id="course-outline">');
  if (accordionStart !== -1) {
    // Replace everything from accordion start up to the end of this section
    const sectionEndIdx = html.indexOf('</section>', accordionStart);
    if (sectionEndIdx !== -1) {
      const head = html.substring(0, accordionStart);
      const tail = html.substring(sectionEndIdx); // include </section> and beyond
      html = head + buildAccordion(course.units || []) + tail;
    }
  }

  return html;
}

function main() {
  if (!fs.existsSync(INPUT_TXT)) {
    console.error(`Input not found: ${INPUT_TXT}`);
    process.exit(1);
  }
  if (!fs.existsSync(TEMPLATE_HTML)) {
    console.error(`Template not found: ${TEMPLATE_HTML}`);
    process.exit(1);
  }
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const raw = fs.readFileSync(INPUT_TXT, 'utf8');
  const tpl = fs.readFileSync(TEMPLATE_HTML, 'utf8');
  const courses = parseCoursesFromText(raw);
  let count = 0;

  courses.forEach((course) => {
    if (!course.name) return;
    const slug = slugify(course.name);
    if (!slug) return;
    const outPath = path.join(OUTPUT_DIR, `${slug}.html`);
    const html = populateTemplate(tpl, course);
    fs.writeFileSync(outPath, html, 'utf8');
    count++;
    console.log(`Wrote ${outPath}`);
  });

  console.log(`Generated ${count} course page(s).`);
}

if (require.main === module) {
  main();
}

module.exports = { parseCoursesFromText, populateTemplate, slugify, minutesToHuman };
