// Normalize .html routes to clean paths without reload
const { pathname } = window.location;
const cleanRouteMap = {
  '/index.html': '/',
  '/privacy.html': '/privacy',
  '/terms.html': '/terms',
};
if (cleanRouteMap[pathname]) {
  history.replaceState({}, '', cleanRouteMap[pathname]);
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
  if (navBackdrop) {
    navBackdrop.classList.toggle('visible', isOpen);
    navBackdrop.setAttribute('aria-hidden', String(!isOpen));
  }
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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLanding = document.body.classList.contains('home');
const sectionRoutes = [
  { id: 'hero', path: '/' },
  { id: 'trusted-by', path: '/trusted-by' },
  { id: 'product', path: '/product' },
  { id: 'how', path: '/how' },
  { id: 'institutions', path: '/institutions' },
  { id: 'security', path: '/security' },
  { id: 'faq', path: '/faq' },
  { id: 'contact', path: '/contact' },
];
const routePaths = new Set(sectionRoutes.map(route => route.path));
const navLinkEls = document.querySelectorAll('.nav-links a');
let navigationInProgress = false;
let navigationTimeout;
let isProgrammaticScroll = false;
let userScrolled = false;

function updateActiveNav(path) {
  navLinkEls.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

function scrollToSection(sectionId, behavior = 'smooth') {
  const target = document.getElementById(sectionId);
  if (!target) return;
  target.scrollIntoView({ behavior, block: 'start' });
}

if (isLanding) {
  const routeLookup = sectionRoutes.reduce((acc, route) => {
    acc[route.path] = route.id;
    return acc;
  }, {});

  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || !routePaths.has(href)) return;
    link.addEventListener('click', event => {
      const sectionId = routeLookup[href];
      if (!sectionId) return;
      event.preventDefault();
      navigationInProgress = true;
      isProgrammaticScroll = true;
      userScrolled = false;
      window.clearTimeout(navigationTimeout);
      history.pushState({ sectionId }, '', href);
      scrollToSection(sectionId, prefersReducedMotion ? 'auto' : 'smooth');
      setNavState(false);
      updateActiveNav(href);
      const markUserScrolled = () => {
        userScrolled = true;
        navigationInProgress = false;
        isProgrammaticScroll = false;
        window.clearTimeout(navigationTimeout);
      };
      const clearNavigation = () => {
        if (isProgrammaticScroll && !userScrolled) {
          navigationInProgress = false;
        }
        isProgrammaticScroll = false;
        userScrolled = false;
      };
      window.addEventListener('wheel', markUserScrolled, { once: true, passive: true });
      window.addEventListener('touchstart', markUserScrolled, { once: true, passive: true });
      window.addEventListener('keydown', markUserScrolled, { once: true });
      if ('onscrollend' in document) {
        document.addEventListener('scrollend', clearNavigation, { once: true });
      } else {
        navigationTimeout = window.setTimeout(clearNavigation, 500);
      }
    });
  });

  const initialSection = routeLookup[window.location.pathname];
  if (initialSection && initialSection !== 'hero') {
    requestAnimationFrame(() => {
      scrollToSection(initialSection, 'auto');
      updateActiveNav(window.location.pathname);
    });
  }

  window.addEventListener('popstate', () => {
    const sectionId = history.state?.sectionId || routeLookup[window.location.pathname];
    if (sectionId && document.getElementById(sectionId)) {
      scrollToSection(sectionId, prefersReducedMotion ? 'auto' : 'smooth');
      updateActiveNav(window.location.pathname);
    }
  });

  if ('IntersectionObserver' in window) {
    const sections = sectionRoutes
      .map(route => document.getElementById(route.id))
      .filter(Boolean);
    const sectionObserver = new IntersectionObserver(entries => {
      if (navigationInProgress) return;
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const match = sectionRoutes.find(route => route.id === visible.target.id);
      if (!match || match.path === window.location.pathname) return;
      history.replaceState({}, '', match.path);
      updateActiveNav(match.path);
    }, { threshold: [0.15, 0.45, 0.6, 0.8] });

    sections.forEach(section => sectionObserver.observe(section));
  }
}

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
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
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

