// Generate category pages with course tiles from grouped text file
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const INPUT_TXT = path.join(ROOT, 'Course layout', 'TAP Courses - grouped by category.txt');
const OUTPUT_DIR = path.join(ROOT, 'courses');
const IMAGES_DIR = path.join(ROOT, 'Images', 'Course_Images', 'TAP_Courses_PNG_FIles');
const ODS_CSV = path.join(ROOT, 'Images', 'Course_Images', 'Course_Image_Names.csv');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

function parseGroupedFile(text) {
  const lines = text.split(/\r?\n/);
  const categories = [];
  let current = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = line.match(/^Category:\s*(.+)$/i);
    if (m) {
      current = { name: m[1].trim(), courses: [] };
      categories.push(current);
    } else if (current && line.trim().startsWith('-')) {
      current.courses.push(line.replace(/^\s*-\s*/, '').trim());
    }
  }
  return categories;
}

function loadImageMap() {
  const map = new Map();
  if (!fs.existsSync(ODS_CSV)) return map;
  const raw = fs.readFileSync(ODS_CSV, 'utf8');
  const lines = raw.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return map;
  // Expect header like: CourseName,CourseImage
  let startIdx = 0;
  const headerCols = parseCSVLine(lines[0]).map(s => s.trim().toLowerCase());
  if (headerCols[0] === 'coursename' && headerCols[1] && headerCols[1].startsWith('courseimage')) {
    startIdx = 1;
  }
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;
    const name = cols[0].trim();
    const token = cols[1].trim();
    if (!name || !token) continue;
    map.set(normalizeName(name), token);
  }
  return map;
}

function parseCSVLine(line) {
  // Minimal CSV parser supporting quoted fields with commas
  const res = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = false; }
      } else cur += ch;
    } else {
      if (ch === ',') { res.push(cur); cur = ''; }
      else if (ch === '"') { inQuotes = true; }
      else cur += ch;
    }
  }
  res.push(cur);
  return res;
}

