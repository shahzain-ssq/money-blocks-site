// Normalize /index.html#hash to /#hash without reload
const { pathname, hash } = window.location;
if (pathname.endsWith('/index.html')) {
  const cleanPath = pathname.replace(/index\.html$/, '');
  history.replaceState({}, '', `${cleanPath}${hash}`);
}

// Mobile navigation toggle with single overlay
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const navBackdrop = document.querySelector('.nav-backdrop');
const navLinks = document.querySelectorAll('.nav-links a');

function setNavState(isOpen) {
  if (!nav || !navToggle) return;
  nav.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.classList.toggle('no-scroll', isOpen);
}

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = !nav.classList.contains('open');
    setNavState(isOpen);
  });

  navBackdrop?.addEventListener('click', () => setNavState(false));

  navLinks.forEach(link => {
    link.addEventListener('click', () => setNavState(false));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setNavState(false);
  });
}
// Regression checklist:
// Open menu once → one overlay
// Close → gone
// Reopen → still one overlay
// Click a nav link → menu closes and anchor scrolls correctly

// Smooth scrolling for anchor links
const anchorLinks = document.querySelectorAll('a[href^="#"], a[href*="/#"]');
anchorLinks.forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.hash || link.getAttribute('href');
    const normalizedId = targetId?.includes('#') ? targetId.substring(targetId.indexOf('#')) : null;
    if (normalizedId && normalizedId.startsWith('#')) {
      const target = document.querySelector(normalizedId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setNavState(false);
      }
    }
  });
});

// FAQ accordion
const accordionItems = document.querySelectorAll('.accordion-item');
accordionItems.forEach(item => {
  item.addEventListener('click', () => {
    const expanded = item.getAttribute('aria-expanded') === 'true';
    accordionItems.forEach(other => other.setAttribute('aria-expanded', 'false'));
    item.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
});

// Fake live price ticker for hero dashboard
const positions = document.querySelectorAll('.position');
function randomDelta() {
  return (Math.random() * 1.2 - 0.6).toFixed(2); // range -0.6% to +0.6%
}

function tickPrices() {
  positions.forEach(item => {
    const priceEl = item.querySelector('.price');
    const deltaEl = item.querySelector('.delta');
    if (!priceEl || !deltaEl) return;
    const current = parseFloat(priceEl.textContent || '0');
    const delta = parseFloat(randomDelta());
    const nextPrice = (current * (1 + delta / 100)).toFixed(2);
    priceEl.textContent = nextPrice;
    const isNegative = delta < 0;
    deltaEl.textContent = `${isNegative ? '' : '+'}${delta}%`;
    deltaEl.classList.toggle('negative', isNegative);
  });
}
setInterval(tickPrices, 2000);

// Reveal on scroll
const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealItems.forEach(el => observer.observe(el));
} else {
  revealItems.forEach(el => el.classList.add('visible'));
}

// Dynamic year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
