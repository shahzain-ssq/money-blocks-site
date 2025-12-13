// Mobile navigation toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Smooth scrolling for anchor links
const anchorLinks = document.querySelectorAll('a[href^="#"]');
anchorLinks.forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href');
    if (targetId && targetId.startsWith('#')) {
      const target = document.querySelector(targetId);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        nav?.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
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
