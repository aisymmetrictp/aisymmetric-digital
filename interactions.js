/* ============================================
   AISymmetric Digital — Interactions
   Scroll animations, nav behavior, counters
   ============================================ */

(function () {
  'use strict';

  // --- Scroll Reveal (data-aos) ---
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.querySelectorAll('[data-aos]')) : [];
          const index = siblings.indexOf(entry.target);
          const delay = index >= 0 ? index * 80 : 0;

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el));

  // --- Navigation scroll behavior ---
  const nav = document.getElementById('nav');
  if (nav) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > 80) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // --- Mobile menu toggle ---
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        toggle.classList.remove('active');
      });
    });
  }

  // --- Counter animation ---
  const counters = document.querySelectorAll('.metric-value[data-count]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const duration = 1500;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased);
            if (progress < 1) {
              requestAnimationFrame(update);
            }
          }

          requestAnimationFrame(update);
          counterObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => counterObserver.observe(c));

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Nav scroll style for dark hero ---
  // On homepage, nav starts transparent over dark hero
  function updateNavStyle() {
    if (!nav) return;
    const scrolled = window.pageYOffset > 80;
    if (scrolled) {
      nav.style.background = 'rgba(255, 255, 255, 0.95)';
      nav.style.backdropFilter = 'blur(20px)';
      nav.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
      nav.querySelectorAll('.nav-links a:not(.nav-cta)').forEach((a) => {
        a.style.color = '';
      });
      const logoSpans = nav.querySelectorAll('.nav-logo span');
      logoSpans.forEach((s) => (s.style.color = ''));
    } else {
      const hero = document.getElementById('hero');
      if (hero) {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.borderBottom = 'none';
        nav.querySelectorAll('.nav-links a:not(.nav-cta)').forEach((a) => {
          a.style.color = 'rgba(255,255,255,0.7)';
        });
        const logoSpans = nav.querySelectorAll('.nav-logo > span');
        logoSpans.forEach((s) => (s.style.color = '#fff'));
      }
    }
  }

  window.addEventListener('scroll', updateNavStyle, { passive: true });
  updateNavStyle();

})();
