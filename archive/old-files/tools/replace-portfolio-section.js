// Rebuild the Course Categories grid on the home page with Images/Categories assets
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

const categories = [
  { title: 'Administration and Office Skills', slug: 'administration-and-office-skills', count: 20 },
  { title: 'Assessments and Skills Testing', slug: 'assessments-and-skills-testing', count: 15 },
  { title: 'Business Analysis and Data Skills', slug: 'business-analysis-and-data-skills', count: 14 },
  { title: 'Communication and Interpersonal Skills', slug: 'communication-and-interpersonal-skills', count: 21 },
  { title: 'Compliance, Law and Governance', slug: 'compliance-law-and-governance', count: 13 },
  { title: 'Health and Safety Compliance', slug: 'health-and-safety-compliance', count: 5 },
  { title: 'Personal Development', slug: 'personal-development', count: 13 },
  { title: 'Computer and Digital Skills', slug: 'computer-and-digital-skills', count: 13 },
  { title: 'Customer Service and Contact Centre', slug: 'customer-service-and-contact-centre', count: 27 },
  { title: 'Finance and Accounting', slug: 'finance-and-accounting', count: 5 },
  { title: 'Entrepreneurship and New Ventures', slug: 'entrepreneurship-and-new-ventures', count: 17 },
  { title: 'Human Resources and People Management', slug: 'human-resources-and-people-management', count: 18 },
  { title: 'Information Technology', slug: 'information-technology', count: 29 },
  { title: 'Leadership and Management', slug: 'leadership-and-management', count: 24 },
  { title: 'Project Management', slug: 'project-management', count: 13 },
  { title: 'Retail, Sales and Marketing', slug: 'retail-sales-and-marketing', count: 13 },
  { title: 'Automotive Industry', slug: 'automotive-industry', count: 12 },
  { title: 'Security and Risk Management', slug: 'security-and-risk-management', count: 8 },
  { title: 'Supply Chain and Logistics', slug: 'supply-chain-and-logistics', count: 21 }
];

function buildGrid() {
  let delay = 0;
  const tiles = categories.map(({ title, slug, count }, idx) => {
    const d = (Math.round(delay * 10) / 10).toFixed(1).replace(/\.0$/, '');
    delay += 0.1; if (delay > 0.5) delay = 0;
    const file = title.replace(/[^A-Za-z0-9]+/g, '_');
    return `            <div class="col-sm-6 col-lg-4 col-five px-2 isotope-item design" data-zanim-xs='{"delay":${d || 0}}'>
              <div class="hoverdir-item my-0" data-zanim-xs='{"duration":1.5,"animation":"zoom-in","delay":0}'>
                <div class="hoverdir-item-content"><a class="d-block" href="./courses/${slug}.html"><img class="img-fluid rounded" src="./Images/Categories/${file}.jpg" alt="${title}" />
                  <div class="hoverdir-text">
                    <h3 class="text-white lh-1 fs-2">${title}</h3>
                    <p class="ls-1 mb-0 text-700">${count} Courses</p>
                  </div>
                </a></div>
              </div>
            </div>`;
  }).join('\n');
  return `          <div class="row g-3 mt-3" data-rp-isotope='{"layoutMode":"packery"}'>
${tiles}
          </div>`;
}

function replaceSection(html) {
  const startMarker = '<div class="row g-3 mt-3" data-rp-isotope=\'{"layoutMode":"packery"}\'>';
  const startIdx = html.indexOf(startMarker);
  if (startIdx < 0) return html;
  // Find matching closing </div> for the row by counting divs
  let i = startIdx;
  let depth = 0;
  while (i < html.length) {
    if (html.startsWith('<div', i)) { depth++; i += 4; continue; }
    if (html.startsWith('</div>', i)) { depth--; i += 6; if (depth === 0) break; continue; }
    i++;
  }
  const endIdx = i; // position just after closing </div>
  const before = html.slice(0, startIdx);
  const after = html.slice(endIdx);
  const replacement = buildGrid();
  return before + replacement + after;
}

const orig = fs.readFileSync(INDEX, 'utf8');
const updated = replaceSection(orig);
if (updated !== orig) {
  fs.writeFileSync(INDEX, updated, 'utf8');
  console.log('Home portfolio section updated with category images.');
} else {
  console.log('No changes applied.');
}
