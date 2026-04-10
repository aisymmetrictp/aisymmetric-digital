/**
 * AISymmetric Digital - Showcase Site Generator
 * Generates 52 unique single-file HTML websites from showcase-data.js
 * Each site uses one of 6 design archetypes for genuine visual variety.
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Read & parse showcase-data.js (it assigns to window.SHOWCASE_DATA)
// ---------------------------------------------------------------------------
const dataPath = path.join(__dirname, 'showcase-data.js');
const raw = fs.readFileSync(dataPath, 'utf-8');

// Create a fake window, execute the file, pull the data out
const window = {};
new Function('window', raw)(window);
const SHOWCASE_DATA = window.SHOWCASE_DATA;

const slugs = Object.keys(SHOWCASE_DATA);
console.log(`Found ${slugs.length} showcase entries.`);

// ---------------------------------------------------------------------------
// 2. Archetype assignment
// ---------------------------------------------------------------------------
const categoryArchetype = {
  tech: 'luminous',
  professional: 'editorial',
  health: 'organic',
  food: 'organic',
  retail: 'kinetic',
  creative: 'artisan',
  education: 'artisan',
  service: null, // distributed below
};

// Service businesses rotate between kinetic and precision for variety
let serviceToggle = 0;
function getArchetype(category, slug) {
  if (category === 'service') {
    serviceToggle++;
    return serviceToggle % 2 === 0 ? 'precision' : 'kinetic';
  }
  return categoryArchetype[category] || 'kinetic';
}

// ---------------------------------------------------------------------------
// 3. Shared helpers
// ---------------------------------------------------------------------------
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function sharedMeta(data, slug, fontUrl) {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(data.name)} | ${escapeHtml(data.industry)} Website</title>
    <meta name="description" content="${escapeHtml(data.description)}">
    <meta property="og:title" content="${escapeHtml(data.name)} - ${escapeHtml(data.tagline)}">
    <meta property="og:description" content="${escapeHtml(data.description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://aisymmetricdigital.com/portfolio/${slug}/">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${fontUrl}" rel="stylesheet">`;
}

function sharedJs() {
  return `
    <script>
    (function(){
      // --- Scroll reveal ---
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

      // --- Navbar scroll ---
      const nav = document.querySelector('.navbar');
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 60) { nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
        lastScroll = y;
      }, { passive: true });

      // --- Mobile menu ---
      const toggle = document.querySelector('.nav-toggle');
      const menu = document.querySelector('.nav-links');
      if (toggle && menu) {
        toggle.addEventListener('click', () => {
          menu.classList.toggle('open');
          toggle.classList.toggle('active');
        });
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
          menu.classList.remove('open');
          toggle.classList.remove('active');
        }));
      }

      // --- Smooth scroll ---
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault();
          const target = document.querySelector(a.getAttribute('href'));
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });

      // --- Counter animation ---
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-value').forEach(el => {
              const text = el.getAttribute('data-value');
              const match = text.match(/([\\d,.]+)/);
              if (!match) { el.textContent = text; return; }
              const numStr = match[1].replace(/,/g, '');
              const target = parseFloat(numStr);
              const prefix = text.substring(0, text.indexOf(match[1]));
              const suffix = text.substring(text.indexOf(match[1]) + match[1].length);
              const hasDecimal = numStr.includes('.');
              const duration = 1600;
              const start = performance.now();
              function tick(now) {
                const p = Math.min((now - start) / duration, 1);
                const ease = 1 - Math.pow(1 - p, 4);
                let current = target * ease;
                let display;
                if (hasDecimal) { display = current.toFixed(numStr.split('.')[1].length); }
                else { display = Math.floor(current).toLocaleString(); }
                el.textContent = prefix + display + suffix;
                if (p < 1) requestAnimationFrame(tick);
              }
              requestAnimationFrame(tick);
            });
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      document.querySelectorAll('.stats-row, .stats-grid').forEach(el => counterObserver.observe(el));
    })();
    </script>`;
}

function navbar(data) {
  return `
  <nav class="navbar">
    <div class="nav-inner">
      <a href="#" class="nav-logo">${escapeHtml(data.name)}</a>
      <ul class="nav-links">
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#features">Why Us</a></li>
        <li><a href="#testimonial">Reviews</a></li>
        <li><a href="#cta" class="nav-cta">${escapeHtml(data.sections.hero.cta)}</a></li>
      </ul>
      <button class="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </nav>`;
}

function footer(data) {
  return `
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-brand">${escapeHtml(data.name)}</p>
      <p class="footer-copy">&copy; ${new Date().getFullYear()} ${escapeHtml(data.name)}. All rights reserved.</p>
      <p class="footer-credit">Designed &amp; built by <a href="https://aisymmetricdigital.com"><strong>AISymmetric Digital</strong></a> | <a href="https://aisymmetricdigital.com/portfolio">View Portfolio</a></p>
    </div>
  </footer>`;
}

// ---------------------------------------------------------------------------
// Shared base CSS (reset, navbar, footer, reveal, responsive)
// ---------------------------------------------------------------------------
function sharedCss(data, bodyFont) {
  return `
    :root {
      --accent: ${data.accentPrimary};
      --accent2: ${data.accentSecondary};
      --dark: ${data.darkBg};
      --ease: cubic-bezier(0.16, 1, 0.3, 1);
      --radius: 14px;
      --radius-sm: 8px;
    }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
    body { font-family: '${bodyFont}', -apple-system, BlinkMacSystemFont, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; overflow-x: hidden; }
    img { max-width: 100%; display: block; }
    a { color: inherit; text-decoration: none; }

    /* --- Navbar --- */
    .navbar { position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; padding: 18px 0; transition: all 0.4s var(--ease); }
    .navbar.scrolled { background: rgba(255,255,255,0.82); backdrop-filter: blur(18px) saturate(1.6); -webkit-backdrop-filter: blur(18px) saturate(1.6); box-shadow: 0 1px 24px rgba(0,0,0,0.08); padding: 10px 0; }
    .nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; }
    .nav-logo { font-weight: 700; font-size: 1.2rem; color: #fff; transition: color 0.3s var(--ease); }
    .navbar.scrolled .nav-logo { color: var(--dark); }
    .nav-links { display: flex; align-items: center; gap: 32px; list-style: none; }
    .nav-links a { font-size: 0.9rem; font-weight: 500; color: rgba(255,255,255,0.8); transition: color 0.3s var(--ease); }
    .nav-links a:hover { color: #fff; }
    .navbar.scrolled .nav-links a { color: #555; }
    .navbar.scrolled .nav-links a:hover { color: var(--dark); }
    .nav-cta { background: var(--accent); color: #fff !important; padding: 10px 22px; border-radius: 100px; font-weight: 600 !important; transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease); }
    .nav-cta:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
    .navbar.scrolled .nav-cta { color: #fff !important; }
    .nav-toggle { display: none; background: none; border: none; cursor: pointer; width: 28px; height: 20px; position: relative; }
    .nav-toggle span { display: block; width: 100%; height: 2px; background: #fff; position: absolute; left: 0; transition: all 0.3s var(--ease); }
    .navbar.scrolled .nav-toggle span { background: var(--dark); }
    .nav-toggle span:nth-child(1) { top: 0; }
    .nav-toggle span:nth-child(2) { top: 9px; }
    .nav-toggle span:nth-child(3) { top: 18px; }
    .nav-toggle.active span:nth-child(1) { transform: rotate(45deg); top: 9px; }
    .nav-toggle.active span:nth-child(2) { opacity: 0; }
    .nav-toggle.active span:nth-child(3) { transform: rotate(-45deg); top: 9px; }

    /* --- Reveal --- */
    .reveal { opacity: 0; transform: translateY(36px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
    .reveal.revealed { opacity: 1; transform: translateY(0); }
    .reveal-d1 { transition-delay: 0.1s; }
    .reveal-d2 { transition-delay: 0.2s; }
    .reveal-d3 { transition-delay: 0.3s; }
    .reveal-d4 { transition-delay: 0.4s; }

    /* --- Footer --- */
    .site-footer { background: var(--dark); color: rgba(255,255,255,0.6); padding: 48px 32px; text-align: center; }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-brand { font-size: 1.25rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .footer-copy { font-size: 0.85rem; margin-bottom: 6px; }
    .footer-credit { font-size: 0.85rem; }
    .footer-credit a { color: var(--accent); font-weight: 600; }
    .footer-credit a:hover { text-decoration: underline; }

    /* --- Responsive --- */
    @media (max-width: 1024px) {
      .hero-content h1 { font-size: 2.8rem; }
    }
    @media (max-width: 768px) {
      .nav-links { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: var(--dark); flex-direction: column; justify-content: center; align-items: center; gap: 28px; }
      .nav-links.open { display: flex; }
      .nav-links a { color: rgba(255,255,255,0.8) !important; font-size: 1.2rem; }
      .nav-toggle { display: block; }
      .hero-content h1 { font-size: 2.2rem; }
      .services-grid, .features-grid { grid-template-columns: 1fr; }
      .hero-split { flex-direction: column; }
    }
    @media (max-width: 480px) {
      .hero-content h1 { font-size: 1.7rem; }
      .section-inner { padding: 0 18px; }
      .stats-row, .stats-grid { flex-direction: column; gap: 20px; }
    }`;
}

// ---------------------------------------------------------------------------
// 4. ARCHETYPE TEMPLATES
// ---------------------------------------------------------------------------

// ========================================
// ARCHETYPE 1: LUMINOUS (Stripe-like dark)
// ========================================
function luminousTemplate(data, slug) {
  const s = data.sections;
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${sharedMeta(data, slug, fontUrl)}
<style>
${sharedCss(data, 'Inter')}
h1, h2, h3 { font-family: 'Space Grotesk', sans-serif; }

/* --- LUMINOUS ARCHETYPE --- */
.hero {
  position: relative; min-height: 100vh; display: flex; align-items: center;
  background: #0a0a0a; overflow: hidden;
}
.hero-orb {
  position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.5;
  animation: orbFloat 14s ease-in-out infinite alternate;
}
.hero-orb-1 { width: 600px; height: 600px; background: var(--accent); top: -15%; right: -10%; animation-delay: 0s; }
.hero-orb-2 { width: 450px; height: 450px; background: var(--accent2); bottom: -20%; left: -8%; animation-delay: -5s; }
.hero-orb-3 { width: 300px; height: 300px; background: linear-gradient(135deg, var(--accent), var(--accent2)); top: 40%; left: 35%; animation-delay: -9s; }
@keyframes orbFloat {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -40px) scale(1.08); }
  100% { transform: translate(-20px, 20px) scale(0.95); }
}
.hero-content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 0 32px; width: 100%; }
.hero-content h1 {
  font-size: 4rem; font-weight: 800; color: #fff; line-height: 1.08;
  letter-spacing: -0.03em; margin-bottom: 20px; max-width: 700px;
}
.hero-content p { font-size: 1.2rem; color: rgba(255,255,255,0.6); max-width: 540px; margin-bottom: 36px; line-height: 1.7; }
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--accent);
  color: #fff; padding: 16px 36px; border-radius: 100px; font-weight: 600; font-size: 1rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.hero-cta:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
.hero-cta svg { width: 18px; height: 18px; transition: transform 0.3s var(--ease); }
.hero-cta:hover svg { transform: translateX(4px); }

/* Stats bar in hero */
.hero-stats {
  display: flex; gap: 48px; margin-top: 64px; padding-top: 32px;
  border-top: 1px solid rgba(255,255,255,0.1);
}
.hero-stat-val { font-size: 2rem; font-weight: 800; color: #fff; }
.hero-stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.4); margin-top: 4px; }

/* Glass cards with numbered indicators */
.services { padding: 120px 0; background: #fafafa; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 12px; }
.section-title { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 16px; letter-spacing: -0.02em; }
.section-subtitle { font-size: 1.05rem; color: #666; max-width: 560px; margin-bottom: 56px; line-height: 1.7; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.service-card {
  background: rgba(255,255,255,0.7); backdrop-filter: blur(12px);
  border: 1px solid rgba(0,0,0,0.06); border-radius: var(--radius); padding: 40px 32px;
  transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease), border-color 0.5s var(--ease);
}
.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
  border-color: var(--accent);
}
.service-num { font-size: 2.4rem; font-weight: 800; color: var(--accent); opacity: 0.35; margin-bottom: 16px; font-family: 'Space Grotesk', sans-serif; }
.service-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; color: var(--dark); }
.service-card p { font-size: 0.95rem; color: #555; line-height: 1.7; }

/* About */
.about { padding: 120px 0; background: #fff; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.about-text h2 { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 20px; letter-spacing: -0.02em; }
.about-text p { font-size: 1.05rem; color: #555; line-height: 1.8; }
.stats-grid {
  display: flex; flex-wrap: wrap; gap: 32px; background: var(--dark);
  border-radius: var(--radius); padding: 40px; justify-content: center;
}
.stat-item { text-align: center; flex: 1; min-width: 120px; }
.stat-value { font-size: 2.2rem; font-weight: 800; color: #fff; }
.stat-label { font-size: 0.82rem; color: rgba(255,255,255,0.5); margin-top: 4px; }

/* Features - icon pills */
.features { padding: 100px 0; background: #fafafa; }
.features-list { display: flex; flex-wrap: wrap; gap: 14px; max-width: 800px; }
.feature-pill {
  display: inline-flex; align-items: center; gap: 10px; padding: 12px 22px;
  background: #fff; border-radius: 100px; border: 1px solid #e0e0e0;
  transition: border-color 0.4s var(--ease), transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.feature-pill:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.feature-pill-check { width: 20px; height: 20px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.feature-pill-check svg { width: 12px; height: 12px; color: #fff; }
.feature-pill span { font-size: 0.9rem; font-weight: 500; color: #333; }

/* Testimonial - dark gradient card */
.testimonial { padding: 100px 0; background: #fff; }
.testimonial-card {
  max-width: 720px; margin: 0 auto; text-align: center;
  background: linear-gradient(135deg, var(--dark) 0%, color-mix(in srgb, var(--dark) 80%, var(--accent)) 100%);
  border-radius: var(--radius); padding: 56px 48px; color: #fff;
}
.testimonial-card blockquote { font-size: 1.3rem; font-weight: 400; line-height: 1.7; margin-bottom: 28px; font-style: italic; color: rgba(255,255,255,0.9); }
.testimonial-card .author { font-weight: 600; font-size: 1rem; }
.testimonial-card .role { font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-top: 4px; }

/* CTA */
.cta-section { padding: 120px 0; background: var(--dark); text-align: center; position: relative; overflow: hidden; }
.cta-section::before {
  content: ''; position: absolute; width: 500px; height: 500px;
  background: var(--accent); filter: blur(140px); opacity: 0.15;
  top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50%;
}
.cta-content { position: relative; z-index: 2; }
.cta-content h2 { font-size: 2.8rem; font-weight: 800; color: #fff; margin-bottom: 16px; letter-spacing: -0.02em; }
.cta-content p { font-size: 1.1rem; color: rgba(255,255,255,0.55); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px; background: var(--accent); color: #fff;
  padding: 18px 42px; border-radius: 100px; font-weight: 700; font-size: 1.05rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
</style>
</head>
<body>
${navbar(data)}

<section class="hero">
  <div class="hero-orb hero-orb-1"></div>
  <div class="hero-orb hero-orb-2"></div>
  <div class="hero-orb hero-orb-3"></div>
  <div class="hero-content">
    <h1 class="reveal">${escapeHtml(s.hero.headline)}</h1>
    <p class="reveal reveal-d1">${escapeHtml(s.hero.subtitle)}</p>
    <a href="#cta" class="hero-cta reveal reveal-d2">${escapeHtml(s.hero.cta)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <div class="hero-stats reveal reveal-d3">
      ${s.about.stats.map(st => `<div><div class="hero-stat-val stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="hero-stat-label">${escapeHtml(st.label)}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-label reveal">Capabilities</div>
    <h2 class="section-title reveal reveal-d1">Our Services</h2>
    <p class="section-subtitle reveal reveal-d2">${escapeHtml(data.description)}</p>
    <div class="services-grid">
      ${s.services.map((svc, i) => `<div class="service-card reveal reveal-d${i + 1}">
        <div class="service-num">0${i + 1}</div>
        <h3>${escapeHtml(svc.title)}</h3>
        <p>${escapeHtml(svc.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="testimonial" id="testimonial">
  <div class="section-inner">
    <div class="testimonial-card reveal">
      <blockquote>&ldquo;${escapeHtml(s.testimonial.quote)}&rdquo;</blockquote>
      <div class="author">${escapeHtml(s.testimonial.author)}</div>
      <div class="role">${escapeHtml(s.testimonial.role)}</div>
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-text reveal">
        <div class="section-label">About Us</div>
        <h2>${escapeHtml(s.about.title)}</h2>
        <p>${escapeHtml(s.about.description)}</p>
      </div>
      <div class="stats-grid reveal reveal-d2">
        ${s.about.stats.map(st => `<div class="stat-item"><div class="stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="stat-label">${escapeHtml(st.label)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-inner">
    <div class="section-label reveal">Why Choose Us</div>
    <h2 class="section-title reveal reveal-d1">What Sets Us Apart</h2>
    <div class="features-list">
      ${s.features.map((f, i) => `<div class="feature-pill reveal reveal-d${i + 1}">
        <div class="feature-pill-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
        <span>${escapeHtml(f)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="cta-section" id="cta">
  <div class="section-inner">
    <div class="cta-content">
      <h2 class="reveal">${escapeHtml(s.cta.headline)}</h2>
      <p class="reveal reveal-d1">${escapeHtml(s.cta.subtitle)}</p>
      <a href="#" class="cta-btn reveal reveal-d2">${escapeHtml(s.hero.cta)} <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    </div>
  </div>
</section>

${footer(data)}
${sharedJs()}
</body>
</html>`;
}

// ========================================
// ARCHETYPE 2: EDITORIAL (Apple-like split)
// ========================================
function editorialTemplate(data, slug) {
  const s = data.sections;
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${sharedMeta(data, slug, fontUrl)}
<style>
${sharedCss(data, 'Source Sans 3')}
h1, h2, h3 { font-family: 'Playfair Display', serif; }

/* --- EDITORIAL ARCHETYPE --- */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: var(--dark); overflow: hidden; position: relative;
}
.hero-split {
  display: flex; align-items: center; max-width: 1200px; margin: 0 auto;
  padding: 0 32px; width: 100%; gap: 64px;
}
.hero-left { flex: 1; }
.hero-left .hero-eyebrow {
  font-size: 0.8rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.15em; color: var(--accent2); margin-bottom: 20px;
}
.hero-left h1 {
  font-size: 3.8rem; font-weight: 800; color: #fff; line-height: 1.06;
  letter-spacing: -0.035em; margin-bottom: 24px;
}
.hero-left p { font-size: 1.15rem; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 40px; max-width: 460px; }
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px; background: transparent;
  color: #fff; padding: 16px 0; font-weight: 600; font-size: 1rem;
  border-bottom: 2px solid var(--accent2); transition: gap 0.4s var(--ease);
}
.hero-cta:hover { gap: 16px; }
.hero-cta svg { width: 18px; height: 18px; }

/* Abstract art block */
.hero-right { flex: 1; display: flex; justify-content: center; align-items: center; position: relative; min-height: 420px; }
.abstract-art { position: relative; width: 380px; height: 420px; }
.abstract-shape {
  position: absolute; border-radius: 4px;
}
.abstract-shape-1 {
  width: 240px; height: 300px; background: var(--accent2); top: 0; right: 0;
  animation: editFloat1 8s ease-in-out infinite alternate;
}
.abstract-shape-2 {
  width: 200px; height: 200px; background: var(--accent); top: 60px; left: 0; opacity: 0.85;
  animation: editFloat2 10s ease-in-out infinite alternate;
}
.abstract-shape-3 {
  width: 120px; height: 160px; border: 3px solid rgba(255,255,255,0.2); bottom: 0; right: 40px;
  animation: editFloat3 12s ease-in-out infinite alternate;
}
@keyframes editFloat1 { 0% { transform: translate(0,0) rotate(0deg); } 100% { transform: translate(-10px,15px) rotate(2deg); } }
@keyframes editFloat2 { 0% { transform: translate(0,0) rotate(0deg); } 100% { transform: translate(12px,-8px) rotate(-3deg); } }
@keyframes editFloat3 { 0% { transform: translate(0,0); } 100% { transform: translate(-8px,10px); } }

/* Services - stacked list layout */
.services { padding: 120px 0; background: #fff; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-label { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent2); margin-bottom: 12px; }
.section-title { font-size: 2.6rem; font-weight: 800; color: var(--dark); margin-bottom: 16px; letter-spacing: -0.025em; }
.section-subtitle { font-size: 1.05rem; color: #666; max-width: 540px; margin-bottom: 56px; line-height: 1.7; }
.services-stack { display: flex; flex-direction: column; gap: 0; max-width: 900px; }
.service-row {
  display: grid; grid-template-columns: 80px 1fr; gap: 32px; padding: 40px 0;
  border-top: 1px solid #e0e0e0;
  transition: background 0.4s var(--ease);
}
.service-row:last-child { border-bottom: 1px solid #e0e0e0; }
.service-row:hover { background: #faf9f7; }
.service-row-num { font-size: 2rem; font-weight: 300; color: var(--accent2); font-family: 'Playfair Display', serif; padding-top: 4px; }
.service-row-content h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 10px; color: var(--dark); }
.service-row-content p { font-size: 0.95rem; color: #666; line-height: 1.7; }

/* About */
.about { padding: 120px 0; background: #f8f7f5; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.about-text h2 { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 20px; letter-spacing: -0.02em; }
.about-text p { font-size: 1.05rem; color: #555; line-height: 1.8; }
.stats-row { display: flex; gap: 40px; margin-top: 40px; }
.stat-item { text-align: left; }
.stat-value { font-size: 2.4rem; font-weight: 800; color: var(--dark); }
.stat-label { font-size: 0.82rem; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }

/* Features */
.features { padding: 100px 0; background: #fff; }
.features-list { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 800px; }
.feature-item {
  display: flex; align-items: center; gap: 14px; padding: 18px 0;
  border-bottom: 1px solid #eee;
  transition: transform 0.4s var(--ease);
}
.feature-item:hover { transform: translateX(6px); }
.feature-check { color: var(--accent2); font-weight: 700; font-size: 1.1rem; }
.feature-item span { font-size: 0.95rem; font-weight: 500; color: #333; }

/* Testimonial - large italic with horizontal rules */
.testimonial { padding: 100px 0; background: #f8f7f5; }
.testimonial-inner { max-width: 680px; margin: 0 auto; text-align: center; }
.testimonial-rule { width: 80px; height: 1px; background: var(--accent2); margin: 0 auto 32px; }
.testimonial-inner blockquote {
  font-size: 1.7rem; font-weight: 400; line-height: 1.55; margin-bottom: 32px;
  color: var(--dark); font-style: italic; font-family: 'Playfair Display', serif;
}
.testimonial-rule-bottom { width: 80px; height: 1px; background: var(--accent2); margin: 0 auto 28px; }
.testimonial-inner .author { font-weight: 700; font-size: 0.95rem; color: var(--dark); }
.testimonial-inner .role { font-size: 0.85rem; color: #888; margin-top: 4px; }

/* CTA */
.cta-section { padding: 120px 0; background: var(--dark); text-align: center; }
.cta-content h2 { font-size: 2.8rem; font-weight: 800; color: #fff; margin-bottom: 16px; letter-spacing: -0.02em; }
.cta-content p { font-size: 1.1rem; color: rgba(255,255,255,0.5); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: var(--accent2); color: var(--dark); padding: 18px 42px;
  border-radius: 4px; font-weight: 700; font-size: 1.05rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
</style>
</head>
<body>
${navbar(data)}

<section class="hero">
  <div class="hero-split">
    <div class="hero-left">
      <div class="hero-eyebrow reveal">${escapeHtml(data.industry)}</div>
      <h1 class="reveal reveal-d1">${escapeHtml(s.hero.headline)}</h1>
      <p class="reveal reveal-d2">${escapeHtml(s.hero.subtitle)}</p>
      <a href="#cta" class="hero-cta reveal reveal-d3">${escapeHtml(s.hero.cta)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    </div>
    <div class="hero-right reveal reveal-d2">
      <div class="abstract-art">
        <div class="abstract-shape abstract-shape-1"></div>
        <div class="abstract-shape abstract-shape-2"></div>
        <div class="abstract-shape abstract-shape-3"></div>
      </div>
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-text reveal">
        <div class="section-label">Our Story</div>
        <h2>${escapeHtml(s.about.title)}</h2>
        <p>${escapeHtml(s.about.description)}</p>
      </div>
      <div class="reveal reveal-d2">
        <div class="stats-row">
          ${s.about.stats.map(st => `<div class="stat-item"><div class="stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="stat-label">${escapeHtml(st.label)}</div></div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-label reveal">Services</div>
    <h2 class="section-title reveal reveal-d1">What We Offer</h2>
    <p class="section-subtitle reveal reveal-d2">${escapeHtml(data.description)}</p>
    <div class="services-stack">
      ${s.services.map((svc, i) => `<div class="service-row reveal reveal-d${i + 1}">
        <div class="service-row-num">0${i + 1}</div>
        <div class="service-row-content">
          <h3>${escapeHtml(svc.title)}</h3>
          <p>${escapeHtml(svc.description)}</p>
        </div>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-inner">
    <div class="section-label reveal">Advantages</div>
    <h2 class="section-title reveal reveal-d1">Why Work With Us</h2>
    <div class="features-list">
      ${s.features.map((f, i) => `<div class="feature-item reveal reveal-d${i + 1}">
        <span class="feature-check">&mdash;</span>
        <span>${escapeHtml(f)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="testimonial" id="testimonial">
  <div class="section-inner">
    <div class="testimonial-inner reveal">
      <div class="testimonial-rule"></div>
      <blockquote>&ldquo;${escapeHtml(s.testimonial.quote)}&rdquo;</blockquote>
      <div class="testimonial-rule-bottom"></div>
      <div class="author">${escapeHtml(s.testimonial.author)}</div>
      <div class="role">${escapeHtml(s.testimonial.role)}</div>
    </div>
  </div>
</section>

<section class="cta-section" id="cta">
  <div class="section-inner">
    <div class="cta-content">
      <h2 class="reveal">${escapeHtml(s.cta.headline)}</h2>
      <p class="reveal reveal-d1">${escapeHtml(s.cta.subtitle)}</p>
      <a href="#" class="cta-btn reveal reveal-d2">${escapeHtml(s.hero.cta)}</a>
    </div>
  </div>
</section>

${footer(data)}
${sharedJs()}
</body>
</html>`;
}

// ========================================
// ARCHETYPE 3: KINETIC (Vercel-like bold)
// ========================================
function kineticTemplate(data, slug) {
  const s = data.sections;
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${sharedMeta(data, slug, fontUrl)}
<style>
${sharedCss(data, 'Inter')}
h1, h2, h3 { font-family: 'Sora', sans-serif; }

/* --- KINETIC ARCHETYPE --- */
.hero {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(145deg, #0a0a0a 0%, var(--dark) 100%);
  position: relative; overflow: hidden; text-align: center;
}
/* Geometric shapes */
.geo-shape {
  position: absolute; border: 2px solid rgba(255,255,255,0.06); opacity: 0.8;
}
.geo-1 {
  width: 300px; height: 300px; top: 10%; left: -5%;
  transform: rotate(45deg);
  animation: geoSpin1 20s linear infinite;
}
.geo-2 {
  width: 200px; height: 200px; bottom: 15%; right: 5%;
  border-radius: 50%;
  animation: geoFloat 12s ease-in-out infinite alternate;
}
.geo-3 {
  width: 0; height: 0; top: 20%; right: 15%;
  border: none; border-left: 80px solid transparent; border-right: 80px solid transparent;
  border-bottom: 140px solid rgba(255,255,255,0.03);
  animation: geoSpin2 25s linear infinite;
}
.geo-4 {
  width: 150px; height: 150px; bottom: 20%; left: 10%;
  border-color: var(--accent); opacity: 0.15;
  animation: geoFloat 15s ease-in-out infinite alternate-reverse;
}
@keyframes geoSpin1 { to { transform: rotate(405deg); } }
@keyframes geoSpin2 { to { transform: rotate(360deg); } }
@keyframes geoFloat { 0% { transform: translate(0, 0); } 100% { transform: translate(20px, -30px); } }

.hero-content { position: relative; z-index: 2; max-width: 900px; padding: 0 32px; }
.hero-content h1 {
  font-size: 4.5rem; font-weight: 900; color: #fff; line-height: 1.04;
  letter-spacing: -0.04em; margin-bottom: 24px;
}
.hero-content p { font-size: 1.15rem; color: rgba(255,255,255,0.5); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px;
  background: #fff; color: var(--dark); padding: 16px 38px; border-radius: 100px;
  font-weight: 700; font-size: 1rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.hero-cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 40px rgba(255,255,255,0.1); }
.hero-cta svg { width: 18px; height: 18px; }

/* Cards with thick gradient left border + bold number */
.services { padding: 120px 0; background: #fafafa; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 12px; }
.section-title { font-size: 2.6rem; font-weight: 900; color: var(--dark); margin-bottom: 16px; letter-spacing: -0.03em; }
.section-subtitle { font-size: 1.05rem; color: #666; max-width: 560px; margin-bottom: 56px; line-height: 1.7; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.service-card {
  background: #fff; border-radius: 0; padding: 40px 32px;
  border: 1px solid #eee; border-left: 5px solid transparent;
  border-image: linear-gradient(180deg, var(--accent), var(--accent2)) 1;
  border-image-slice: 1; position: relative; overflow: hidden;
  transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease);
}
.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.08);
}
.service-card-num { font-size: 2.8rem; font-weight: 900; color: var(--dark); opacity: 0.12; margin-bottom: 12px; font-family: 'Sora', sans-serif; }
.service-card h3 { font-size: 1.2rem; font-weight: 700; margin-bottom: 12px; color: var(--dark); }
.service-card p { font-size: 0.95rem; color: #555; line-height: 1.7; }

/* About */
.about { padding: 120px 0; background: #fff; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.about-text h2 { font-size: 2.4rem; font-weight: 900; color: var(--dark); margin-bottom: 20px; letter-spacing: -0.02em; }
.about-text p { font-size: 1.05rem; color: #555; line-height: 1.8; }
.stats-grid {
  display: flex; gap: 0; flex-wrap: wrap;
}
.stat-item {
  flex: 1; min-width: 120px; text-align: center; padding: 32px 16px;
  border: 1px solid #eee; transition: background 0.4s var(--ease);
}
.stat-item:hover { background: var(--dark); }
.stat-item:hover .stat-value, .stat-item:hover .stat-label { color: #fff; }
.stat-value { font-size: 2.2rem; font-weight: 900; color: var(--dark); transition: color 0.4s var(--ease); }
.stat-label { font-size: 0.82rem; color: #888; margin-top: 4px; transition: color 0.4s var(--ease); }

/* Features */
.features { padding: 100px 0; background: #fafafa; }
.features-list { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 800px; }
.feature-item {
  display: flex; align-items: center; gap: 14px; padding: 20px 24px;
  background: #fff; border-radius: var(--radius-sm); border-left: 4px solid var(--accent);
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.feature-item:hover { transform: translateX(6px); box-shadow: 0 6px 24px rgba(0,0,0,0.06); }
.feature-item span { font-size: 0.95rem; font-weight: 500; color: #333; }

/* Testimonial - bordered with geometric accent corner */
.testimonial { padding: 100px 0; background: #fff; }
.testimonial-card {
  max-width: 720px; margin: 0 auto; text-align: center;
  padding: 56px 48px; border: 2px solid #eee; border-radius: 0;
  position: relative; overflow: hidden;
}
.testimonial-card::before {
  content: ''; position: absolute; top: 0; right: 0; width: 80px; height: 80px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  clip-path: polygon(0 0, 100% 0, 100% 100%);
  opacity: 0.3;
}
.testimonial-card blockquote { font-size: 1.3rem; font-weight: 400; line-height: 1.7; margin-bottom: 28px; color: #333; font-style: italic; }
.testimonial-card .author { font-weight: 700; font-size: 1rem; color: var(--dark); }
.testimonial-card .role { font-size: 0.85rem; color: #888; margin-top: 4px; }

/* CTA */
.cta-section { padding: 120px 0; background: var(--dark); text-align: center; position: relative; overflow: hidden; }
.cta-geo {
  position: absolute; border: 2px solid rgba(255,255,255,0.04);
  width: 400px; height: 400px; top: 50%; left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  animation: geoSpin1 30s linear infinite;
}
.cta-content { position: relative; z-index: 2; }
.cta-content h2 { font-size: 2.8rem; font-weight: 900; color: #fff; margin-bottom: 16px; letter-spacing: -0.03em; }
.cta-content p { font-size: 1.1rem; color: rgba(255,255,255,0.5); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px; background: #fff; color: var(--dark);
  padding: 18px 42px; border-radius: 100px; font-weight: 700; font-size: 1.05rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(255,255,255,0.1); }
</style>
</head>
<body>
${navbar(data)}

<section class="hero">
  <div class="geo-shape geo-1"></div>
  <div class="geo-shape geo-2"></div>
  <div class="geo-shape geo-3"></div>
  <div class="geo-shape geo-4"></div>
  <div class="hero-content">
    <h1 class="reveal">${escapeHtml(s.hero.headline)}</h1>
    <p class="reveal reveal-d1">${escapeHtml(s.hero.subtitle)}</p>
    <a href="#cta" class="hero-cta reveal reveal-d2">${escapeHtml(s.hero.cta)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-label reveal">Services</div>
    <h2 class="section-title reveal reveal-d1">What We Deliver</h2>
    <p class="section-subtitle reveal reveal-d2">${escapeHtml(data.description)}</p>
    <div class="services-grid">
      ${s.services.map((svc, i) => `<div class="service-card reveal reveal-d${i + 1}">
        <div class="service-card-num">0${i + 1}</div>
        <h3>${escapeHtml(svc.title)}</h3>
        <p>${escapeHtml(svc.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-text reveal">
        <div class="section-label">About</div>
        <h2>${escapeHtml(s.about.title)}</h2>
        <p>${escapeHtml(s.about.description)}</p>
      </div>
      <div class="stats-grid reveal reveal-d2">
        ${s.about.stats.map(st => `<div class="stat-item"><div class="stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="stat-label">${escapeHtml(st.label)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-inner">
    <div class="section-label reveal">Advantages</div>
    <h2 class="section-title reveal reveal-d1">Why Choose Us</h2>
    <div class="features-list">
      ${s.features.map((f, i) => `<div class="feature-item reveal reveal-d${i + 1}">
        <span>${escapeHtml(f)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="testimonial" id="testimonial">
  <div class="section-inner">
    <div class="testimonial-card reveal">
      <blockquote>&ldquo;${escapeHtml(s.testimonial.quote)}&rdquo;</blockquote>
      <div class="author">${escapeHtml(s.testimonial.author)}</div>
      <div class="role">${escapeHtml(s.testimonial.role)}</div>
    </div>
  </div>
</section>

<section class="cta-section" id="cta">
  <div class="cta-geo"></div>
  <div class="section-inner">
    <div class="cta-content">
      <h2 class="reveal">${escapeHtml(s.cta.headline)}</h2>
      <p class="reveal reveal-d1">${escapeHtml(s.cta.subtitle)}</p>
      <a href="#" class="cta-btn reveal reveal-d2">${escapeHtml(s.hero.cta)}</a>
    </div>
  </div>
</section>

${footer(data)}
${sharedJs()}
</body>
</html>`;
}

// ========================================
// ARCHETYPE 4: ORGANIC (Warm blobs/waves)
// ========================================
function organicTemplate(data, slug) {
  const s = data.sections;
  const fontUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${sharedMeta(data, slug, fontUrl)}
<style>
${sharedCss(data, 'DM Sans')}
h1, h2, h3 { font-family: 'DM Sans', sans-serif; }

/* --- ORGANIC ARCHETYPE --- */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: linear-gradient(160deg, var(--dark) 0%, color-mix(in srgb, var(--dark) 70%, var(--accent)) 100%);
  position: relative; overflow: hidden;
}
.hero-blob {
  position: absolute; border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%;
  filter: blur(60px); opacity: 0.25;
}
.hero-blob-1 {
  width: 500px; height: 500px; background: var(--accent);
  top: -10%; right: -5%;
  animation: blobMorph1 16s ease-in-out infinite alternate;
}
.hero-blob-2 {
  width: 350px; height: 350px; background: var(--accent2);
  bottom: -10%; left: 10%;
  animation: blobMorph2 14s ease-in-out infinite alternate;
}
@keyframes blobMorph1 {
  0% { border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%; transform: translate(0,0) rotate(0deg); }
  50% { border-radius: 55% 45% 40% 60% / 45% 55% 50% 50%; transform: translate(20px, -30px) rotate(5deg); }
  100% { border-radius: 50% 50% 45% 55% / 60% 40% 55% 45%; transform: translate(-10px, 15px) rotate(-3deg); }
}
@keyframes blobMorph2 {
  0% { border-radius: 50% 50% 45% 55% / 55% 45% 50% 50%; transform: translate(0,0); }
  100% { border-radius: 45% 55% 50% 50% / 50% 50% 55% 45%; transform: translate(15px, -20px); }
}
/* Wave divider */
.hero-wave {
  position: absolute; bottom: -2px; left: 0; width: 100%; z-index: 2;
}
.hero-wave svg { display: block; width: 100%; height: auto; }

.hero-content { position: relative; z-index: 3; max-width: 1200px; margin: 0 auto; padding: 0 32px; width: 100%; }
.hero-content h1 {
  font-size: 3.6rem; font-weight: 800; color: #fff; line-height: 1.1;
  letter-spacing: -0.02em; margin-bottom: 20px; max-width: 640px;
}
.hero-content p { font-size: 1.15rem; color: rgba(255,255,255,0.65); max-width: 500px; margin-bottom: 36px; line-height: 1.7; }
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px; background: #fff;
  color: var(--dark); padding: 16px 36px; border-radius: 100px;
  font-weight: 700; font-size: 1rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.hero-cta:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.15); }
.hero-cta svg { width: 18px; height: 18px; }

/* Rounded cards with background gradient per card */
.services { padding: 100px 0; background: #fff; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 12px; }
.section-title { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 16px; letter-spacing: -0.02em; }
.section-subtitle { font-size: 1.05rem; color: #666; max-width: 560px; margin-bottom: 56px; line-height: 1.7; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.service-card {
  border-radius: 24px; padding: 40px 32px; border: none; position: relative; overflow: hidden;
  transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease);
}
.service-card:nth-child(1) { background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 10%, #fff), color-mix(in srgb, var(--accent) 4%, #fff)); }
.service-card:nth-child(2) { background: linear-gradient(160deg, color-mix(in srgb, var(--accent2) 10%, #fff), color-mix(in srgb, var(--accent2) 4%, #fff)); }
.service-card:nth-child(3) { background: linear-gradient(160deg, color-mix(in srgb, var(--accent) 8%, #fff), color-mix(in srgb, var(--accent2) 6%, #fff)); }
.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.08);
}
.service-icon {
  width: 56px; height: 56px; border-radius: 16px;
  background: rgba(255,255,255,0.8);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.6rem; margin-bottom: 20px;
}
.service-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; color: var(--dark); }
.service-card p { font-size: 0.95rem; color: #555; line-height: 1.7; }

/* About */
.about { padding: 120px 0; background: color-mix(in srgb, var(--accent) 4%, #fff); }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.about-text h2 { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 20px; }
.about-text p { font-size: 1.05rem; color: #555; line-height: 1.8; }
.stats-row { display: flex; gap: 32px; margin-top: 40px; }
.stat-item {
  background: #fff; border-radius: 16px; padding: 24px 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04); text-align: center; flex: 1;
}
.stat-value { font-size: 2rem; font-weight: 800; color: var(--accent); }
.stat-label { font-size: 0.82rem; color: #888; margin-top: 4px; }

/* Features - rounded badges with leaf-themed check */
.features { padding: 100px 0; background: #fff; }
.features-list { display: flex; flex-wrap: wrap; gap: 14px; max-width: 800px; }
.feature-badge {
  display: inline-flex; align-items: center; gap: 10px; padding: 14px 24px;
  background: color-mix(in srgb, var(--accent) 6%, #fff);
  border-radius: 100px; border: 1px solid color-mix(in srgb, var(--accent) 15%, #fff);
  transition: transform 0.4s var(--ease), background 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.feature-badge:hover { transform: translateY(-2px); background: color-mix(in srgb, var(--accent) 12%, #fff); box-shadow: 0 6px 20px rgba(0,0,0,0.06); }
.feature-badge-icon { color: var(--accent); flex-shrink: 0; display: flex; align-items: center; }
.feature-badge-icon svg { width: 18px; height: 18px; }
.feature-badge span { font-size: 0.9rem; font-weight: 500; color: #333; }

/* Testimonial - soft rounded with decorative quote mark */
.testimonial { padding: 100px 0; background: color-mix(in srgb, var(--accent) 4%, #fff); }
.testimonial-card {
  max-width: 680px; margin: 0 auto; text-align: center;
  background: #fff; border-radius: 32px; padding: 56px 48px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.06); position: relative;
}
.testimonial-quote-mark { font-size: 6rem; line-height: 1; color: var(--accent); opacity: 0.15; font-family: Georgia, serif; margin-bottom: -20px; }
.testimonial-card blockquote { font-size: 1.25rem; font-weight: 400; line-height: 1.7; margin-bottom: 28px; color: #333; font-style: italic; }
.testimonial-card .author { font-weight: 700; font-size: 1rem; color: var(--dark); }
.testimonial-card .role { font-size: 0.85rem; color: #888; margin-top: 4px; }

/* CTA */
.cta-section {
  padding: 120px 0; text-align: center; position: relative; overflow: hidden;
  background: linear-gradient(160deg, var(--dark) 0%, color-mix(in srgb, var(--dark) 70%, var(--accent)) 100%);
}
.cta-blob {
  position: absolute; width: 400px; height: 400px; border-radius: 50%;
  background: var(--accent); filter: blur(120px); opacity: 0.12;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
}
.cta-content { position: relative; z-index: 2; }
.cta-content h2 { font-size: 2.6rem; font-weight: 800; color: #fff; margin-bottom: 16px; }
.cta-content p { font-size: 1.1rem; color: rgba(255,255,255,0.55); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px; background: #fff;
  color: var(--dark); padding: 18px 42px; border-radius: 100px;
  font-weight: 700; font-size: 1.05rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.cta-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.2); }
</style>
</head>
<body>
${navbar(data)}

<section class="hero">
  <div class="hero-blob hero-blob-1"></div>
  <div class="hero-blob hero-blob-2"></div>
  <div class="hero-content">
    <h1 class="reveal">${escapeHtml(s.hero.headline)}</h1>
    <p class="reveal reveal-d1">${escapeHtml(s.hero.subtitle)}</p>
    <a href="#cta" class="hero-cta reveal reveal-d2">${escapeHtml(s.hero.cta)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
  </div>
  <div class="hero-wave">
    <svg viewBox="0 0 1440 100" preserveAspectRatio="none"><path fill="#fff" d="M0,40 C360,100 1080,0 1440,60 L1440,100 L0,100 Z"/></svg>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-text reveal">
        <div class="section-label">About Us</div>
        <h2>${escapeHtml(s.about.title)}</h2>
        <p>${escapeHtml(s.about.description)}</p>
      </div>
      <div class="reveal reveal-d2">
        <div class="stats-row">
          ${s.about.stats.map(st => `<div class="stat-item"><div class="stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="stat-label">${escapeHtml(st.label)}</div></div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="testimonial" id="testimonial">
  <div class="section-inner">
    <div class="testimonial-card reveal">
      <div class="testimonial-quote-mark">&ldquo;</div>
      <blockquote>&ldquo;${escapeHtml(s.testimonial.quote)}&rdquo;</blockquote>
      <div class="author">${escapeHtml(s.testimonial.author)}</div>
      <div class="role">${escapeHtml(s.testimonial.role)}</div>
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-label reveal">Our Services</div>
    <h2 class="section-title reveal reveal-d1">How We Help</h2>
    <p class="section-subtitle reveal reveal-d2">${escapeHtml(data.description)}</p>
    <div class="services-grid">
      ${s.services.map((svc, i) => `<div class="service-card reveal reveal-d${i + 1}">
        <div class="service-icon">${svc.icon}</div>
        <h3>${escapeHtml(svc.title)}</h3>
        <p>${escapeHtml(svc.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-inner">
    <div class="section-label reveal">Why Us</div>
    <h2 class="section-title reveal reveal-d1">What Makes Us Different</h2>
    <div class="features-list">
      ${s.features.map((f, i) => `<div class="feature-badge reveal reveal-d${i + 1}">
        <div class="feature-badge-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12l3 3 5-5"/></svg></div>
        <span>${escapeHtml(f)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="cta-section" id="cta">
  <div class="cta-blob"></div>
  <div class="section-inner">
    <div class="cta-content">
      <h2 class="reveal">${escapeHtml(s.cta.headline)}</h2>
      <p class="reveal reveal-d1">${escapeHtml(s.cta.subtitle)}</p>
      <a href="#" class="cta-btn reveal reveal-d2">${escapeHtml(s.hero.cta)}</a>
    </div>
  </div>
</section>

${footer(data)}
${sharedJs()}
</body>
</html>`;
}

// ========================================
// ARCHETYPE 5: PRECISION (Grid/dot pattern)
// ========================================
function precisionTemplate(data, slug) {
  const s = data.sections;
  const fontUrl = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${sharedMeta(data, slug, fontUrl)}
<style>
${sharedCss(data, 'Inter')}
h1, h2, h3 { font-family: 'JetBrains Mono', monospace; }

/* --- PRECISION ARCHETYPE --- */
.hero {
  min-height: 100vh; display: flex; align-items: center;
  background: var(--dark); position: relative; overflow: hidden;
}
/* Animated dot grid */
.hero-grid {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 32px 32px;
  animation: gridShift 20s linear infinite;
}
@keyframes gridShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(32px, 32px); }
}
.hero-line {
  position: absolute; background: linear-gradient(180deg, transparent, var(--accent), transparent);
  width: 1px; height: 200px; opacity: 0.15;
}
.hero-line-1 { left: 20%; top: 0; animation: lineDrift 6s ease-in-out infinite; }
.hero-line-2 { left: 50%; top: -50px; animation: lineDrift 8s ease-in-out 2s infinite; }
.hero-line-3 { left: 80%; top: -20px; animation: lineDrift 7s ease-in-out 4s infinite; }
@keyframes lineDrift { 0%,100% { transform: translateY(0); opacity: 0.15; } 50% { transform: translateY(100vh); opacity: 0.3; } }

.hero-content { position: relative; z-index: 2; max-width: 1200px; margin: 0 auto; padding: 0 32px; width: 100%; }
.hero-eyebrow {
  display: inline-block; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.15em; color: var(--accent); border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 16px; border-radius: 4px; margin-bottom: 24px;
}
.hero-content h1 {
  font-size: 3.8rem; font-weight: 800; color: #fff; line-height: 1.08;
  letter-spacing: -0.03em; margin-bottom: 20px; max-width: 680px;
}
.hero-content p { font-size: 1.15rem; color: rgba(255,255,255,0.5); max-width: 520px; margin-bottom: 40px; line-height: 1.7; }
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px; background: var(--accent);
  color: #fff; padding: 14px 32px; border-radius: 4px;
  font-weight: 600; font-size: 0.95rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.hero-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.3); }
.hero-cta svg { width: 16px; height: 16px; }

/* Metrics bar */
.metrics-bar {
  display: flex; gap: 0; margin-top: 64px; border-top: 1px solid rgba(255,255,255,0.08);
}
.metric-item { flex: 1; padding: 28px 0; border-right: 1px solid rgba(255,255,255,0.08); }
.metric-item:last-child { border-right: none; }
.metric-value { font-size: 1.8rem; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; }
.metric-label { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.06em; }

/* Services - strict 2-column with monospace numbering and thin lines */
.services { padding: 120px 0; background: #fafafa; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); margin-bottom: 12px; font-family: 'JetBrains Mono', monospace; }
.section-title { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 16px; letter-spacing: -0.02em; }
.section-subtitle { font-size: 1.05rem; color: #666; max-width: 540px; margin-bottom: 56px; line-height: 1.7; }
.services-grid-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-top: 1px solid #d0d0d0; }
.service-card-2col {
  background: #fff; padding: 36px 32px;
  border-bottom: 1px solid #d0d0d0; border-right: 1px solid #d0d0d0;
  transition: background 0.5s var(--ease);
}
.service-card-2col:nth-child(2n) { border-right: none; }
.service-card-2col:hover { background: var(--dark); }
.service-card-2col:hover h3, .service-card-2col:hover p, .service-card-2col:hover .service-mono-num { color: #fff; }
.service-mono-num { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 600; color: var(--accent); margin-bottom: 14px; letter-spacing: 0.05em; transition: color 0.5s var(--ease); }
.service-card-2col h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 10px; color: var(--dark); transition: color 0.5s var(--ease); }
.service-card-2col p { font-size: 0.93rem; color: #555; line-height: 1.7; transition: color 0.5s var(--ease); }

/* About */
.about { padding: 120px 0; background: #fff; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: start; }
.about-text h2 { font-size: 2.4rem; font-weight: 800; color: var(--dark); margin-bottom: 20px; letter-spacing: -0.02em; }
.about-text p { font-size: 1.05rem; color: #555; line-height: 1.8; }
.stats-grid { display: flex; flex-direction: column; gap: 0; border: 1px solid #eee; }
.stat-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid #eee;
}
.stat-item:last-child { border-bottom: none; }
.stat-label { font-size: 0.85rem; color: #666; font-weight: 500; }
.stat-value { font-size: 1.6rem; font-weight: 800; color: var(--dark); font-variant-numeric: tabular-nums; }

/* Features - table-like rows with alternating backgrounds */
.features { padding: 100px 0; background: #fafafa; }
.features-table { display: flex; flex-direction: column; max-width: 800px; border: 1px solid #e0e0e0; }
.feature-row {
  display: flex; align-items: center; gap: 16px; padding: 18px 24px;
  transition: background 0.3s var(--ease);
}
.feature-row:nth-child(odd) { background: #fff; }
.feature-row:nth-child(even) { background: #f5f5f5; }
.feature-row:hover { background: color-mix(in srgb, var(--accent) 6%, #fff); }
.feature-row:not(:last-child) { border-bottom: 1px solid #e8e8e8; }
.feature-row-num { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 700; color: var(--accent); min-width: 28px; }
.feature-row span { font-size: 0.93rem; font-weight: 500; color: #333; }

/* Testimonial - monospace-styled with metrics sidebar */
.testimonial { padding: 100px 0; background: #fff; }
.testimonial-precision {
  max-width: 800px; margin: 0 auto; display: grid; grid-template-columns: 1fr 200px; gap: 0;
  border: 1px solid #e0e0e0;
}
.testimonial-precision-main { padding: 48px 40px; }
.testimonial-precision-main blockquote {
  font-size: 1.15rem; font-weight: 400; line-height: 1.7; margin-bottom: 24px; color: #333;
  font-style: normal; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem;
}
.testimonial-precision-main .author { font-weight: 700; font-size: 0.9rem; color: var(--dark); font-family: 'JetBrains Mono', monospace; }
.testimonial-precision-main .role { font-size: 0.8rem; color: #888; margin-top: 4px; }
.testimonial-metrics { background: var(--dark); padding: 32px 24px; display: flex; flex-direction: column; justify-content: center; gap: 20px; }
.testimonial-metric-val { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 700; color: var(--accent); }
.testimonial-metric-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
@media (max-width: 768px) {
  .testimonial-precision { grid-template-columns: 1fr; }
  .testimonial-metrics { flex-direction: row; flex-wrap: wrap; gap: 16px; }
}

/* CTA */
.cta-section {
  padding: 120px 0; background: var(--dark); text-align: center;
  position: relative; overflow: hidden;
}
.cta-grid-bg {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
}
.cta-content { position: relative; z-index: 2; }
.cta-content h2 { font-size: 2.6rem; font-weight: 800; color: #fff; margin-bottom: 16px; letter-spacing: -0.02em; }
.cta-content p { font-size: 1.05rem; color: rgba(255,255,255,0.5); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px; background: var(--accent); color: #fff;
  padding: 16px 38px; border-radius: 4px; font-weight: 700; font-size: 1rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }
</style>
</head>
<body>
${navbar(data)}

<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-line hero-line-1"></div>
  <div class="hero-line hero-line-2"></div>
  <div class="hero-line hero-line-3"></div>
  <div class="hero-content">
    <div class="hero-eyebrow reveal">${escapeHtml(data.industry)}</div>
    <h1 class="reveal reveal-d1">${escapeHtml(s.hero.headline)}</h1>
    <p class="reveal reveal-d2">${escapeHtml(s.hero.subtitle)}</p>
    <a href="#cta" class="hero-cta reveal reveal-d3">${escapeHtml(s.hero.cta)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
    <div class="metrics-bar reveal reveal-d4">
      ${s.about.stats.map(st => `<div class="metric-item"><div class="metric-value stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="metric-label">${escapeHtml(st.label)}</div></div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-inner">
    <div class="section-label reveal">Differentiators</div>
    <h2 class="section-title reveal reveal-d1">Our Standards</h2>
    <div class="features-table">
      ${s.features.map((f, i) => `<div class="feature-row reveal reveal-d${i + 1}">
        <span class="feature-row-num">[0${i + 1}]</span>
        <span>${escapeHtml(f)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-label reveal">Services</div>
    <h2 class="section-title reveal reveal-d1">Our Expertise</h2>
    <p class="section-subtitle reveal reveal-d2">${escapeHtml(data.description)}</p>
    <div class="services-grid-2col">
      ${s.services.map((svc, i) => `<div class="service-card-2col reveal reveal-d${i + 1}">
        <div class="service-mono-num">// 0${i + 1}</div>
        <h3>${escapeHtml(svc.title)}</h3>
        <p>${escapeHtml(svc.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-text reveal">
        <div class="section-label">About</div>
        <h2>${escapeHtml(s.about.title)}</h2>
        <p>${escapeHtml(s.about.description)}</p>
      </div>
      <div class="stats-grid reveal reveal-d2">
        ${s.about.stats.map(st => `<div class="stat-item"><div class="stat-label">${escapeHtml(st.label)}</div><div class="stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="testimonial" id="testimonial">
  <div class="section-inner">
    <div class="testimonial-precision reveal">
      <div class="testimonial-precision-main">
        <blockquote>&ldquo;${escapeHtml(s.testimonial.quote)}&rdquo;</blockquote>
        <div class="author">${escapeHtml(s.testimonial.author)}</div>
        <div class="role">${escapeHtml(s.testimonial.role)}</div>
      </div>
      <div class="testimonial-metrics">
        ${s.about.stats.slice(0, 3).map(st => `<div><div class="testimonial-metric-val">${escapeHtml(st.value)}</div><div class="testimonial-metric-label">${escapeHtml(st.label)}</div></div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>

<section class="cta-section" id="cta">
  <div class="cta-grid-bg"></div>
  <div class="section-inner">
    <div class="cta-content">
      <h2 class="reveal">${escapeHtml(s.cta.headline)}</h2>
      <p class="reveal reveal-d1">${escapeHtml(s.cta.subtitle)}</p>
      <a href="#" class="cta-btn reveal reveal-d2">${escapeHtml(s.hero.cta)}</a>
    </div>
  </div>
</section>

${footer(data)}
${sharedJs()}
</body>
</html>`;
}

// ========================================
// ARCHETYPE 6: ARTISAN (Gradient + texture)
// ========================================
function artisanTemplate(data, slug) {
  const s = data.sections;
  const fontUrl = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800;9..144,900&family=DM+Sans:wght@300;400;500;600;700;800;900&display=swap';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${sharedMeta(data, slug, fontUrl)}
<style>
${sharedCss(data, 'DM Sans')}
h1, h2, h3 { font-family: 'Fraunces', serif; }

/* --- ARTISAN ARCHETYPE --- */
.hero {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 50%, var(--dark) 100%);
  position: relative; overflow: hidden; text-align: center;
}
/* Noise texture overlay */
.hero::before {
  content: ''; position: absolute; inset: 0; opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}
.hero-content { position: relative; z-index: 2; max-width: 800px; padding: 0 32px; }
.hero-content h1 {
  font-size: 4.2rem; font-weight: 900; color: #fff; line-height: 1.06;
  letter-spacing: -0.035em; margin-bottom: 20px;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero-content p { font-size: 1.15rem; color: rgba(255,255,255,0.7); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.hero-cta {
  display: inline-flex; align-items: center; gap: 10px; background: #fff;
  color: var(--dark); padding: 16px 38px; border-radius: 100px;
  font-weight: 700; font-size: 1rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.hero-cta:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 16px 48px rgba(0,0,0,0.2); }
.hero-cta svg { width: 18px; height: 18px; }
.hero-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.8); font-weight: 600; font-size: 0.95rem;
  margin-left: 20px; border-bottom: 1px solid rgba(255,255,255,0.4);
  padding-bottom: 2px; transition: color 0.3s var(--ease);
}
.hero-secondary:hover { color: #fff; }

/* Services - overlapping cards with offset and handcraft borders */
.services { padding: 120px 0; background: #fff; position: relative; }
.section-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; }
.section-label { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 12px; }
.section-title {
  font-size: 2.6rem; font-weight: 900; color: var(--dark); margin-bottom: 16px; letter-spacing: -0.025em;
  background: linear-gradient(135deg, var(--dark) 0%, var(--accent) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  display: inline-block;
}
.section-subtitle { font-size: 1.05rem; color: #666; max-width: 560px; margin-bottom: 56px; line-height: 1.7; }
.services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding-top: 20px; }
.service-card {
  background: #fff; border-radius: 4px; padding: 40px 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  border: 2px solid #e8e4e0; position: relative;
  transition: transform 0.5s var(--ease), box-shadow 0.5s var(--ease), border-color 0.5s var(--ease);
}
.service-card:nth-child(1) { transform: rotate(-1deg); }
.service-card:nth-child(2) { transform: translateY(-20px) rotate(0.5deg); }
.service-card:nth-child(3) { transform: rotate(-0.5deg); }
.service-card:hover {
  transform: translateY(-12px) rotate(0deg);
  box-shadow: 0 24px 64px rgba(0,0,0,0.1);
  border-color: var(--accent);
}
.service-card-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem; margin-bottom: 20px;
}
.service-card h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 12px; color: var(--dark); }
.service-card p { font-size: 0.95rem; color: #555; line-height: 1.7; }

/* About */
.about { padding: 120px 0; background: #f9f8f6; }
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
.about-text h2 {
  font-size: 2.4rem; font-weight: 900; margin-bottom: 20px;
  background: linear-gradient(135deg, var(--dark) 0%, var(--accent) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  display: inline-block;
}
.about-text p { font-size: 1.05rem; color: #555; line-height: 1.8; }
.stats-row { display: flex; gap: 24px; margin-top: 40px; }
.stat-item {
  flex: 1; text-align: center; padding: 24px 16px;
  background: linear-gradient(135deg, var(--accent), var(--accent2));
  border-radius: 16px; color: #fff;
}
.stat-value { font-size: 2rem; font-weight: 800; }
.stat-label { font-size: 0.82rem; opacity: 0.8; margin-top: 4px; }

/* Features - hand-drawn underline with decorative bullet */
.features { padding: 100px 0; background: #fff; }
.features-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 800px; }
.feature-artisan {
  display: flex; align-items: flex-start; gap: 14px; padding: 18px 20px;
  border-bottom: 2px dashed #e0dbd5;
  transition: transform 0.4s var(--ease), border-color 0.4s var(--ease);
}
.feature-artisan:hover { transform: translateX(4px); border-color: var(--accent); }
.feature-artisan-bullet { font-size: 1.2rem; color: var(--accent); flex-shrink: 0; margin-top: 1px; }
.feature-artisan span { font-size: 0.95rem; font-weight: 500; color: #333; line-height: 1.5; }

/* Testimonial - warm background with artistic quotes and serif font */
.testimonial { padding: 100px 0; background: #f9f8f6; }
.testimonial-artisan {
  max-width: 700px; margin: 0 auto; text-align: center;
  padding: 56px 48px;
  background: color-mix(in srgb, var(--accent) 8%, #faf6f1);
  border-radius: 8px; border: 1px solid color-mix(in srgb, var(--accent) 15%, #e8e0d8);
  position: relative;
}
.testimonial-artisan-quote { font-size: 5rem; line-height: 1; color: var(--accent); opacity: 0.25; font-family: 'Fraunces', serif; margin-bottom: -16px; }
.testimonial-artisan blockquote {
  font-size: 1.3rem; font-weight: 400; line-height: 1.7; margin-bottom: 28px;
  font-style: italic; color: var(--dark); font-family: 'Fraunces', serif;
}
.testimonial-artisan .author { font-weight: 700; font-size: 1rem; color: var(--dark); }
.testimonial-artisan .role { font-size: 0.85rem; color: #888; margin-top: 4px; }

/* CTA */
.cta-section {
  padding: 120px 0; text-align: center; position: relative; overflow: hidden;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 50%, var(--dark) 100%);
}
.cta-section::before {
  content: ''; position: absolute; inset: 0; opacity: 0.05;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
}
.cta-content { position: relative; z-index: 2; }
.cta-content h2 { font-size: 2.8rem; font-weight: 900; color: #fff; margin-bottom: 16px; letter-spacing: -0.02em; }
.cta-content p { font-size: 1.1rem; color: rgba(255,255,255,0.65); max-width: 520px; margin: 0 auto 40px; line-height: 1.7; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 10px; background: #fff;
  color: var(--dark); padding: 18px 42px; border-radius: 100px;
  font-weight: 700; font-size: 1.05rem;
  transition: transform 0.4s var(--ease), box-shadow 0.4s var(--ease);
}
.cta-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.2); }
</style>
</head>
<body>
${navbar(data)}

<section class="hero">
  <div class="hero-content">
    <h1 class="reveal">${escapeHtml(s.hero.headline)}</h1>
    <p class="reveal reveal-d1">${escapeHtml(s.hero.subtitle)}</p>
    <div class="reveal reveal-d2">
      <a href="#cta" class="hero-cta">${escapeHtml(s.hero.cta)} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
      <a href="#services" class="hero-secondary">Learn more</a>
    </div>
  </div>
</section>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-label reveal">Services</div>
    <h2 class="section-title reveal reveal-d1">What We Create</h2>
    <p class="section-subtitle reveal reveal-d2">${escapeHtml(data.description)}</p>
    <div class="services-grid">
      ${s.services.map((svc, i) => `<div class="service-card reveal reveal-d${i + 1}">
        <div class="service-card-icon">${svc.icon}</div>
        <h3>${escapeHtml(svc.title)}</h3>
        <p>${escapeHtml(svc.description)}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-text reveal">
        <div class="section-label">Our Story</div>
        <h2>${escapeHtml(s.about.title)}</h2>
        <p>${escapeHtml(s.about.description)}</p>
      </div>
      <div class="reveal reveal-d2">
        <div class="stats-row">
          ${s.about.stats.map(st => `<div class="stat-item"><div class="stat-value" data-value="${escapeHtml(st.value)}">${escapeHtml(st.value)}</div><div class="stat-label">${escapeHtml(st.label)}</div></div>`).join('\n          ')}
        </div>
      </div>
    </div>
  </div>
</section>

<section class="testimonial" id="testimonial">
  <div class="section-inner">
    <div class="testimonial-artisan reveal">
      <div class="testimonial-artisan-quote">&ldquo;</div>
      <blockquote>&ldquo;${escapeHtml(s.testimonial.quote)}&rdquo;</blockquote>
      <div class="author">${escapeHtml(s.testimonial.author)}</div>
      <div class="role">${escapeHtml(s.testimonial.role)}</div>
    </div>
  </div>
</section>

<section class="features" id="features">
  <div class="section-inner">
    <div class="section-label reveal">Why Us</div>
    <h2 class="section-title reveal reveal-d1">Our Approach</h2>
    <div class="features-list">
      ${s.features.map((f, i) => `<div class="feature-artisan reveal reveal-d${i + 1}">
        <span class="feature-artisan-bullet">&#10043;</span>
        <span>${escapeHtml(f)}</span>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section class="cta-section" id="cta">
  <div class="section-inner">
    <div class="cta-content">
      <h2 class="reveal">${escapeHtml(s.cta.headline)}</h2>
      <p class="reveal reveal-d1">${escapeHtml(s.cta.subtitle)}</p>
      <a href="#" class="cta-btn reveal reveal-d2">${escapeHtml(s.hero.cta)}</a>
    </div>
  </div>
</section>

${footer(data)}
${sharedJs()}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 5. Template dispatcher
// ---------------------------------------------------------------------------
const templates = {
  luminous: luminousTemplate,
  editorial: editorialTemplate,
  kinetic: kineticTemplate,
  organic: organicTemplate,
  precision: precisionTemplate,
  artisan: artisanTemplate,
};

// ---------------------------------------------------------------------------
// 6. Generate all sites
// ---------------------------------------------------------------------------
const portfolioDir = path.join(__dirname, 'portfolio');
let generated = 0;
const archetypeCounts = {};

for (const slug of slugs) {
  const data = SHOWCASE_DATA[slug];
  const archetype = getArchetype(data.category, slug);
  archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;

  const templateFn = templates[archetype];
  if (!templateFn) {
    console.error(`Unknown archetype "${archetype}" for ${slug}`);
    continue;
  }

  const html = templateFn(data, slug);
  const outDir = path.join(portfolioDir, slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
  generated++;
}

console.log(`\nGenerated ${generated} showcase sites.`);
console.log('\nArchetype distribution:');
for (const [arch, count] of Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${arch}: ${count}`);
}
console.log('\nDone.');