// Animated counters
const counterEls = document.querySelectorAll('[data-count]');
function formatCount(value) {
  return Number(value).toLocaleString();
}

function animateCount(el) {
  const target = parseInt(el.dataset.count || '0', 10);
  const suffix = el.dataset.suffix || '';
  if (prefersReducedMotion) {
    el.textContent = `${formatCount(target)}${suffix}`;
    return;
  }
  const duration = 1200;
  const start = performance.now();
  const step = now => {
    const progress = Math.min((now - start) / duration, 1);
    const current = Math.floor(target * progress);
    el.textContent = `${formatCount(current)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

if (counterEls.length && 'IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counterEls.forEach(el => counterObserver.observe(el));
} else {
  counterEls.forEach(el => animateCount(el));
}

// Manager panel interactions
const managerPanel = document.querySelector('.manager-panel');
if (managerPanel) {
  const toast = managerPanel.querySelector('.panel-toast');
  const rangeButtons = managerPanel.querySelectorAll('[data-range]');
  const sparkline = managerPanel.querySelector('.sparkline-line');
  const sparkFill = managerPanel.querySelector('.sparkline-fill');
  const metrics = {
    seats: managerPanel.querySelector('[data-metric="seats"]'),
    risk: managerPanel.querySelector('[data-metric="risk"]'),
    queue: managerPanel.querySelector('[data-metric="queue"]'),
  };
  const chartData = {
    '7d': {
      points: '0,70 40,62 80,66 120,48 160,44 200,35 240,42',
      fill: '0,90 0,70 40,62 80,66 120,48 160,44 200,35 240,42 240,90',
      metrics: { seats: '142', risk: '25%', queue: '18' },
    },
    '30d': {
      points: '0,78 40,58 80,60 120,40 160,46 200,38 240,30',
      fill: '0,90 0,78 40,58 80,60 120,40 160,46 200,38 240,30 240,90',
      metrics: { seats: '151', risk: '28%', queue: '24' },
    },
    '90d': {
      points: '0,82 40,70 80,64 120,52 160,50 200,36 240,28',
      fill: '0,90 0,82 40,70 80,64 120,52 160,50 200,36 240,28 240,90',
      metrics: { seats: '168', risk: '22%', queue: '11' },
    },
  };
  let toastTimeout;

  const showToast = message => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => toast.classList.remove('show'), 2200);
  };

  managerPanel.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const isOn = toggle.classList.toggle('is-on');
      toggle.setAttribute('aria-pressed', String(isOn));
      const label = toggle.querySelector('.toggle-label')?.textContent?.trim() || 'Setting';
      showToast(`${label} ${isOn ? 'enabled' : 'disabled'}.`);
      
      // Visual feedback for Freeze Trades
      if (toggle.dataset.toggle === 'freeze') {
        managerPanel.classList.toggle('frozen', isOn);
      }
      
      if (toggle.dataset.toggle === 'risk' && metrics.risk) {
        metrics.risk.textContent = isOn ? '25%' : '18%';
      }
    });
  });

  rangeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const range = button.dataset.range;
      rangeButtons.forEach(btn => btn.classList.toggle('active', btn === button));
      const data = chartData[range];
      if (data && sparkline && sparkFill) {
        sparkline.setAttribute('points', data.points);
        sparkFill.setAttribute('points', data.fill);
        Object.entries(data.metrics).forEach(([key, value]) => {
          if (metrics[key]) metrics[key].textContent = value;
        });
      }
      showToast(`Volume updated to ${button.textContent}.`);
    });
  });
}

// Dynamic year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// 3D Tilt Effect
document.addEventListener('mousemove', (e) => {
  const tiltElements = document.querySelectorAll('.hero-visual .dashboard, .manager-panel');
  
  tiltElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is near the element (within 100px) to trigger effect
    if (
      e.clientX > rect.left - 50 && 
      e.clientX < rect.right + 50 &&
      e.clientY > rect.top - 50 &&
      e.clientY < rect.bottom + 50
    ) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -4; // Max rotation deg
      const rotateY = ((x - centerX) / centerX) * 4;
      
      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    } else {
      // Reset if far away
      el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  });
});