function normalizeName(s) {
  return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

function findImageForCourse(name, imageMap) {
  const files = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [];
  // Try CSV token first
  const token = imageMap.get(normalizeName(name));
  if (token) {
    const lower = token.toLowerCase();
    const byToken = files.find(f => path.parse(f).name.toLowerCase() === lower);
    if (byToken) {
      return path.join('..', 'Images', 'Course_Images', 'TAP_Courses_PNG_FIles', byToken).replace(/\\/g,'/');
    }
  }
  // Fallback: match by normalized course name to file basename
  const target = normalizeName(name);
  const byName = files.find(f => normalizeName(path.parse(f).name) === target);
  if (byName) {
    return path.join('..', 'Images', 'Course_Images', 'TAP_Courses_PNG_FIles', byName).replace(/\\/g,'/');
  }
  return null;
}

function buildPage(category, courses) {
  const imageMap = loadImageMap();
  const title = category;
  const tiles = courses
    .map((name) => {
      const courseSlug = slugify(name);
      // Try mapped image; fallback to logo
      const mapped = findImageForCourse(name, imageMap);
      const imgSrc = mapped || '../Images/Logo.png';
      return `
            <a href="./individual/${courseSlug}.html" class="feature-card-link">
              <div class="feature-card">
                <div class="feature-image" style="height:140px;display:flex;align-items:center;justify-content:center;background:#f8f9fa;border-radius:8px;margin-bottom:12px;">
                  <img src="${imgSrc}" alt="${name}" style="max-height:100%;max-width:100%;object-fit:contain;opacity:.9;" />
                </div>
                <h3>${name}</h3>
              </div>
            </a>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en-US" dir="ltr">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | TAP Courses</title>
    <link href="../Theme/public/vendors/swiper/swiper-bundle.min.css" rel="stylesheet" />
    <link href="../Theme/public/assets/css/theme.css" rel="stylesheet" />
    <link href="../white-navbar.css" rel="stylesheet" />
  </head>
  <body>
    <nav class="navbar navbar-expand-lg navbar-light navbar-theme fixed-top" data-navbar-on-scroll="data-navbar-on-scroll">
      <div class="container"><a class="navbar-brand fw-normal ls-2" href="../index.html"><img src="../Images/Logo.png" alt="TAP Logo" width="40" height="40"></a>
        <button class="navbar-toggler p-0" type="button" data-bs-toggle="collapse" data-bs-target="#primaryNavbarCollapse" aria-controls="primaryNavbarCollapse" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="primaryNavbarCollapse">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink1" href="#" data-bs-toggle="dropdown-on-hover" aria-haspopup="true" aria-expanded="false"><span class="nav-link-text">Features</span></a>
              <div class="dropdown-menu dropdown-menu-end py-0 overflow-hidden" aria-labelledby="navbarDropdownMenuLink1">
                <a class="dropdown-item" href="../features/300-courses.html">300 Courses</a>
                <a class="dropdown-item" href="../features/dashboard-reporting.html">Dashboard reporting</a>
                <a class="dropdown-item" href="../features/course-management-and-creations.html">Course management and creations</a>
                <a class="dropdown-item" href="../features/employment-equity-system.html">Employment Equity System</a>
                <a class="dropdown-item" href="../features/work-based-assessments.html">Work Based Assessments</a>
                <a class="dropdown-item" href="../features/while-labelling.html">While Labelling</a>
                <a class="dropdown-item" href="../features/team-management.html">Team Management</a>
              </div>
            </li>
            <li class="nav-item dropdown"><a class="nav-link dropdown-toggle" id="navbarDropdownMenuLink2" href="#" data-bs-toggle="dropdown-on-hover" aria-haspopup="true" aria-expanded="false"><span class="nav-link-text">Courses</span></a>
              <div class="dropdown-menu dropdown-menu-end dropdown-pages py-3" aria-labelledby="navbarDropdownMenuLink2">
                <div class="row">
                  <div class="col-6 col-md-4 px-2">
                    <ul class="nav flex-column">
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./administration-and-office-skills.html">Administration and Office Skills</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./assessments-and-skills-testing.html">Assessments and Skills Testing</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./business-analysis-and-data-skills.html">Business Analysis and Data Skills</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./communication-and-interpersonal-skills.html">Communication and Interpersonal Skills</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./compliance-law-and-governance.html">Compliance, Law and Governance</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./health-and-safety-compliance.html">Health and Safety Compliance</a></li>
                    </ul>
                  </div>
                  <div class="col-6 col-md-4 px-2">
                    <ul class="nav flex-column">
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./personal-development.html">Personal Development</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./computer-and-digital-skills.html">Computer and Digital Skills</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./customer-service-and-contact-centre.html">Customer Service and Contact Centre</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./finance-and-accounting.html">Finance and Accounting</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./entrepreneurship-and-new-ventures.html">Entrepreneurship and New Ventures</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./human-resources-and-people-management.html">Human Resources and People Management</a></li>
                    </ul>
                  </div>
                  <div class="col-6 col-md-4 px-2">
                    <ul class="nav flex-column">
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./information-technology.html">Information Technology</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./leadership-and-management.html">Leadership and Management</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./project-management.html">Project Management</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./retail-sales-and-marketing.html">Retail, Sales and Marketing</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./automotive-industry.html">Automotive Industry</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./security-and-risk-management.html">Security and Risk Management</a></li>
                      <li class="nav-item"><a class="nav-link fw-medium px-0 py-2" href="./supply-chain-and-logistics.html">Supply Chain and Logistics</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
            <li class="nav-item"><a class="nav-link" href="../pages/about.html"><span class="nav-link-text">About us</span></a></li>
            <li class="nav-item"><a class="nav-link" href="../index.html#pricing"><span class="nav-link-text">Pricing</span></a></li>
            <li class="nav-item"><a class="nav-link" href="../index.html#testimonial"><span class="nav-link-text">Success Stories</span></a></li>
            <li class="nav-item"><a class="nav-link" href="../index.html#contact"><span class="nav-link-text">Contact us</span></a></li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="main" id="top">
      <!-- Hero banner like course template -->
      <section class="py-8 py-md-10 text-center">
        <div class="bg-holder" style="background-image:url(../Theme/public/assets/img/headers/header-12.jpg);background-position: 63% 50%;"></div>
        <div class="container">
          <div class="row justify-content-center" data-zanim-timeline="{}" data-zanim-trigger="scroll">
            <div class="col-lg-8">
              <h1 class="text-white mb-0 fs-3 lh-1"><span class="d-block">${title}</span></h1>
              <p class="text-white-50 mt-2 mb-0">Browse available courses in this category</p>
            </div>
          </div>
        </div>
      </section>
      <section class="py-7 text-center" style="margin-top:0;">
        <div class="container">
          <div class="features-grid">
${tiles}
          </div>
        </div>
      </section>
    </main>
    <script src="../Theme/public/vendors/overlayscrollbars/OverlayScrollbars.min.js"></script>
    <script src="../Theme/public/vendors/popper/popper.min.js"></script>
    <script src="../Theme/public/vendors/bootstrap/bootstrap.min.js"></script>
    <script src="../Theme/public/vendors/anchorjs/anchor.min.js"></script>
    <script src="../Theme/public/vendors/is/is.min.js"></script>
    <script src="../Theme/public/vendors/bigpicture/BigPicture.js"></script>
    <script src="../Theme/public/vendors/countup/countUp.umd.js"></script>
    <script src="../Theme/public/vendors/progressbar/progressbar.min.js"></script>
    <script src="../Theme/public/vendors/hover-dir/hoverDir.min.js"></script>
    <script src="../Theme/public/vendors/isotope-layout/isotope.pkgd.min.js"></script>
    <script src="../Theme/public/vendors/isotope-packery/packery-mode.pkgd.min.js"></script>
    <script src="../Theme/public/vendors/swiper/swiper-bundle.min.js"></script>
    <script src="../Theme/public/vendors/fontawesome/all.min.js"></script>
    <script src="../Theme/public/vendors/lodash/lodash.min.js"></script>
    <script src="../Theme/public/vendors/imagesloaded/imagesloaded.pkgd.min.js"></script>
    <script src="../Theme/public/vendors/gsap/gsap.js"></script>
    <script src="../Theme/public/vendors/gsap/customEase.js"></script>
    <script src="../Theme/public/assets/js/theme.js"></script>
  </body>
</html>`;
}

function main() {
  const raw = fs.readFileSync(INPUT_TXT, 'utf8');
  const cats = parseGroupedFile(raw);
  cats.forEach(({ name, courses }) => {
    const slug = slugify(name);
    const outPath = path.join(OUTPUT_DIR, `${slug}.html`);
    const html = buildPage(name, courses);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`Wrote ${outPath}`);
  });
}

main();
