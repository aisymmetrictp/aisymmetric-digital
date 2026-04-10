/* ============================================
   Showcase Renderer
   Reads industry slug from URL and renders
   a full mock website preview
   ============================================ */

(function () {
  'use strict';

  // Get slug from URL: /portfolio/arctic-air or ?id=arctic-air
  function getSlug() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) return params.get('id');

    const path = window.location.pathname;
    const match = path.match(/\/portfolio\/([a-z0-9-]+)/);
    if (match) return match[1];

    return null;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderShowcase(slug) {
    const data = window.SHOWCASE_DATA;
    if (!data || !data[slug]) {
      renderNotFound();
      return;
    }

    const site = data[slug];
    const s = site.sections;

    // Update page meta
    document.title = site.name + ' — Template Preview | AISymmetric Digital';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = 'See a custom ' + site.industry + ' website template by AISymmetric Digital. ' + site.description;

    const root = document.getElementById('showcase-root');
    root.innerHTML = `
      <div class="mock-site" style="--accent: ${site.accentPrimary}; --accent2: ${site.accentSecondary}; --dark: ${site.darkBg};">

        <!-- Mock Navigation -->
        <nav class="mock-nav">
          <div class="mock-nav-inner">
            <div class="mock-nav-brand">${escapeHtml(site.name).replace(/\s\S+$/, ' <span>' + escapeHtml(site.name).split(' ').pop() + '</span>')}</div>
            <div class="mock-nav-links">
              <a href="#">Home</a>
              <a href="#">Services</a>
              <a href="#">About</a>
              <a href="#">Contact</a>
              <a href="#" class="mock-nav-cta">${escapeHtml(s.hero.cta)}</a>
            </div>
          </div>
        </nav>

        <!-- Mock Hero -->
        <section class="mock-hero">
          <div class="mock-hero-content">
            <h1>${escapeHtml(s.hero.headline).replace(/\b(\w+)$/, '<span class="accent">$1</span>')}</h1>
            <p>${escapeHtml(s.hero.subtitle)}</p>
            <div class="mock-hero-ctas">
              <a href="/index.html#contact" class="mock-btn-primary">
                ${escapeHtml(s.hero.cta)}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
              <a href="#" class="mock-btn-secondary">Learn More</a>
            </div>
          </div>
        </section>

        <!-- Mock Services -->
        <section class="mock-services">
          <div class="mock-section-inner">
            <div class="mock-section-header">
              <div class="mock-section-tag">What We Offer</div>
              <h2 class="mock-section-title">Our Services</h2>
              <p class="mock-section-subtitle">Professional ${escapeHtml(site.industry.toLowerCase())} solutions tailored to your needs.</p>
            </div>
            <div class="mock-services-grid">
              ${s.services.map(svc => `
                <div class="mock-service-card">
                  <div class="mock-service-icon">${svc.icon}</div>
                  <h3>${escapeHtml(svc.title)}</h3>
                  <p>${escapeHtml(svc.description)}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- Mock About -->
        <section class="mock-about">
          <div class="mock-section-inner">
            <div class="mock-about-grid">
              <div class="mock-about-text">
                <div class="mock-section-tag">About Us</div>
                <h2>${escapeHtml(s.about.title)}</h2>
                <p>${escapeHtml(s.about.description)}</p>
                <div class="mock-stats">
                  ${s.about.stats.map(stat => `
                    <div>
                      <div class="mock-stat-value">${escapeHtml(stat.value)}</div>
                      <div class="mock-stat-label">${escapeHtml(stat.label)}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div>
                <ul class="mock-features-list">
                  ${s.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <!-- Mock Testimonial -->
        <section class="mock-testimonial">
          <div class="mock-section-inner">
            <div class="mock-section-header">
              <div class="mock-section-tag">Testimonials</div>
              <h2 class="mock-section-title">What Clients Say</h2>
            </div>
            <div class="mock-testimonial-card">
              <div class="mock-quote">${escapeHtml(s.testimonial.quote)}</div>
              <div class="mock-author">${escapeHtml(s.testimonial.author)}</div>
              <div class="mock-author-role">${escapeHtml(s.testimonial.role)}</div>
            </div>
          </div>
        </section>

        <!-- Mock CTA -->
        <section class="mock-cta">
          <div class="mock-cta-content">
            <h2>${escapeHtml(s.cta.headline)}</h2>
            <p>${escapeHtml(s.cta.subtitle)}</p>
            <a href="/index.html#contact" class="mock-btn-primary">
              Get Started
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
        </section>

        <!-- Mock Footer -->
        <footer class="mock-footer">
          <p>&copy; 2026 ${escapeHtml(site.name)}. All rights reserved. | Template by AISymmetric Digital</p>
        </footer>
      </div>

      <!-- Get This Site Bar -->
      <section class="showcase-bottom-cta">
        <h2>Want a site like <span class="gradient-text">${escapeHtml(site.name)}</span>?</h2>
        <p>We'll custom-build it for your business. Launch in 2-3 weeks.</p>
        <a href="/index.html#contact" class="btn btn-hero-primary">Get Started</a>
        <a href="/portfolio.html" class="btn btn-hero-secondary">Browse All Templates</a>
      </section>
    `;

    // Scroll to top
    window.scrollTo(0, 0);
  }

  function renderNotFound() {
    const root = document.getElementById('showcase-root');
    root.innerHTML = `
      <div class="showcase-404">
        <div>
          <h1 class="gradient-text">Template Not Found</h1>
          <p class="section-subtitle" style="margin-bottom: 32px;">This showcase doesn't exist yet. Browse our full collection below.</p>
          <a href="/portfolio.html" class="btn btn-primary">View All Templates</a>
        </div>
      </div>
    `;
  }

  // Init
  const slug = getSlug();
  if (slug) {
    renderShowcase(slug);
  } else {
    renderNotFound();
  }
})();
