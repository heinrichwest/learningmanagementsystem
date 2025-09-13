// TAP LMS Website JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initSmoothScrolling();
    initAnimations();
    initFormHandling();
    initMobileMenu();
    initCourseNavigation();

    // If static category tiles exist, apply CSV-based images
    ensureCourseImageMapLoaded().then(() => {
        applyImagesToStaticCategoryTiles();
    }).catch(() => {
        // non-fatal
    });
});

// If this script is loaded after DOMContentLoaded has already fired,
// run the image mapping immediately as well.
if (document.readyState !== 'loading') {
    ensureCourseImageMapLoaded().then(() => {
        applyImagesToStaticCategoryTiles();
    }).catch(() => {
        // non-fatal
    });
}

// Image mapping (course title -> image path)
let courseImageMap = null;
let courseImageMapPromise = null;

function normalizeTitle(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[’'`]/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function parseCSV(text) {
    const rows = [];
    let i = 0, field = '', row = [], inQuotes = false;
    while (i < text.length) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"') {
                if (text[i + 1] === '"') { // escaped quote
                    field += '"';
                    i += 2;
                    continue;
                } else {
                    inQuotes = false;
                    i++;
                    continue;
                }
            } else {
                field += c;
                i++;
                continue;
            }
        } else {
            if (c === '"') {
                inQuotes = true;
                i++;
                continue;
            }
            if (c === ',') {
                row.push(field);
                field = '';
                i++;
                continue;
            }
            if (c === '\n') {
                row.push(field);
                rows.push(row);
                row = [];
                field = '';
                i++;
                continue;
            }
            if (c === '\r') { // handle CRLF
                i++;
                continue;
            }
            field += c;
            i++;
        }
    }
    // push last field/row
    row.push(field);
    if (row.length && (row.length > 1 || row[0] !== '')) {
        rows.push(row);
    }
    if (!rows.length) return [];
    const headers = rows[0];
    return rows.slice(1).map(r => {
        const obj = {};
        headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
        return obj;
    });
}

function ensureCourseImageMapLoaded() {
    if (courseImageMap) return Promise.resolve(courseImageMap);
    if (courseImageMapPromise) return courseImageMapPromise;

    function toRelFromAbsolute(abs) {
        if (!abs) return '';
        const cleaned = String(abs).replace(/\\/g, '/');
        const idx = cleaned.toLowerCase().indexOf('/images/');
        return idx >= 0 ? cleaned.slice(idx) : '';
    }

    function buildMapFromCourseImageNames(rows) {
        const map = {};
        rows.forEach(r => {
            const rawTitle = r.CourseName || '';
            const key = normalizeTitle(rawTitle);
            if (!key) return;
            let rel = toRelFromAbsolute(r.Link || '');
            if (!rel) {
                const uuidWebp = (r.CourseImage || '').trim();
                if (uuidWebp) {
                    const base = uuidWebp.replace(/\.webp$/i, '.png').replace(/^.*[\\/]/, '');
                    rel = `/assets/images/courses/CourseImages/${base}`;
                }
            }
            if (rel) map[key] = rel;
        });
        return map;
    }

    function buildMapFromLegacy(rows) {
        const map = {};
        rows.forEach(r => {
            const rawTitle = r.MatchedCourseName || r.SourceCourseName || '';
            const key = normalizeTitle(rawTitle);
            if (!key) return;
            const imageFile = (r.ImageFile || '').trim();
            let rel = '';
            if (imageFile) {
                const base = imageFile.replace(/\.webp$/i, '.png').replace(/^.*[\\/]/, '');
                rel = `/assets/images/courses/CourseImages/${base}`;
            } else if (r.ImageLink) {
                rel = toRelFromAbsolute(r.ImageLink);
            }
            if (rel) map[key] = rel;
        });
        return map;
    }

    function loadCsv(url, builder) {
        return fetch(url, { cache: 'no-cache' })
            .then(res => { if (!res.ok) throw new Error('load fail ' + url); return res.text(); })
            .then(text => parseCSV(text))
            .then(rows => builder(rows))
            .catch(err => { console.warn('CSV load warning:', url, err.message); return {}; });
    }

    courseImageMapPromise = Promise.all([
        loadCsv('/assets/images/courses/Course_Image_Names.csv', buildMapFromCourseImageNames),
        loadCsv('/archive/old-files/Documents/course_image_mapping.csv', buildMapFromLegacy)
    ]).then(([mapA, mapB]) => {
        courseImageMap = { ...mapA, ...mapB };
        return courseImageMap;
    }).catch(err => {
        console.error('Image mapping load error:', err);
        courseImageMap = {};
        return courseImageMap;
    });

    return courseImageMapPromise;
}

function getCourseImageSrc(title) {
    const key = normalizeTitle(title);
    const src = (courseImageMap && courseImageMap[key]) || '/assets/images/logo/Logo.png';
    return src;
}

// Replace images on static category tiles (Theme pages with feature-card markup)
function applyImagesToStaticCategoryTiles() {
    const cards = document.querySelectorAll('.feature-card');
    if (!cards || !cards.length) return;
    cards.forEach(card => {
        const titleEl = card.querySelector('h3');
        const imgEl = card.querySelector('.feature-image img');
        if (!titleEl || !imgEl) return;
        const title = titleEl.textContent?.trim() || '';
        // Only override if it's the generic logo or empty
        const currentSrc = imgEl.getAttribute('src') || '';
        const looksLikeLogo = /(^|\/)logo\.png$/i.test(currentSrc);
        if (looksLikeLogo || !currentSrc) {
            const src = getCourseImageSrc(title);
            imgEl.src = src;
        }
        imgEl.alt = title;
        imgEl.style.opacity = '1';
        imgEl.style.objectFit = 'cover';
    });
}
// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.header');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Header scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });
    
    // Active navigation link
    function updateActiveNavLink() {
        const currentSection = getCurrentSection();
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Get current section based on scroll position
    function getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let currentSection = 'home';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });
        
        return currentSection;
    }
    
    // Update active link on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    updateActiveNavLink();
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed header
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// Animation on scroll
function initAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .solution-card, .pricing-card, .academy-feature');
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // Counter animation for hero stats
    animateCounters();
}

// Counter animation for statistics
function animateCounters() {
    const counters = document.querySelectorAll('.stat h3');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const numericValue = parseInt(finalValue.replace(/[^0-9]/g, ''));
                
                if (!isNaN(numericValue)) {
                    animateCounter(target, numericValue, finalValue);
                }
                
                observer.unobserve(target);
            }
        });
    });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target, originalText) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = originalText;
            clearInterval(timer);
        } else {
            const suffix = originalText.includes('+') ? '+' : originalText.includes('%') ? '%' : '';
            element.textContent = Math.floor(current).toLocaleString() + suffix;
        }
    }, 20);
}

// Form handling
function initFormHandling() {
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateForm(data)) {
                // Simulate form submission
                submitForm(data);
            }
        });
    }
}

function validateForm(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!data.company || data.company.trim().length < 2) {
        errors.push('Company name must be at least 2 characters long');
    }
    
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }
    
    if (errors.length > 0) {
        showFormErrors(errors);
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormErrors(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.form-error');
    existingErrors.forEach(error => error.remove());
    
    // Create error container
    const errorContainer = document.createElement('div');
    errorContainer.className = 'form-error';
    errorContainer.style.cssText = `
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #dc2626;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    `;
    
    const errorList = document.createElement('ul');
    errorList.style.cssText = 'margin: 0; padding-left: 1.5rem;';
    
    errors.forEach(error => {
        const errorItem = document.createElement('li');
        errorItem.textContent = error;
        errorList.appendChild(errorItem);
    });
    
    errorContainer.appendChild(errorList);
    
    // Insert error container at the top of the form
    const form = document.querySelector('.contact-form');
    form.insertBefore(errorContainer, form.firstChild);
    
    // Scroll to error
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function submitForm(data) {
    // Show loading state
    const submitButton = document.querySelector('.contact-form button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        showFormSuccess();
        
        // Reset form
        document.querySelector('.contact-form').reset();
        
        // Reset button
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Log form data (in real application, this would be sent to server)
        console.log('Form submitted with data:', data);
    }, 2000);
}

function showFormSuccess() {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.form-error, .form-success');
    existingMessages.forEach(message => message.remove());
    
    // Create success message
    const successContainer = document.createElement('div');
    successContainer.className = 'form-success';
    successContainer.style.cssText = `
        background: #dcfce7;
        border: 1px solid #bbf7d0;
        color: #15803d;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        text-align: center;
    `;
    
    successContainer.innerHTML = `
        <strong>Thank you for your message!</strong><br>
        We'll get back to you within 24 hours.
    `;
    
    // Insert success message at the top of the form
    const form = document.querySelector('.contact-form');
    form.insertBefore(successContainer, form.firstChild);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        if (successContainer.parentNode) {
            successContainer.remove();
        }
    }, 5000);
}

// Mobile menu functionality
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                closeMobileMenu();
            }
        });
        
        // Close menu on window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        });
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    const hamburger = navToggle.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    
    // Animate hamburger
    if (navMenu.classList.contains('active')) {
        hamburger.style.transform = 'rotate(45deg)';
        // Add mobile menu styles
        navMenu.style.cssText = `
            display: flex;
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-top: 1px solid #e5e7eb;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        `;
        
        navMenu.querySelector('.nav-list').style.cssText = `
            flex-direction: column;
            padding: 2rem 1rem;
            width: 100%;
        `;
    } else {
        hamburger.style.transform = 'rotate(0deg)';
        navMenu.style.display = 'none';
    }
}

function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');
    const hamburger = navToggle.querySelector('.hamburger');
    
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    hamburger.style.transform = 'rotate(0deg)';
    
    // Reset styles for desktop
    if (window.innerWidth > 768) {
        navMenu.style.cssText = '';
        navMenu.querySelector('.nav-list').style.cssText = '';
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance optimizations
const debouncedScroll = debounce(() => {
    // Scroll-based animations
}, 100);

const throttledScroll = throttle(() => {
    // Navigation updates
}, 100);

window.addEventListener('scroll', debouncedScroll);
window.addEventListener('scroll', throttledScroll);

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .nav-link.active {
        color: var(--primary-color);
    }
    
    .nav-link.active::after {
        transform: scaleX(1);
    }
`;
document.head.appendChild(style);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Course Data Structure
const courseData = {
    computer: {
        title: "Computer Courses",
        description: "Master essential computer skills with our comprehensive Microsoft Office suite and technology courses.",
        courses: [
            {
                title: "Introduction to Computers",
                description: "This course explains what a computer is and what it does, looking at the different elements of a computer, including the hardware and software components. You will learn the basic functions of a computer, how to hold and operate a mouse and a keyboard, how to open and close programs and documents, and many more exciting features.",
                level: "Basic",
                duration: "12 hours",
                units: [
                    {
                        title: "Unit 1: Introduction to computers",
                        topics: ["What is a computer?", "What are hardware and software?", "Different types of computers", "What is a storage device?"]
                    },
                    {
                        title: "Unit 2: Input devices",
                        topics: ["What is an input device?", "How to hold a mouse", "How to use a mouse", "Exploring the keyboard"]
                    },
                    {
                        title: "Unit 3: Output devices",
                        topics: ["What is an output device?", "Printing"]
                    },
                    {
                        title: "Unit 4: Software",
                        topics: ["What is an operating system?", "Exploring the desktop", "Managing files with File Explorer", "Exploring the taskbar", "Personalising your desktop", "What is application software?", "Opening and saving applications"]
                    },
                    {
                        title: "Unit 5: Internet and Networks",
                        topics: ["Introduction", "The internet and different networks", "Network components and signing in", "Types of telephone network connections", "The World Wide Web", "Internet and web applications", "Modems, browsers and ISPs", "Bandwidth", "Types of internet access", "Surfing strategies", "Benefits and limits of the internet"]
                    },
                    {
                        title: "Unit 6: Setting up a computer workstation according to ergonomic and health and safety principles",
                        topics: ["Computer ergonomics", "Computer health and safety", "Setting up a computer workstation", "Environmentally responsible practices"]
                    }
                ]
            },
            {
                title: "Basic Microsoft Word",
                description: "This course introduces the basic functionality of Microsoft Word and its ability to produce professional documents. You will acquire important techniques to create, edit and format your document content with ease.",
                level: "Basic",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Getting started",
                        topics: ["Identifying the components of the Word interface", "Customising the quick access bar", "Creating a new Word document", "Opening and displaying a document in different views", "Saving a Word document", "Print preview and printing a document", "Accessing help in Word"]
                    },
                    {
                        title: "Unit 2: Editing a document",
                        topics: ["Selecting text in Word", "Cut, copy and paste", "Undo and redo commands", "Finding and replacing text"]
                    },
                    {
                        title: "Unit 3: Formatting text and paragraphs",
                        topics: ["Applying different font options to text", "Setting borders in a document", "Highlighting text", "Adding shading to a document", "Using format painter to format text", "Creating bulleted and numbered lists", "Applying styles", "Adjusting spacing options in a document", "Adjusting the paragraph alignment of text"]
                    },
                    {
                        title: "Unit 4: Adding tables",
                        topics: ["Inserting tables", "Formatting a table"]
                    },
                    {
                        title: "Unit 5: Inserting graphic objects",
                        topics: ["Inserting symbols and special characters", "Inserting graphics"]
                    },
                    {
                        title: "Unit 6: Controlling page appearance",
                        topics: ["Adding a watermark and page colour to a document", "Adding headers and footers", "Controlling page layout"]
                    },
                    {
                        title: "Unit 7: Proofing of a document",
                        topics: ["Proofing a document", "Automatic field added capability"]
                    }
                ]
            },
            {
                title: "Intermediate Microsoft Word",
                description: "The intermediate course offers a more in-depth look at Microsoft Word and its functions. The course shows you how to work with tables and charts. You will also learn how to change the style of a document, and work with pictures and graphics.",
                level: "Intermediate",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Working with tables and charts",
                        topics: ["Sorting table data", "Controlling cell layout", "Creating a chart"]
                    },
                    {
                        title: "Unit 2: Creating formats using styles and themes",
                        topics: ["Creating and modifying text styles", "Creating and modifying lists and table styles", "Applying themes to documents", "Inserting footnotes and endnotes"]
                    },
                    {
                        title: "Unit 3: Using images in a document",
                        topics: ["Resizing an image", "Adjusting image correction options", "Adjusting image colours", "Applying artistic effects", "Removing the background from an image"]
                    },
                    {
                        title: "Unit 4: Creating custom graphic elements",
                        topics: ["Creating and formatting text boxes", "Using SmartArt graphics", "Adding text effects"]
                    },
                    {
                        title: "Unit 5: Regulating text flow",
                        topics: ["Inserting section breaks", "Inserting columns", "Formatting a column"]
                    },
                    {
                        title: "Unit 6: Using templates",
                        topics: ["Creating a document using a template", "Creating a template"]
                    },
                    {
                        title: "Unit 7: Using mail merge",
                        topics: ["Introduction to mail merge", "Performing a mail merge"]
                    }
                ]
            },
            {
                title: "Advanced Microsoft Word",
                description: "The advanced phase of our Word training takes you into a more in-depth world of the diverse ability and full functionality of the Microsoft Word program. We demonstrate advanced user techniques to position you ahead of the rest.",
                level: "Advanced",
                duration: "24 hours",
                units: [
                    {
                        title: "Unit 1: Collaborating on documents",
                        topics: ["Sending a document as an attachment", "Reviewing a document: Tracking changes"]
                    },
                    {
                        title: "Unit 2: Adding reference marks and notes",
                        topics: ["Adding captions and a table of figures", "Adding cross references", "Adding and removing bookmarks", "Inserting hyperlinks", "Inserting footnotes and endnotes", "Adding citations and placeholders", "Adding a bibliography"]
                    },
                    {
                        title: "Unit 3: Simplifying and managing long documents",
                        topics: ["Inserting blank and cover pages", "Inserting an index", "Inserting a table of contents", "Adding a table of authorities"]
                    },
                    {
                        title: "Unit 4: Securing a document",
                        topics: ["How to work with hidden text", "Setting formatting and editing restrictions", "Setting a password for a document"]
                    },
                    {
                        title: "Unit 5: Macros",
                        topics: ["Recording a macro"]
                    }
                ]
            },
            {
                title: "Basic Microsoft Excel",
                description: "The online basic Microsoft Excel course is designed for those who are unfamiliar with basic formulas and formatting, such as the 'plus and minus' functions. This course helps if the Excel screen is still a scary environment in general.",
                level: "Basic",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Getting started",
                        topics: ["Identifying the elements of the Excel interface", "Customising the Excel interface", "Creating a basic worksheet", "Opening and saving"]
                    },
                    {
                        title: "Unit 2: Performing calculations in an Excel worksheet",
                        topics: ["Creating formulas in a worksheet", "Inserting functions in a worksheet", "Copying and pasting formulas", "Calculating formulas over multiple sheets"]
                    },
                    {
                        title: "Unit 3: Modifying an Excel worksheet",
                        topics: ["Editing worksheet data", "Finding and replacing data", "Copy, cut, paste and BODMAS", "Automatic fill"]
                    },
                    {
                        title: "Unit 4: Modifying the appearance of a worksheet",
                        topics: ["Applying font properties", "Adding borders and colours to cells", "Aligning content in a cell", "Applying number formatting", "Applying cell styles", "Adjusting the row height and column width", "Inserting and deleting rows and columns"]
                    },
                    {
                        title: "Unit 5: Managing an Excel workbook",
                        topics: ["Managing worksheets", "Viewing worksheets and workbooks"]
                    },
                    {
                        title: "Unit 6: Printing Excel workbooks",
                        topics: ["Defining the page layout", "Printing a workbook", "Printing the same row on each page", "Printing area"]
                    },
                    {
                        title: "Unit 7: Other functions",
                        topics: ["Using comments", "Spelling", "Automatic word corrections"]
                    },
                    {
                        title: "Unit 8: Google sheets",
                        topics: ["Google sheets"]
                    }
                ]
            },
            {
                title: "Intermediate Microsoft Excel",
                description: "The Intermediate Microsoft Excel course is for those who understand the basics of Excel and are familiar with the Excel screen, formatting and basic formulas. You will explore basic Vlookups and pivot tables to ensure that you understand the more advanced formulas and functions of MS Excel.",
                level: "Intermediate",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Calculating data with advanced formulas",
                        topics: ["Applying cell and range names", "Naming ranges automatically", "Using specialised functions", "Fixed referencing"]
                    },
                    {
                        title: "Unit 2: Organising worksheets and table data",
                        topics: ["Sorting and filtering data", "Creating and modifying tables"]
                    },
                    {
                        title: "Unit 3: Presenting data using charts",
                        topics: ["Creating a chart", "Modifying charts", "Adding data to charts"]
                    },
                    {
                        title: "Unit 4: Simplistic formulas",
                        topics: ["MIN, MAX and Average", "COUNT, COUNTA and COUNTBLANK", "Rounding"]
                    },
                    {
                        title: "Unit 5: Inserting graphic objects",
                        topics: ["Inserting graphic objects", "Drawing and modifying shapes", "Illustrating workflow using SmartArt graphics", "Adding a background"]
                    },
                    {
                        title: "Unit 6: Custom formatting",
                        topics: ["Custom format numbers, dates, etc."]
                    },
                    {
                        title: "Unit 7: Other functions",
                        topics: ["Watch window options", "Text to columns", "Subtotal function", "Protection", "Setting up calculations", "Types of errors", "Breaking links", "Data validation", "Hyperlinks"]
                    },
                    {
                        title: "Unit 8: Dates",
                        topics: ["Working with dates and time", "Dynamic dates and TODAY and NOW functions"]
                    },
                    {
                        title: "Unit 9: Formatting functions",
                        topics: ["Conditional formatting", "Format painter", "Paste special"]
                    },
                    {
                        title: "Unit 10: Reporting formula",
                        topics: ["Pivot tables", "Counting using pivot tables and drilling down into detail", "Updating a pivot table with new data and adding multiple values", "Using calculated fields in pivot tables", "Removing or hiding subtotals, grand totals and filling blanks"]
                    },
                    {
                        title: "Unit 11: Google sheets",
                        topics: ["Google sheets"]
                    }
                ]
            },
            {
                title: "Advanced Microsoft Excel",
                description: "Master advanced Excel features including complex functions, macros, and sophisticated data analysis tools.",
                level: "Advanced",
                duration: "32 hours",
                units: [
                    {
                        title: "Unit 1: Formula basics",
                        topics: ["Formula basics", "Types of errors", "Fixed referencing"]
                    },
                    {
                        title: "Unit 2: Logical functions", 
                        topics: ["Logical test", "IF function", "OR function", "AND function", "IFERROR function"]
                    },
                    {
                        title: "Unit 3: Lookup function",
                        topics: ["Vlookup function", "MATCH formula", "Using the MATCH formula to populate the column index number", "INDEX", "OFFSET", "Using Vlookup to fix data with mapping tables", "Using a True or 1 in the Vlookup"]
                    },
                    {
                        title: "Unit 4: Reporting functions",
                        topics: ["ADDRESS formula", "Pivot tables", "Counting using pivot tables to generate lists", "Updating values in a pivot table and adding multiple values", "Using calculated fields in pivot tables", "Changing the look and feel in pivot tables", "Splitting pivot tables into multiple sheets and grouping data", "Retrieving the field list when lost", "Creating dashboards from pivot tables", "SUMIFS formula", "Recording macros and using macros to improve reporting", "INDIRECT formula"]
                    },
                    {
                        title: "Unit 5: Text formulas",
                        topics: ["FIND formula", "CONCATENATE formula", "LEFT, RIGHT and MID functions", "TRIM functions", "PROPER/LOWER formulas", "UPPER formula", "SUBSTITUTE formula", "VALUE formula", "LEN formula"]
                    },
                    {
                        title: "Unit 6: Dates",
                        topics: ["Understanding dates and dynamic dates", "Converting text to dates with formulas", "NETWORKINGDAYS formula", "END OF MONTH formula", "Working with time", "TEXT formula and dates"]
                    },
                    {
                        title: "Unit 7: Financial functions",
                        topics: ["PMT function", "IPMT function", "FV function", "NPV function", "IRR function"]
                    },
                    {
                        title: "Unit 8: Other",
                        topics: ["Using the find and replace option to edit formulas", "Using conditional formatting to do reconciliations and finding duplicates", "COUNTIF formula and using COUNTIF to number data", "Goalseek"]
                    },
                    {
                        title: "Unit 9: Google sheets",
                        topics: ["Google sheets", "More Google sheets", "Import ranges", "Google forms"]
                    }
                ]
            },
            {
                title: "Basic Microsoft PowerPoint",
                description: "From A-Z, you will be equipped to create effective presentations while making the most of shortcut keys and methods to ensure maximum utility of Microsoft PowerPoint.",
                level: "Basic",
                duration: "12 hours",
                units: [
                    {
                        title: "Unit 1: Getting started with PowerPoint",
                        topics: ["Finding your way in the PowerPoint environment", "The quick access toolbar", "Navigating in PowerPoint"]
                    },
                    {
                        title: "Unit 2: Slide basics",
                        topics: ["Inserting new slides", "Modifying slide layouts", "Moving and copying slides", "Adding notes"]
                    },
                    {
                        title: "Unit 3: Working with text",
                        topics: ["Copying and moving text", "Formatting text", "Inserting and deleting text boxes", "Formatting text in a text box"]
                    },
                    {
                        title: "Unit 4: Working with themes",
                        topics: ["Applying a theme to a blank presentation", "Modifying a theme", "Saving a theme"]
                    },
                    {
                        title: "Unit 5: Inserting images",
                        topics: ["Inserting and manipulating a picture", "Inserting clipart", "Inserting a screenshot"]
                    },
                    {
                        title: "Unit 6: Modifying lists",
                        topics: ["Applying bullets to a list", "Customising the bullet style", "Applying numbering to a list", "Modifying number styles", "Changing line spacing and indentation"]
                    },
                    {
                        title: "Unit 7: WordArt and shapes",
                        topics: ["Creating WordArt", "Inserting shapes", "Formatting shapes"]
                    },
                    {
                        title: "Unit 8: Transitions",
                        topics: ["Applying transitions", "Modifying transitions", "Advancing slides"]
                    },
                    {
                        title: "Unit 9: Preparing to show your slide show",
                        topics: ["Adding your notes to your presentation", "Spell checking your presentation", "Printing your slides, notes and handouts", "Presenting your slides using presentation tools"]
                    },
                    {
                        title: "Unit 10: Adding headers and footers",
                        topics: ["Adding a footer", "Adding a header", "Adding a page number"]
                    }
                ]
            },
            {
                title: "Advanced Microsoft PowerPoint",
                description: "In today's corporate environment it is vital that your presentations are original, powerful and effective. In this course, we take you through the advanced features of PowerPoint to give you the tools to win your audience over.",
                level: "Advanced",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Tables",
                        topics: ["Creating a table slide", "Changing row height/column width", "Inserting/deleting rows/columns", "Applying borders and shading"]
                    },
                    {
                        title: "Unit 2: Graphs",
                        topics: ["Creating graphs, i.e., column, pie, etc", "Modifying and formatting graphs"]
                    },
                    {
                        title: "Unit 3: Working with objects",
                        topics: ["Drawing and modifying lines/shapes/text boxes", "Aligning objects", "Rotating and flipping objects", "Grouping and ungrouping objects"]
                    },
                    {
                        title: "Unit 4: Using SmartArt",
                        topics: ["Inserting a SmartArt graphic", "Converting an existing slide to SmartArt", "Modifying the appearance of a SmartArt graphic"]
                    },
                    {
                        title: "Unit 5: Templates and masters",
                        topics: ["Creating and modifying templates", "Working with slide masters", "Modifying backgrounds and colour schemes"]
                    },
                    {
                        title: "Unit 6: Interactive slide show",
                        topics: ["Creating action buttons", "Inserting hyperlinks"]
                    },
                    {
                        title: "Unit 7: Multimedia automation",
                        topics: ["Adding animated pictures", "Adding sounds", "Adding videos/movies", "Playing a CD"]
                    },
                    {
                        title: "Unit 8: Importing and exporting",
                        topics: ["Importing and exporting between Word and PowerPoint", "Importing and exporting between Excel and PowerPoint", "Inserting slides from other presentations"]
                    },
                    {
                        title: "Unit 9: Setting up a slide show",
                        topics: ["Rehearsing timings", "Creating custom shows", "Creating and broadcasting video for remote audiences"]
                    },
                    {
                        title: "Unit 10: Slide setup options",
                        topics: ["Creating a self-running presentation", "Packaging to a CD", "Saving with embedded fonts", "Saving a presentation as a show"]
                    },
                    {
                        title: "Unit 11: Working with multiple presentations",
                        topics: ["Working with multiple presentations", "How to copy between presentations"]
                    }
                ]
            },
            {
                title: "Basic Microsoft Access",
                description: "This course explains how a database works and goes on to explore its components. Microsoft Access is an easy-to-use information management tool employed to create customisable database applications.",
                level: "Basic",
                duration: "24 hours",
                units: [
                    {
                        title: "Unit 1: Introduction",
                        topics: ["Identifying elements of the Access interface", "Different types of databases in Access", "Exploring database components", "Exploring different databases", "How to create an Access database", "Using the Help function"]
                    },
                    {
                        title: "Unit 2: Tables",
                        topics: ["Database fields, records and columns", "Creating tables", "Setting field properties", "Manipulating table design", "Manipulating table data", "Deleting a table"]
                    },
                    {
                        title: "Unit 3: Relationships",
                        topics: ["Setting primary and foreign keys", "Creating table relationships", "Editing relationships", "Exploring sub data sheets"]
                    },
                    {
                        title: "Unit 4: Queries",
                        topics: ["Creating select queries", "Extending queries with criteria and running a query", "Using calculated fields in a query", "Applying record groupings"]
                    },
                    {
                        title: "Unit 5: Forms",
                        topics: ["Using auto form wizard, creating a form manually and modifying a form"]
                    },
                    {
                        title: "Unit 6: Reports",
                        topics: ["Creating an auto report, using report wizard, imitations on reports and how to print"]
                    }
                ]
            },
            {
                title: "Microsoft Outlook",
                description: "Microsoft Outlook is a communication software program used for email, calendar and task management. In this course, you will learn how to organise your inbox and simplify your life.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Electronic mail",
                        topics: ["Navigating the Outlook interface and changing the current view", "Opening Outlook, creating and sending emails and closing Outlook", "Formatting, using the spellchecker option and deleting messages", "Working with multiple messages and copying text", "Identifying the sender, replying, forwarding and saving draft messages", "Moving, copying and recalling or replacing an email message", "Attaching a file to an email and removing an attachment", "Previewing, opening and saving an attachment", "Creating, editing and attaching a signature to an email", "Sending an automatic out of office reply email", "Flagging, prioritising and adding reminders to emails", "Organising and sorting emails", "Searching and filtering through emails"]
                    },
                    {
                        title: "Unit 2: Calendar",
                        topics: ["Viewing and customising the calendar", "Mailing, printing and sharing your calendar", "Creating and editing an appointment", "Creating and editing recurring meetings", "Inviting others to a meeting", "Replying to a meeting request", "Keeping track of meeting responses"]
                    },
                    {
                        title: "Unit 3: Contacts",
                        topics: ["Creating and editing contacts", "Creating a distribution list and saving contact details"]
                    },
                    {
                        title: "Unit 4: Tasks",
                        topics: ["Creating and editing a task", "Assigning a task and responding to a task request"]
                    },
                    {
                        title: "Unit 5: More functions",
                        topics: ["Importing and exporting Outlook files", "Using categories for emails, calendars and contacts", "Sharing and opening another user's calendar", "Printing an email"]
                    },
                    {
                        title: "Unit 6: Email etiquette and legislation",
                        topics: ["Sending emails", "Attachments and forwarding", "Formatting emails"]
                    }
                ]
            },
            {
                title: "Microsoft Visual Basic for Excel",
                description: "Visual Basic is programming in Excel. Although the course is different from the run-of-the-mill formulas, advanced Excel knowledge is required. On the first day, you will become familiar with the various functions, while on the second day you will take part in 'practicals'.",
                level: "Advanced",
                duration: "28 hours",
                units: [
                    {
                        title: "Unit 1: VBA coding – where to start",
                        topics: ["Developer toolbar", "Understanding coding for macros"]
                    },
                    {
                        title: "Unit 2: Basic functions",
                        topics: ["Referencing to sheets", "Referencing to ranges", "Declaring a variable"]
                    },
                    {
                        title: "Unit 3: User forms",
                        topics: ["Inserting a basic user form", "Opening and closing user forms", "Labels, text boxes and lists", "Checkboxes, option boxes and toggle boxes"]
                    },
                    {
                        title: "Unit 4: Formulas",
                        topics: ["IF formulas", "Nested IF formulas", "Other formulas"]
                    },
                    {
                        title: "Unit 5: Loops",
                        topics: ["Loops", "Using different modules for different macros and naming them", "WITH statements"]
                    },
                    {
                        title: "Unit 6: Finishing your program",
                        topics: ["Testing and debugging", "Protecting your code"]
                    },
                    {
                        title: "Unit 7: Other codes",
                        topics: ["Protecting sheets and unprotecting sheets with coding", "Message boxes", "Hiding and unhiding sheets, rows and columns with coding", "Inserting, deleting and renaming sheets", "Cleaning cells", "Running a code when opening a workbook", "Using the personal macro workbook to save different codes and how to add codes to the customised ribbon"]
                    },
                    {
                        title: "Unit 8: More complicated programs explained",
                        topics: ["Building a navigational sheet with buttons and userforms", "Creating a userform which updates a database every time you change the database"]
                    },
                    {
                        title: "Unit 9: Free codes to use",
                        topics: ["Opening multiple files and importing data", "Unhiding all sheeting in a file", "Listing all the sheet names in specific files"]
                    }
                ]
            },
            {
                title: "Financial Modelling",
                description: "While there is a lot of value in mastering the basic and intermediate array of functions offered by Microsoft Excel, for some, simply automating the day-to-day arithmetic functions involved in a simple balance sheet will not be enough to meet the financial accounting needs of a large company.",
                level: "Advanced",
                duration: "24 hours",
                units: [
                    {
                        title: "Unit 1: Creating reports from multiple sources",
                        topics: ["Creating a pivot table to use as a database", "Consolidating multiple pivot tables", "Updating multiple pivot tables"]
                    },
                    {
                        title: "Unit 2: Converting multiple columns into a database format",
                        topics: ["Converting multiple columns into a database format"]
                    },
                    {
                        title: "Unit 3: Simplifying reporting",
                        topics: ["Introduction", "Setting up the structure", "Checking source data", "Consolidating source data", "Creating a mapping table, mapping data and validating mapping", "Completing the report"]
                    },
                    {
                        title: "Unit 4: Automatic reconciliations",
                        topics: ["Introduction", "Numbering data automatically and making it unique", "Steps in reconciling data (one list)", "Reconciling two lists"]
                    },
                    {
                        title: "Unit 5: Reporting by using the indirect formula",
                        topics: ["Introduction", "Using indirect formula to report on column format data"]
                    },
                    {
                        title: "Unit 6: Compiling an age analysis",
                        topics: ["Introduction", "Fixing the dates and calculating the number of days", "Creating a mapping table", "Finishing an age analysis and reporting"]
                    },
                    {
                        title: "Unit 7: Amortisation tables",
                        topics: ["Amortisation tables where the rates stay consistent", "Amortisation tables where the rates and capital payments can change"]
                    },
                    {
                        title: "Unit 8: Cash flows",
                        topics: ["Introduction", "Fixing the signage", "Creating adjustment columns", "Creating a mapping table", "Finishing the cash flow statement"]
                    }
                ]
            }
        ]
    },
    leadership: {
        title: "Leadership Courses",
        description: "Develop your leadership capabilities with courses on management, strategy, and team building.",
        courses: [
            {
                title: "Leadership Theories",
                description: "This course discusses the traits and behaviours that individuals can adopt to boost their own leadership abilities. It also helps you understand what makes leaders act the way they do.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Concept of supervisory leadership",
                        topics: ["Concept of supervisory leadership", "Qualities of leaders", "Role of leaders", "Leadership styles", "Developing a leadership development strategy"]
                    },
                    {
                        title: "Unit 2: Leadership and management",
                        topics: ["Leadership and management", "Differentiating roles of leaders and managers", "Concepts of responsibility and accountability"]
                    },
                    {
                        title: "Unit 3: Leadership theories",
                        topics: ["Leadership theories", "Transformational leadership", "Transactional leadership", "Visionary leadership", "Servant leadership theory"]
                    }
                ]
            },
            {
                title: "Communication Skills",
                description: "Communication is the giving, receiving or exchange of information, opinions or ideas through writing, speech or visual means so that the material communicated is completely understood.",
                level: "Basic",
                duration: "12 hours",
                units: [
                    {
                        title: "Unit 1: Introduction to communication",
                        topics: ["Why is communication important in business?", "Communication process", "Purpose of communication", "Types of communication", "Email format"]
                    },
                    {
                        title: "Unit 2: Meetings",
                        topics: ["Types of meetings", "Role of agendas in meetings", "Meeting procedures", "Process of chairing a meeting"]
                    },
                    {
                        title: "Unit 3: Report writing",
                        topics: ["Report writing", "Types of business reports", "Data collection", "Compiling a report", "Report writing process"]
                    },
                    {
                        title: "Unit 4: Oral presentations",
                        topics: ["Introduction", "Creating the presentation", "Building the presentation", "Delivering your presentation"]
                    }
                ]
            },
            {
                title: "Building Teams",
                description: "Many people tend to assume groups and teams are the same. In reality, the two are very different. In this course, you will look at the theory of teams and the role of teams in the workplace, the types and importance of teams, as well as the qualities of a good team.",
                level: "Intermediate",
                duration: "18 hours",
                units: [
                    {
                        title: "Unit 1: Theory of teams and its role in workplace",
                        topics: ["Theory of teams and its role in the workplace", "Types of teams", "Importance of teams", "Qualities of a good team"]
                    },
                    {
                        title: "Unit 2: Theory of teams and team dynamics",
                        topics: ["Theory of teams and team dynamics (Group norms, Presence of others)", "Group conflicts", "Stages of conflict"]
                    },
                    {
                        title: "Unit 3: Team building",
                        topics: ["Team building", "Team building process", "Stages of team development", "Storming", "Norming", "Promoting trust in the team", "Promoting cohesion in the team", "Promoting creativity in the team", "Promoting productivity in the team by delegating"]
                    },
                    {
                        title: "Unit 4: Team leaders",
                        topics: ["Team leadership", "Leadership styles", "Laissez-faire style of leadership", "Bureaucratic leadership", "Problem-solving in teams"]
                    },
                    {
                        title: "Unit 5: Evaluating team effectiveness",
                        topics: ["Evaluating team effectiveness", "Analysis of team effectiveness", "Developing an action plan", "Obtaining team commitment to the action plan"]
                    }
                ]
            },
            {
                title: "Performance Management",
                description: "To accomplish multiple goals set in performance appraisals, most organisations are leaning towards a continuous programme of performance management. This is important to both the professional success of an organisation and the personal advancement of its employees.",
                level: "Advanced",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Formulation",
                        topics: ["Introduction", "Benefits of performance management", "Steps in developing performance standards", "Methods for monitoring employee performance", "Involving team members in setting performance standards"]
                    },
                    {
                        title: "Unit 2: Preparing for a performance review meeting",
                        topics: ["Preparing for a performance review meeting", "Preliminary assessment of performance", "Deciding on methods of giving feedback", "Giving constructive feedback", "Documents for performance review interviews"]
                    },
                    {
                        title: "Unit 3: Conducting a performance review meeting",
                        topics: ["Conducting a performance review interview", "Useful techniques to follow when doing the performance rating"]
                    }
                ]
            },
            {
                title: "Change Management",
                description: "Change is a constant in many of our lives. All around us technologies, processes, people, ideas and methods often change, affecting the way we perform daily tasks and live our lives. Change management entails thoughtful planning and sensitive implementation.",
                level: "Advanced",
                duration: "22 hours",
                units: [
                    {
                        title: "Unit 1: Concept of change",
                        topics: ["Concept of change", "Change management process", "Nature of change in an organisation", "Positive and negative impact of change on a business", "Negative impact of change", "Successful and sustainable change"]
                    },
                    {
                        title: "Unit 2: Determining the need for change in a unit",
                        topics: ["Importance of correctly identifying the reason for change", "Steps to follow to determine if change is necessary", "Using SWOT analysis to substantiate the need for change"]
                    },
                    {
                        title: "Unit 3: Models for implementing change",
                        topics: ["Models for implementing change", "Understanding Lewin's model", "Practical steps for using the framework", "'Adkar' – a model for change management", "Business dimension of change", "Kotter's 8 Step Change model"]
                    },
                    {
                        title: "Unit 4: Implementing the change process",
                        topics: ["Implementing the change process", "Managing resistance to change", "Roles and competencies of change agents", "Catalyst", "Competencies of change agents", "Functional/technical competencies", "Personal (effectiveness)/self-management competency"]
                    }
                ]
            },
            {
                title: "Project Planning",
                description: "In society, almost everything you do can be described as project management. From buying weekly groceries to organising a family get-together, project management skills are involved. The government also depends on the success of its projects and/or private projects in order to deliver services to the public.",
                level: "Intermediate",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Selecting a work-based project for a unit",
                        topics: ["Selecting a work-based project for a unit", "The term 'management'", "Identifying project alternatives", "Selecting a project", "Numeric model"]
                    },
                    {
                        title: "Unit 2: Project scope",
                        topics: ["Project scope", "Risk identification and analysis", "Risk assessment"]
                    },
                    {
                        title: "Unit 3: Developing a project plan",
                        topics: ["Developing a project plan", "Project goals and objectives (Writing goals and objectives)", "Project roles and responsibilities (The project manager)", "Tools to create a work breakdown structure (WBS)", "Quality and performance management", "Checking accuracy and completeness of a project plan"]
                    },
                    {
                        title: "Unit 4: Developing tools to measure key performance parameters",
                        topics: ["Developing tools to measure key performance parameters", "Steps in developing a Gantt chart", "Developing a project budget", "Communicating performance parameters with the team"]
                    },
                    {
                        title: "Unit 5: Implementing and evaluating project progress",
                        topics: ["Implementing and evaluating project progress", "Identifying project deviations", "Change control tools", "Evaluation of project results"]
                    }
                ]
            },
            {
                title: "Emotional Intelligence",
                description: "Emotional intelligence is the ability to understand and manage your own emotions and those of the people around you. People with a high degree of emotional intelligence know what they are feeling, what their emotions mean and how these emotions can affect other people.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Introduction to emotional intelligence",
                        topics: ["Principles and concepts of emotional intelligence in life and work relations", "Importance of emotional intelligence"]
                    },
                    {
                        title: "Unit 2: Role of emotional intelligence in interpersonal relationships in life and work situations",
                        topics: ["Role of emotional intelligence in interpersonal relationships in life and work situations", "Techniques for giving and receiving feedback", "Useful techniques to employ when giving feedback", "Receiving feedback"]
                    },
                    {
                        title: "Unit 3: Impact of emotional intelligence on life and work situations",
                        topics: ["Impact of emotional intelligence on life and work interactions", "Emotional intelligence in the workplace", "Conflict within the workplace", "Conflict management techniques", "Consequences of applying emotional intelligence"]
                    },
                    {
                        title: "Unit 4: Evaluating own level of emotional intelligence to determine development areas",
                        topics: ["Evaluating own level of emotional intelligence to determine development areas", "Different methods of measuring emotional intelligence", "Target scoring", "Signs of low EQ or unhealthy development of innate emotional intelligence", "Techniques for improving own emotional intelligence"]
                    }
                ]
            },
            {
                title: "Decision-Making",
                description: "Decision-making is a key skill in any organisation and is especially important if you want to be an effective leader. Whether you are deciding which person to recruit, which supplier to use or which strategy to follow, the ability to make good decisions is fundamental.",
                level: "Intermediate",
                duration: "14 hours",
                units: [
                    {
                        title: "Unit 1: Application of critical and analytical skills in analysing an issue",
                        topics: ["Application of critical and analytical skills in analysing an issue", "Key components of critical thinking", "Application of critical skills – mind mapping", "Analytical skills in problem definition and analysis", "Application of the cause-and-effect analysis"]
                    },
                    {
                        title: "Unit 2: Stakeholder engagement in problem analysis",
                        topics: ["Introduction", "Critical and analytical process for analysing the issue/problem and generating ideas", "Analysing the unit's internal and external environment", "Tips when engaging stakeholders in problem-solving"]
                    },
                    {
                        title: "Unit 3: Selecting feasible solutions",
                        topics: ["Identifying the problem", "Brainstorming", "Analysing feedback from stakeholders to identify solutions", "Evaluating possible solutions"]
                    },
                    {
                        title: "Unit 4: Formulating and communicating",
                        topics: ["Introduction", "Selecting the optimum solution (Decision-making)", "Creating an action plan/work plan to implement the solution", "Change processes to support implementation of the solution", "Communicating decisions to team members"]
                    }
                ]
            },
            {
                title: "Conflict Management",
                description: "Conflict in the workplace can be a normal part of doing business. When properly managed, it can be beneficial as it fosters an environment of healthy competition. However, conflict may also have a detrimental effect.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Main sources of conflict",
                        topics: ["Introduction", "Possible sources of conflict", "Positive and negative characteristics of conflict in the workplace", "Conflict that may arise in personality types"]
                    },
                    {
                        title: "Unit 2: Appropriate techniques in conflict management",
                        topics: ["Various business conflict modes", "Useful steps to be taken to manage conflict", "Managing your own conflicts", "Specific personalities and strategies on how to deal with them", "Different stages of conflict"]
                    },
                    {
                        title: "Unit 3: Appropriate action plan and strategies to manage conflict",
                        topics: ["Introduction – methods available to resolve conflict in terms of the Labour Relations Act", "Most appropriate strategy to resolve a particular conflict", "Action plans for conflict resolution", "Role organisational policies and procedures play in preventing/resolving conflict"]
                    },
                    {
                        title: "Unit 4: Attributes of an effective conflict manager",
                        topics: ["Personal attributes of a good conflict manager", "Conducting a skills audit", "Negative attributes which should be avoided or controlled by an effective conflict manager"]
                    }
                ]
            },
            {
                title: "Coaching",
                description: "This course is intended for those who need to select and coach first line managers. It is important to select a first line manager who has the potential to grow into an identified role. It is crucial to know the Key Performance Areas (KPAs) and the Key Result Areas (KRAs) before filling a position.",
                level: "Advanced",
                duration: "18 hours",
                units: [
                    {
                        title: "Unit 1: Selecting a first line manager",
                        topics: ["Selecting a first line manager", "Identifying key performance areas from a first line manager's job profile", "Understanding the requirements of the first line manager position", "Process of selecting candidates", "Verification methods", "Video on assessing candidates against position requirements", "Interview process", "Making decisions and providing feedback to candidates"]
                    },
                    {
                        title: "Unit 2: Planning the coaching process",
                        topics: ["Planning the coaching process", "Developing a coaching plan", "Steps to take when developing a coaching plan", "Preparing records of expected performance or performance standards", "Creating a system for recording decisions and commitments prior to coaching"]
                    },
                    {
                        title: "Unit 3: The coaching process",
                        topics: ["The coaching process", "Role of a coach", "Purpose, content and schedule of the coaching process", "Conducting a coaching session", "Elements of an effective coaching session", "Coaching strategies", "Coaching meeting checklist"]
                    },
                    {
                        title: "Unit 4: Monitoring and measuring results of coaching sessions",
                        topics: ["Monitoring and measuring results of coaching sessions", "Guidelines for assessment", "Giving feedback during and after coaching sessions", "Giving positive feedback", "Recording corrective action where requirements were not met", "Conducting follow-up action"]
                    }
                ]
            },
            {
                title: "Talent Management",
                description: "Organisations are made up of people: people creating value through proven business processes, innovation, customer service, sales and many other important activities. As an organisation strives to meet its business goals, it must make sure that it has a continuous and integrated process for recruiting, training, managing, supporting and compensating these people.",
                level: "Advanced",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Conducting a training needs analysis",
                        topics: ["Conducting a training needs analysis", "Concept of talent management", "Talent management strategy", "Determining the skills gap and training needs", "Conducting a skills audit", "Skills audits may be conducted in several ways", "Integrating results of performance appraisal in a training needs analysis", "Stakeholder input in interpretation of analysis results of training needs"]
                    },
                    {
                        title: "Unit 2: Recording results of a training needs analysis",
                        topics: ["Recording results of a training needs analysis", "Training needs analysis report", "Relating developmental needs to career development paths and talent management strategy"]
                    },
                    {
                        title: "Unit 3: Compiling a personal people development plan",
                        topics: ["Compiling a personal people development plan", "Learning programmes to address learning needs", "Job shadowing", "Setting objectives and desired outcomes of a learning programme", "Implementation of learning intervention", "Programme administration – coordination", "Training programme design and development", "Training design and development", "Facilitation", "Assessment", "Recording and reporting on learner interventions", "Role of unit manager in talent management and people development", "Aligning a training development plan to legal requirements", "National Qualifications Framework (NQF)", "Recognition of Prior Learning (RPL)", "Promotion of lifelong learning"]
                    },
                    {
                        title: "Unit 4: Implementation of the people development plan",
                        topics: ["Implementation of the people development plan", "Writing final evaluation reports from stakeholder evaluations", "Trainer self-assessment questionnaire for use after the session"]
                    }
                ]
            },
            {
                title: "Empower Team Members",
                description: "The success of any project depends on the contribution of every member in the team, but some teams work better together than others. When members of a team have a sense of ownership and believe that their contributions are valued, they feel motivated to contribute their optimum effort.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Recognising team member performance",
                        topics: ["Recognising team member performance", "Roles, duties and responsibilities of each team member", "Additional examples of roles of team members", "Giving feedback to team members", "Giving feedback effectively", "Dealing with team members effectively"]
                    },
                    {
                        title: "Unit 2: Encouraging participation in decision-making",
                        topics: ["Encouraging participation in decision-making", "Providing alternatives, evaluating and selecting one alternative for implementation"]
                    },
                    {
                        title: "Unit 3: Delegation of tasks",
                        topics: ["Delegation of tasks", "Decision-making authority", "Establishing an information sharing system", "Monitoring the successful completion of delegated tasks and using performance as a means of ongoing development", "Recognising successful achievement of delegated tasks"]
                    },
                    {
                        title: "Unit 4: Reviewing decisions and performance of delegated tasks",
                        topics: ["Reviewing decisions and performance of delegated tasks", "Reviewing delegated tasks"]
                    }
                ]
            },
            {
                title: "Risk Management",
                description: "This course starts by exploring the concept of risk and the factors that can constitute risks, i.e., legislation affecting business operations in South Africa, health risks and a few others. It looks at organisational policies and procedures as the strategic link between a company's vision and its day-to-day operations.",
                level: "Advanced",
                duration: "24 hours",
                units: [
                    {
                        title: "Unit 1: Understanding risk",
                        topics: ["Understanding risk", "Concept of risk management", "Factors that can constitute risks", "Employment Equity Act", "Financial risks", "Operational risks", "Health and safety risks", "Environmental risks", "Organisational policies and procedures"]
                    },
                    {
                        title: "Unit 2: Risk identification and assessment",
                        topics: ["Risk identification and assessment", "Identifying prospective risks", "Conducting interviews", "Scenarios that can constitute a risk", "Financial risks", "Goodwill risks", "Risk of staff loss", "Risk identification template", "Impact analysis", "Analysis techniques", "Risk strategies", "Risk register"]
                    },
                    {
                        title: "Unit 3: Developing contingency plans",
                        topics: ["Developing contingency plans", "Plan development and implementation", "Communicating contingency plans", "Storage of contingency plans"]
                    },
                    {
                        title: "Unit 4: Testing and revising contingency plans",
                        topics: ["Testing and revising contingency plans", "Recommendations on improvements to contingency plans", "Revising contingency plans"]
                    }
                ]
            },
            {
                title: "Innovation",
                description: "This course provides an overview of the whole innovation process, from developing a plan for creating an environment conducive to innovation, through to the creative thinking process. The first section covers the concept of innovation, culture for innovation, interpreting and analysing findings and identifying areas for improvement.",
                level: "Advanced",
                duration: "18 hours",
                units: [
                    {
                        title: "Unit 1: Assessing a unit for innovation opportunities",
                        topics: ["Concept of innovation", "Barriers to innovation", "Environment conducive to innovation", "Communication", "Processes", "Incentivising innovation", "Creating a basic worksheet", "Interpreting and analysing findings", "Detailed analysis", "Interpreting information"]
                    },
                    {
                        title: "Unit 2: Understanding the concept of creativity",
                        topics: ["Concept of creativity", "Creativity techniques", "Mind-mapping", "Lateral thinking", "Problem-solving techniques"]
                    },
                    {
                        title: "Unit 3: Developing a plan for creating an environment conducive to innovation",
                        topics: ["Role of unit manager in creating an environment conducive to innovation", "Developing a plan to create an environment conducive to innovation", "Process of implementing an environment conducive to innovation", "Promoting the plan"]
                    },
                    {
                        title: "Unit 4: Creative thinking process",
                        topics: ["Application of creativity techniques", "Brainstorming", "Mind-mapping", "Lateral thinking", "Generating alternative solutions", "Selecting the best alternative", "Developing a concept for implementation"]
                    }
                ]
            },
            {
                title: "Operational Planning",
                description: "An operational plan is a highly detailed plan that provides a clear picture of how a team or a department will contribute to the achievement of the organisation's goals. It maps out the day-to-day tasks required to run a business.",
                level: "Intermediate",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Developing an operational strategy for a unit",
                        topics: ["Developing an operational strategy for a unit", "Benefits of planning", "Determining the purpose of a unit from the strategic plan", "Developing operational strategies", "Alignment between operational strategy and organisational strategy", "Developing objectives", "Developing performance standards"]
                    },
                    {
                        title: "Unit 2: Developing an operational plan for a unit",
                        topics: ["Developing an operational plan for a unit", "Developing an operational plan", "Validating measurable parameters against customer and unit performance requirements", "Monitoring systems for operational plans", "Communicating the operational plan and collecting feedback", "Listening to feedback"]
                    },
                    {
                        title: "Unit 3: Implementing an operational plan in a unit",
                        topics: ["Implementing an operational plan in a unit", "Managing resource usage during implementation", "Control measures by first-line managers"]
                    },
                    {
                        title: "Unit 4: Monitoring, measuring and evaluating the achievement of goals and objectives",
                        topics: ["Monitoring, measuring and evaluating the achievement of goals and objectives", "Conducting performance reviews for team members", "Skills and techniques", "Recommendations on corrective actions", "Evaluating results in terms of team contributions"]
                    }
                ]
            },
            {
                title: "Finance for Non-Financial Managers",
                description: "This course enables you to understand your company's financials. It addresses everything from basic accounting terminology and processes, budgeting and ethics, to understanding and working with the various accounting documents.",
                level: "Intermediate",
                duration: "24 hours",
                units: [
                    {
                        title: "Unit 1&2: What is finance?",
                        topics: ["'What is finance?' and basic elements of an income and expenditure statement"]
                    },
                    {
                        title: "Unit 2: Basic elements of an income statement",
                        topics: ["Format of an income statement", "Sources of income and expenditure"]
                    },
                    {
                        title: "Unit 3: Basic elements of a balance sheet",
                        topics: ["Basic elements of a balance sheet", "Concept of an asset", "Concept of a liability", "Comparing and evaluating balance sheets", "Ratios"]
                    },
                    {
                        title: "Unit 4: Compiling a personal asset and liability statement",
                        topics: ["Compiling a personal asset and liability statement"]
                    },
                    {
                        title: "Unit 5: Making financial decisions using financial statements",
                        topics: ["Compiling a personal asset and liability statement", "Cashflow and liquidity"]
                    },
                    {
                        title: "Unit 6: The accounting cycle",
                        topics: ["The accounting cycle"]
                    },
                    {
                        title: "Unit 7: Management reports and month-ends",
                        topics: ["Management reports and month-ends"]
                    }
                ]
            },
            {
                title: "Knowledge Management",
                description: "In today's economy, learning and knowledge have become key success factors for international competitiveness with the result that intangible resources have become vitally important. Organisations have seen the competitive battlefield shift from tangible resources to intangible resources where elements like knowledge and the ability to manage it play a crucial role in business success.",
                level: "Advanced",
                duration: "18 hours",
                units: [
                    {
                        title: "Unit 1: Concepts and components of knowledge management",
                        topics: ["Concepts and components of knowledge management", "Driving force of knowledge economy", "Components of a knowledge management system in an organisation", "Importance of knowledge management in an entity", "Knowledge management process (EEK)"]
                    },
                    {
                        title: "Unit 2: Knowledge management assessment",
                        topics: ["Knowledge management assessment", "Assessing current practices in a unit or organisation in relation to knowledge management", "Data analysis and interpretation of findings", "Interpreting information"]
                    },
                    {
                        title: "Unit 3: Developing a knowledge management implementation plan",
                        topics: ["Developing a knowledge management implementation plan", "Role of unit manager in knowledge management implementation", "Developing an operational plan or action plan", "Promoting the operational plan"]
                    }
                ]
            },
            {
                title: "Workplace Relations",
                description: "In today's working environment, it is only individuals with excellent interpersonal skills who rise to the top in their personal effectiveness and organisational growth. This is because interpersonal skills enable employees to successfully navigate the dynamic and challenging workplace environment.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Networking in the workplace",
                        topics: ["Networking in the workplace", "Interpersonal skills", "Importance of interpersonal skills", "Networking", "Networking opportunities", "Avenues for communicating with stakeholders", "Strategies and tips for networking"]
                    },
                    {
                        title: "Unit 2: Establishing constructive relationships with managers",
                        topics: ["Establishing constructive relationships with managers", "Seeking guidance and information", "Consulting managers when executing tasks", "Raising quality concerns with managers"]
                    },
                    {
                        title: "Unit 3: Managing conflicts in a unit",
                        topics: ["Managing conflicts in a unit", "Phases of conflict", "Conflict management", "What is your conflict handling style?", "Referring conflicts to appropriate authority or managers"]
                    },
                    {
                        title: "Unit 4: Teamwork",
                        topics: ["Teamwork", "Building a team", "Opportunities to discuss work and personal issues", "How to give constructive feedback", "Giving advice", "Communicating changes to team members", "Communication can either be verbal or written"]
                    }
                ]
            },
            {
                title: "Business Ethics",
                description: "This course explores the relationship and conflict between values, ethics and organisational culture. The first unit also covers the impact of organisational values and culture on organisations. In business, you have to answer to many different people: customers, shareholders and clients.",
                level: "Basic",
                duration: "12 hours",
                units: [
                    {
                        title: "Unit 1: Ethics, values and culture",
                        topics: ["How to apply the principles of ethics to improve organisational culture", "Relationship between personal values, ethics and organisational culture", "Relationship between ethics and organisational culture", "Types of cultures and how they influence ethics and values", "Conflicts between personal values and organisational values and ethics", "Illustrations of conflicts", "Impact of organisational values and culture on organisations", "Role of organisational values and culture on triple bottom line"]
                    },
                    {
                        title: "Unit 2: Understanding ethics, values and culture",
                        topics: ["Importance of ethics in South Africa", "Batho Pele principles", "The King report", "Corporate governance and ethics", "Role of corporate governance", "Benefits of corporate governance", "Ethics of corporate governance", "Ethical practices in a unit"]
                    },
                    {
                        title: "Unit 3: Principles of corporate ethics",
                        topics: ["Principles of corporate ethics", "Assessing individual and organisational conduct, values and ethics", "Conducting a survey to collect information on organisational values, codes of conduct and ethics", "How do you prepare a survey?", "Sampling", "Interviews and phone surveys", "Evaluating the current state against desired state with respect to values, ethics and code of conduct", "Elements of a SWOT analysis", "Setting goals and objectives"]
                    },
                    {
                        title: "Unit 4: Recommendations for strengthening organisational values, code of conduct and ethics",
                        topics: ["Developing an implementation plan to strengthen organisational values, ethics and code of conduct", "Roles and responsibilities of a manager in strengthening ethics, code and values", "Promoting the values, code and ethics", "Elements of a communication plan", "Monitoring and evaluating improvements in values, code and ethics"]
                    }
                ]
            },
            {
                title: "Diversity",
                description: "The world's increasing globalisation requires more interaction among people from diverse cultures, beliefs and backgrounds than ever before. People no longer live and work in an insular marketplace; they are now part of a worldwide economy with competition coming from nearly every continent.",
                level: "Intermediate",
                duration: "14 hours",
                units: [
                    {
                        title: "Unit 1: Diversity in the workplace",
                        topics: ["Definition of key terms", "Definition of diversity", "Diversity as a potential source of discrimination", "Implications of diversity for external and internal relationships", "Cultural biases, stereotypes and perceptions, and their influence on diversity", "Suggestions to facilitate cross-cultural communication", "Being aware of your own potential biases and prejudices", "Perception and diversity", "Person's perception and workforce diversity", "Embracing a diverse gender workplace"]
                    },
                    {
                        title: "Unit 2: The reality of diversity and its value",
                        topics: ["Introduction", "Benefits of diversity in employees and clients for an organisation", "Ways of utilising the diverse talents, attitudes and values of employees", "Components of attitude", "Perspectives", "Reflection of the community", "Ways of meeting the diverse needs of employees", "Ways of meeting the diverse needs of clients with a range of products and services", "Reflection", "Examples", "Encouraging diverse viewpoints in meetings"]
                    },
                    {
                        title: "Unit 3: Managing team members",
                        topics: ["Introduction", "Tools for managers to overcome communication barriers", "Creation of mutual respect and trust", "Common beliefs, values, interests and attitudes that serve as a basis for leading a team", "Encouraging the expression of diverse viewpoints", "Sensitivity towards and understanding of diversity"]
                    },
                    {
                        title: "Unit 4: Dealing with disagreements and conflict arising from diversity in the unit",
                        topics: ["Introduction", "Recognising and dealing with all incidents of conflict and disagreement", "Using disagreements and conflict as opportunities for learning", "Identifying and managing all cases of discrimination and discriminatory practices"]
                    }
                ]
            },
            {
                title: "Recruitment Process",
                description: "Nothing saves you more time and money than recruiting the correct person first time around. As a manager or business owner, you require certain skills to match the right person to the right job. This course will provide you with the knowledge to find the right candidate for the job.",
                level: "Intermediate",
                duration: "18 hours",
                units: [
                    {
                        title: "Unit 1: Planning and preparing for recruitment and selection",
                        topics: ["Planning and preparing for recruitment and selection", "Sources of relevant and complete information", "Job specifications", "Job profile", "Selection procedures", "Online screening and short listing", "Ability and aptitude tests", "Deciding which selection methods to use", "Defining your organisational requirements", "Confirming the selection procedure", "Resources and methods needed for recruitment and selection", "Professional associations and networking", "Selection criteria and control procedures", "Recruitment and selection plan", "Elements of a recruitment and selection plan"]
                    },
                    {
                        title: "Unit 2: Recruiting applicants",
                        topics: ["Recruiting applicants", "Recruitment advertising", "Initial screening process", "Implementation of corrective action", "Preparing a list of potential candidates", "Applicant database", "Dealing with unplanned events", "Unplanned events during the recruitment process"]
                    },
                    {
                        title: "Unit 3: Selecting staff",
                        topics: ["Selecting staff", "Verification methods", "Interview process", "Shortlisting to reflect results of candidate assessment", "Giving feedback", "Documenting records"]
                    }
                ]
            },
            {
                title: "Promoting a Learning Culture",
                description: "In this course, you will discover how to start evaluating the learning culture of an organisation. Doing this will help you pinpoint what kind of learning culture you currently have, identify gaps and ascertain your organisation's readiness for change.",
                level: "Advanced",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Status of a learning culture within an organisation",
                        topics: ["Status of a learning culture within an organisation", "Elements of a learning culture", "Gathering information (Other types of observational research, Questionnaires)", "Analysis of information", "Quantitative and qualitative indicators", "Possible explanations for current status", "Potential contribution of learning and development to the attainment of organisational and individual goals"]
                    },
                    {
                        title: "Unit 2: Develop strategies for promotion of a learning culture",
                        topics: ["Strategies for promotion of a learning culture (Special projects and assignments, Manager as educator)", "Organisational learning strategies", "Relevance of strategies", "Costs associated with promotion activities (Training and development evaluation, cost benefit analysis)", "Stakeholder involvement"]
                    },
                    {
                        title: "Unit 3: Implement strategies to promote a learning culture",
                        topics: ["Strategies to promote a learning culture", "Benefits of learning and development", "Aligning promotion of learning with current skills profiles", "Sustaining promotion activities", "Evaluating the impact of promotional strategies"]
                    }
                ]
            },
            {
                title: "Mathematical Analysis",
                description: "The application of mathematical analysis to financial information is a process that starts with data collection. The first section of this course deals with the appropriate data collection method, collecting financial and demographic information and ultimately, recording this data.",
                level: "Advanced",
                duration: "20 hours",
                units: [
                    {
                        title: "Unit 1: Collecting and organising data using mathematical techniques",
                        topics: ["Collecting and organising data using mathematical techniques", "Secondary data: Collection methods", "Questionnaires", "Collecting financial and demographic information", "Collecting demographic information"]
                    },
                    {
                        title: "Unit 2: Calculating and representing data",
                        topics: ["Calculating and representing data", "Types of graphs", "Measures of central tendency and standard deviations", "Calculating lines of best fit"]
                    },
                    {
                        title: "Unit 3: Mathematical analysis to indicate economic relationships",
                        topics: ["Mathematical analysis to indicate economic relationships"]
                    }
                ]
            },
            {
                title: "Brand Mix Elements",
                description: "Branding is one of the most important aspects of any business, be it large or small, retail or business-to-business (B2B). An effective brand strategy gives you a major edge in increasingly competitive markets. What exactly does 'branding' mean? How does it affect a business like yours?",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Factors influencing branding",
                        topics: ["Factors influencing branding", "Terminology used in the brand mix", "Elements of the brand mix", "Purpose of branding goods"]
                    },
                    {
                        title: "Unit 2: Brand familiarity",
                        topics: ["Brand familiarity", "Characteristics of a good brand name"]
                    }
                ]
            }
        ]
    },
    "soft-skills": {
        title: "Soft Skills Courses",
        description: "Enhance your professional effectiveness with courses on communication, time management, and personal development.",
        courses: [
            {
                title: "Time Management",
                description: "Time management is the process of planning and controlling how much time you spend on specific activities. Good time management enables you to complete more in a shorter period, lowers stress and leads to career success.",
                level: "Basic",
                duration: "12 hours",
                units: [
                    {
                        title: "Unit 1: Time thieves and control factors",
                        topics: ["Time thief: Communication", "Time thief: Decision-making", "Time thief: Planning", "Time thief: People", "Time thief: Delegation", "Elements we can/cannot control"]
                    },
                    {
                        title: "Unit 2: Circle of influence",
                        topics: ["Circle of concern", "Circle of influence"]
                    },
                    {
                        title: "Unit 3: Time management control factors",
                        topics: ["Time management control factors", "Changing your thinking about time"]
                    },
                    {
                        title: "Unit 4: Personal effectiveness",
                        topics: ["Power thoughts", "Self-awareness", "Values", "Life vision", "Goal setting"]
                    },
                    {
                        title: "Unit 5: Focus management",
                        topics: ["Power of focus", "Modern technology is changing the way our brain works", "How to stay focused and look after your brain", "My App Store"]
                    },
                    {
                        title: "Unit 6: Power skills",
                        topics: ["Power skills", "Proactive planning", "Beating procrastination", "Decision-making", "Assertiveness", "Delegation"]
                    }
                ]
            },
            {
                title: "Stress Management",
                description: "Stress management is about taking charge of your lifestyle, thoughts, emotions and the way you deal with problems. No matter how stressful your life seems to be, there are always steps you can take to relieve the burden and regain control.",
                level: "Intermediate",
                duration: "14 hours",
                units: [
                    {
                        title: "Unit 1: Awareness of real and imagined stress",
                        topics: ["Awareness of real and imagined stress"]
                    },
                    {
                        title: "Unit 2: Controlling stress",
                        topics: ["Controlling stress"]
                    },
                    {
                        title: "Unit 3: Categories of stress",
                        topics: ["Categories of stress"]
                    },
                    {
                        title: "Unit 4: Categories of emotional stress",
                        topics: ["Categories of emotional stress"]
                    },
                    {
                        title: "Unit 5: Power of perceptions",
                        topics: ["Power of perceptions"]
                    },
                    {
                        title: "Unit 6: Escape routes",
                        topics: ["Escape routes"]
                    },
                    {
                        title: "Unit 7: Managing mental wellness",
                        topics: ["Managing mental wellness"]
                    }
                ]
            },
            {
                title: "Negotiation Skills",
                description: "Negotiation skills are a desirable asset for all employees. Negotiation can be defined as a situation where two parties or groups of individuals disagree on a solution and then come together and reach an agreement that is acceptable to both.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Understanding negotiation",
                        topics: ["What is negotiation?", "Why we negotiate", "Opportunities to negotiate"]
                    },
                    {
                        title: "Unit 2: Overcoming negotiation barriers",
                        topics: ["Negotiation fears and barriers", "Negotiation attitudes"]
                    },
                    {
                        title: "Unit 3: Negotiation fundamentals",
                        topics: ["Negotiation – the give/get principle", "Variables/elements in negotiation", "Characteristics of a successful negotiator"]
                    },
                    {
                        title: "Unit 4: Negotiation process",
                        topics: ["Planning for negotiation", "Six steps in negotiation", "Power factor", "Critical mistakes to avoid while negotiating", "Summary", "Pillars 1 to 10"]
                    }
                ]
            },
            {
                title: "Customer Satisfaction",
                description: "Customer satisfaction is a measurement of how products and services supplied by a company meet or surpass customer expectations. With this online course, you will learn how to build customer loyalty, how to satisfy the nine essential needs of customers, and how your company's values, knowledge and attitude determines your behaviour.",
                level: "Basic",
                duration: "12 hours",
                units: [
                    {
                        title: "Unit 1: Building customer loyalty foundations",
                        topics: ["Introduction to building customer loyalty", "Moments of truth"]
                    },
                    {
                        title: "Unit 2: Understanding customer needs",
                        topics: ["Nine essential needs of customers"]
                    },
                    {
                        title: "Unit 3: Personal and organizational excellence",
                        topics: ["Company values", "Self-confidence and self-esteem"]
                    },
                    {
                        title: "Unit 4: Managing difficult situations",
                        topics: ["Dealing with irate customers (RELAX)", "Building customer loyalty: Conclusion"]
                    }
                ]
            },
            {
                title: "Personal Development",
                description: "During this personal development course, you will learn how to improve your personal objectives and be more successful. You will also learn the importance of building a brand, the three categories of the primacy effect and what impact it might have on your audience.",
                level: "Intermediate",
                duration: "16 hours",
                units: [
                    {
                        title: "Unit 1: Building me a brand",
                        topics: ["Building a brand", "Primacy effect", "General communication", "Brand differentiator", "Summary"]
                    },
                    {
                        title: "Unit 2: Effective leaders",
                        topics: ["Effective leaders perceive a need", "Effective leaders possess a gift", "Effective leaders pursue a purpose", "Effective leaders parade a passion", "Effective leaders persuade people"]
                    },
                    {
                        title: "Unit 3: Leadership qualities",
                        topics: ["Effective leadership", "Great purpose", "Character", "Accessible"]
                    },
                    {
                        title: "Unit 4: Mentoring",
                        topics: ["Winning with mentoring: Introduction", "Benefits for the protégé", "Benefits for the mentor", "Some assumptions that form a foundation for solid mentoring", "Some roles the mentor may need to play", "Some distinct stages in mentoring", "Some pitfalls of mentoring"]
                    }
                ]
            },
            {
                title: "Sales",
                description: "Sales training can help aspiring salespeople to develop and practise the skills they need to succeed and increase their confidence level. Proper sales training is important for a number of reasons. This course explores these reasons as well as assists you in developing successful selling skills and reaching sales targets.",
                level: "Basic",
                duration: "18 hours",
                units: [
                    {
                        title: "Unit 1: Introduction to sales",
                        topics: ["Introduction to sales: Part 1", "Introduction to sales: Part 2"]
                    },
                    {
                        title: "Unit 2: Qualifying prospects",
                        topics: ["Questioning your Q's", "Quality", "Quantify"]
                    },
                    {
                        title: "Unit 3: Sales fundamentals",
                        topics: ["Before, during and after", "Listening skills", "Relationship building", "Role of attitude"]
                    },
                    {
                        title: "Unit 4: Five step sales cycle",
                        topics: ["Five step sales cycle", "Five step cycle: Connect", "Five step cycle: Needs", "Five step cycle: Assist", "Five step cycle: Close", "Five step cycle: Follow-up"]
                    }
                ]
            }
        ]
    }
};

// Course Navigation Functionality
function initCourseNavigation() {
    console.log('Initializing course navigation...');
    
    const categoryCards = document.querySelectorAll('.category-card');
    const courseListing = document.getElementById('course-listing');
    const courseDetail = document.getElementById('course-detail');
    const categoriesView = document.getElementById('categories-view');
    const backToCategoriesBtn = document.getElementById('back-to-categories');
    const backToCoursesBtn = document.getElementById('back-to-courses');
    const categoryTitle = document.getElementById('category-title');
    const coursesGrid = document.getElementById('courses-grid');
    const courseDetailContent = document.getElementById('course-detail-content');
    
    console.log('Found category cards:', categoryCards.length);
    console.log('Course section exists:', !!document.getElementById('courses'));
    console.log('Categories view exists:', !!categoriesView);
    console.log('Course data loaded:', !!courseData);

    let currentCategory = null;

    // Category card click handlers
    categoryCards.forEach(card => {
        console.log('Adding click listener to card:', card);
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            console.log('Category clicked:', category);
            showCourseList(category);
        });
    });

    // Back to categories button
    backToCategoriesBtn.addEventListener('click', function() {
        showCategories();
    });

    // Back to courses button
    backToCoursesBtn.addEventListener('click', function() {
        showCourseList(currentCategory);
    });

    async function showCourseList(category) {
        currentCategory = category;
        const categoryData = courseData[category];
        await ensureCourseImageMapLoaded();
        
        // Hide other views
        categoriesView.style.display = 'none';
        courseDetail.style.display = 'none';
        
        // Update category title
        categoryTitle.textContent = categoryData.title;
        
        // Generate course cards
        coursesGrid.innerHTML = '';
        categoryData.courses.forEach((course, index) => {
            const courseCard = createCourseCard(course, category, index);
            coursesGrid.appendChild(courseCard);
        });
        
        // Show course listing
        courseListing.style.display = 'block';
        
        // Scroll to courses section
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    }

    function showCourseDetail(category, courseIndex) {
        const course = courseData[category].courses[courseIndex];
        
        // Hide other views
        categoriesView.style.display = 'none';
        courseListing.style.display = 'none';
        
        // Generate course detail content
        courseDetailContent.innerHTML = createCourseDetail(course);
        
        // Show course detail
        courseDetail.style.display = 'block';
        
        // Scroll to courses section
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    }

    function showCategories() {
        // Hide other views
        courseListing.style.display = 'none';
        courseDetail.style.display = 'none';
        
        // Show categories
        categoriesView.style.display = 'block';
        
        // Scroll to courses section
        document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
    }

    function createCourseCard(course, category, index) {
        const card = document.createElement('div');
        card.className = 'course-card';
        card.addEventListener('click', () => showCourseDetail(category, index));

        const levelColor = getLevelColor(course.level);
        const imgSrc = getCourseImageSrc(course.title);

        card.innerHTML = `
            <div class="course-banner"><img src="${imgSrc}" alt="${course.title}"></div>
            <div class="course-info">
                <h4>${course.title}</h4>
                <p>${course.description}</p>
                <div class="course-meta">
                    <span class="course-duration">${course.duration}</span>
                    <span class="course-level" style="background-color: ${levelColor}">${course.level}</span>
                </div>
            </div>
        `;

        return card;
    }

    function createCourseDetail(course) {
        const imgSrc = getCourseImageSrc(course.title);

        return `
            <div class="course-detail-banner"><img src="${imgSrc}" alt="${course.title}"></div>
            <h1>${course.title}</h1>
            <div class="course-description">${course.description}</div>
            <div class="course-meta">
                <span class="course-duration">Duration: ${course.duration}</span>
                <span class="course-level" style="background-color: ${getLevelColor(course.level)}; color: white; margin-left: 1rem;">${course.level}</span>
            </div>
            <div class="course-outline">
                <h3>Course Outline</h3>
                ${course.units.map((unit, index) => {
                    // Handle both old format (string) and new format (object)
                    if (typeof unit === 'string') {
                        return `
                            <div class="unit">
                                <div class="unit-header">
                                    <h4>${unit}</h4>
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="unit">
                                <div class="unit-header" onclick="toggleUnit(this)">
                                    <h4>${unit.title}</h4>
                                    <span class="unit-toggle">+</span>
                                </div>
                                <div class="unit-content">
                                    <ul class="unit-topics">
                                        ${unit.topics.map(topic => `<li>${topic}</li>`).join('')}
                                    </ul>
                                </div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        `;
    }

    function getLevelColor(level) {
        switch(level) {
            case 'Basic': return '#10b981';
            case 'Intermediate': return '#f59e0b';
            case 'Advanced': return '#ef4444';
            default: return '#6b7280';
        }
    }

    function getCourseIcon(category) {
        switch(category) {
            case 'computer': return '💻';
            case 'leadership': return '👥';
            case 'soft-skills': return '🎯';
            default: return '📚';
        }
    }
}

// Load Course Category for Individual Pages
async function loadCourseCategory(category) {
    const gridId = category + '-courses-grid';
    const grid = document.getElementById(gridId);
    
    if (!grid || !courseData[category]) {
        console.log('Grid or category data not found:', gridId, !!courseData[category]);
        return;
    }
    
    await ensureCourseImageMapLoaded();
    const categoryData = courseData[category];
    grid.innerHTML = '';
    
    categoryData.courses.forEach((course, index) => {
        const courseCard = createCourseCardStandalone(course, category, index);
        grid.appendChild(courseCard);
    });
}

function createCourseCardStandalone(course, category, index) {
    const card = document.createElement('div');
    card.className = 'course-card';
    
    const levelColor = getLevelColor(course.level);
    const imgSrc = getCourseImageSrc(course.title);
    
    // Create URL slug for course page
    const courseSlug = course.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    // Link to individual course page
    card.addEventListener('click', () => {
        window.location.href = `individual/${category}-${courseSlug}.html`;
    });
    
    card.innerHTML = `
        <div class="course-banner"><img src="${imgSrc}" alt="${course.title}"></div>
        <div class="course-info">
            <h4>${course.title}</h4>
            <p>${course.description}</p>
            <div class="course-meta">
                <span class="course-duration">${course.duration}</span>
                <span class="course-level" style="background-color: ${levelColor}">${course.level}</span>
            </div>
        </div>
    `;
    
    return card;
}

// Standalone helper functions for multi-page use
function getLevelColor(level) {
    switch(level) {
        case 'Basic': return '#10b981';
        case 'Intermediate': return '#f59e0b';
        case 'Advanced': return '#ef4444';
        default: return '#6b7280';
    }
}

function getCourseIcon(category) {
    switch(category) {
        case 'computer': return '💻';
        case 'leadership': return '👥';
        case 'soft-skills': return '🎯';
        default: return '📚';
    }
}

// Unit Toggle Functionality
function toggleUnit(unitHeader) {
    const unit = unitHeader.parentElement;
    const content = unit.querySelector('.unit-content');
    const toggle = unitHeader.querySelector('.unit-toggle');
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        toggle.classList.remove('expanded');
        toggle.textContent = '+';
    } else {
        content.classList.add('expanded');
        toggle.classList.add('expanded');
        toggle.textContent = '−';
    }
}

// Lightbox functionality
function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = lightbox?.querySelector('.lightbox-image');
    const lightboxTitle = lightbox?.querySelector('.lightbox-title');
    const lightboxDescription = lightbox?.querySelector('.lightbox-description');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    
    // If lightbox elements don't exist, return early
    if (!lightbox || !lightboxImage || !lightboxTitle || !lightboxDescription || !lightboxClose) {
        return;
    }
    
    // Find all images with lightbox data attribute
    const lightboxImages = document.querySelectorAll('img[data-lightbox="true"]');
    
    // Add click event listeners to all lightbox images
    lightboxImages.forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(this);
        });
        
        // Add keyboard support
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(this);
            }
        });
        
        // Make images focusable
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', 'Click to view full size image');
    });
    
    function openLightbox(imgElement) {
        const src = imgElement.getAttribute('src');
        const title = imgElement.getAttribute('data-title') || imgElement.getAttribute('alt') || 'Image';
        const description = imgElement.getAttribute('data-description') || '';
        
        lightboxImage.src = src;
        lightboxImage.alt = title;
        lightboxTitle.textContent = title;
        lightboxDescription.textContent = description;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        lightboxClose.focus();
        
        // Trap focus within lightbox
        trapFocus(lightbox);
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // Return focus to the image that opened the lightbox
        const activeImage = document.querySelector('img[data-lightbox="true"]:focus');
        if (activeImage) {
            activeImage.focus();
        }
    }
    
    // Close lightbox when clicking close button
    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close lightbox when clicking background
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
    
    // Prevent closing when clicking on lightbox content
    const lightboxContent = lightbox.querySelector('.lightbox-content');
    if (lightboxContent) {
        lightboxContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Focus trap function
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }
}

// Initialize lightbox when DOM is loaded
document.addEventListener('DOMContentLoaded', initLightbox);

// Console welcome message
console.log('%c🚀 TAP - Technical Assessment Portal', 'font-size: 16px; font-weight: bold; color: #2563eb;');
console.log('%c Built with modern web technologies', 'color: #6b7280;');
