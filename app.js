import { siteData } from './data/mehomez-content.js';

const root = document.querySelector('[data-page-root]');
const header = document.querySelector('[data-site-header]');
const footer = document.querySelector('[data-site-footer]');
const page = document.body.dataset.page;
const searchParams = new URLSearchParams(window.location.search);
const currentSlug = searchParams.get('slug');

const works = [...siteData.works].sort((a, b) => new Date(b.date) - new Date(a.date));
const pressEntries = [...siteData.press].sort((a, b) => new Date(b.date) - new Date(a.date));
const parcoursEntries = [...siteData.parcours].sort((a, b) => new Date(b.date) - new Date(a.date));
const articleEntries = [...pressEntries, ...parcoursEntries];

const navItems = [
  ['home', 'Accueil', './mehomez-portfolio.html'],
  ['artist', "L'artiste", './artiste.html'],
  ['works', 'Galerie', './oeuvres.html'],
  ['parcours', 'Parcours', './parcours.html'],
  ['press', 'Presse', './presse.html'],
  ['contact', 'Contact', './contact.html'],
];

const heroSlides = [1, 2, 3, 4, 5, 6, 7].map(
  (n) => `https://mehomez.de/wp-content/themes/mehomez/images/diapo-accueil/0${n}.jpg`,
);

const esc = (v = '') =>
  String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fmt = (value = '') =>
  value
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
    : '';

const excerpt = (text = '', max = 170) => {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length <= max ? compact : `${compact.slice(0, max).trim()}...`;
};

const sentenceBlock = (text = '', count = 2) => {
  const chunks = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return chunks.slice(0, count).join('. ') + (chunks.length ? '.' : '');
};

const sentenceSlice = (text = '', start = 0, count = 2) => {
  const chunks = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const selected = chunks.slice(start, start + count);
  return selected.join('. ') + (selected.length ? '.' : '');
};

const paragraphs = (text = '') =>
  text
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => `<p>${esc(part)}</p>`)
    .join('');

const imageOf = (entry) => entry?.images?.[0] || siteData.artist.portrait || heroSlides[0];
const workKind = (work) => (work.type === 'work-sculpture' ? 'sculpture' : 'peinture');
const workKindLabel = (work) => (workKind(work) === 'sculpture' ? 'Sculpture' : 'Peinture sculptée');
const sourceOf = (entry) => (entry.title.includes(':') ? entry.title.split(':')[0].trim() : entry.title.includes(',') ? entry.title.split(',')[0].trim() : entry.type === 'press' ? 'Revue de presse' : 'Infos & Parcours');
const metaOf = (work) => [work.composition, work.technique ? `Technique ${work.technique}` : '', work.dimensions, work.archiveYear].filter(Boolean).join(' · ');
const artistPortrait = siteData.artist.portrait || imageOf(works[0]);
const currentArticle = articleEntries.find((entry) => entry.slug === currentSlug) || null;
const currentArticleSection = currentArticle ? (currentArticle.type === 'press' ? 'press' : 'parcours') : null;
const quoteOf = () => (siteData.artist.text.match(/L'artiste tire son inspiration[^.]+\./i)?.[0] || sentenceBlock(siteData.artist.text, 1));

function pageHero(label, title, sub, image) {
  return `
    <section class="page-hero">
      <div class="page-hero-image" style="--hero-image:url('${esc(image)}')"></div>
      <div class="page-hero-overlay"></div>
      <div class="page-hero-content">
        <p class="page-hero-eyebrow reveal">${esc(label)}</p>
        <h1 class="page-hero-title reveal">${title}</h1>
        <p class="page-hero-sub reveal">${esc(sub)}</p>
        <div class="page-hero-line reveal"></div>
      </div>
    </section>
  `;
}

function galleryCard(work) {
  return `
    <article class="gallery-item reveal" data-lightbox-kind="work" data-slug="${esc(work.slug)}" tabindex="0" role="button">
      <div class="gallery-item-tag">${esc(workKindLabel(work))}</div>
      <img src="${esc(imageOf(work))}" alt="${esc(work.title)}" loading="lazy">
      <div class="gallery-item-overlay">
        <h3 class="gallery-item-title">${esc(work.title)}</h3>
        <div class="gallery-item-meta">${esc(metaOf(work) || work.archiveYear || '')}</div>
      </div>
    </article>
  `;
}

function storyCard(entry) {
  return `
    <article class="story-card reveal">
      <div class="story-card-image"><img src="${esc(imageOf(entry))}" alt="${esc(entry.title)}" loading="lazy"></div>
      <div class="story-card-body">
        <p class="story-card-meta">${esc(sourceOf(entry))} · ${esc(fmt(entry.date))}</p>
        <h3>${esc(entry.title)}</h3>
        <p class="story-summary">${esc(excerpt(entry.text, 180))}</p>
        <a class="cta-link" href="./article.html?slug=${encodeURIComponent(entry.slug)}">Ouvrir l’archive</a>
      </div>
    </article>
  `;
}

function renderNav() {
  header.innerHTML = `
    <nav class="main-nav" id="mainNav">
      <a href="#top" class="nav-logo" data-scroll-top>Mehomez</a>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false">Menu</button>
      <ul class="nav-links" data-nav-links>
        ${navItems
          .map(([key, label, href]) => {
            const active = key === page || (page === 'work-detail' && key === 'works') || (page === 'article-detail' && key === currentArticleSection);
            return `<li><a class="${active ? 'is-active' : ''}" href="${href}">${esc(label)}</a></li>`;
          })
          .join('')}
      </ul>
    </nav>
  `;
}

function renderFooter() {
  footer.innerHTML = `
    <div class="site-footer-shell">
      <div class="site-footer-inner">
        <div class="footer-brand reveal">
          <h2 class="footer-name">Mehomez</h2>
          <p>Artiste plasticien<br>Peintre · Sculpteur<br>Porto-Novo, Bénin<br>Vit et travaille entre<br>le Bénin et l'Allemagne</p>
        </div>
        <div class="footer-col reveal">
          <h4>Navigation</h4>
          <ul>${navItems.map(([, label, href]) => `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ul>
        </div>
        <div class="footer-col reveal">
          <h4>Contact</h4>
          <ul>${siteData.contact.emails.map((email) => `<li><a href="mailto:${esc(email)}">${esc(email)}</a></li>`).join('')}</ul>
          <h4>Liens</h4>
          <ul><li><a href="https://mehomez.de" target="_blank" rel="noreferrer">mehomez.de</a></li><li><a href="http://www.ouadada.com/" target="_blank" rel="noreferrer">Ouadada</a></li></ul>
        </div>
      </div>
      <div class="footer-bottom"><p>© Copyright Mehomez — Tous droits réservés</p><a href="./contact.html">Contact</a></div>
    </div>
  `;
}

function renderHome() {
  root.innerHTML = `
    <section id="hero">
      <div class="hero-slideshow">${heroSlides.map((url, index) => `<div class="hero-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${url}')"></div>`).join('')}</div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="hero-eyebrow">Artiste plasticien · Porto-Novo · Bénin</p>
        <h1 class="hero-title">Meho<em>mez</em></h1>
        <p class="hero-sub">Peinture · Sculpture · Peinture sculptée</p>
        <div class="hero-line"></div>
      </div>
      <div class="hero-indicators">${heroSlides.map((_, index) => `<span class="hero-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>`).join('')}</div>
    </section>
    <div class="stats-band">
      <div class="stat-item reveal"><span class="stat-number">${works.length}</span><span class="stat-label">Œuvres</span></div>
      <div class="stat-item reveal"><span class="stat-number">${parcoursEntries.length}</span><span class="stat-label">Parcours</span></div>
      <div class="stat-item reveal"><span class="stat-number">${pressEntries.length}</span><span class="stat-label">Presse</span></div>
      <div class="stat-item reveal"><span class="stat-number">${siteData.contact.emails.length}</span><span class="stat-label">Contacts</span></div>
    </div>
    <section id="artiste" class="site-section artist-preview">
      <div class="reveal">
        <p class="section-label">L'artiste</p>
        <div class="artiste-portrait"><img src="${esc(artistPortrait)}" alt="Mehomez" loading="lazy"><div class="artiste-portrait-caption">Ezéchiel Janvier Mehome · Porto-Novo, 1978</div></div>
      </div>
      <div class="reveal">
        <h2 class="artist-title"><span>Ezéchiel Janvier Mehome</span>dit Mehomez</h2>
        <div class="bio-block"><h3>L'œuvre</h3><div class="artist-copy">${paragraphs(sentenceSlice(siteData.artist.text, 0, 3))}</div></div>
        <div class="bio-block"><h3>Biographie</h3><div class="artist-copy">${paragraphs(sentenceSlice(siteData.artist.text, 3, 3) || sentenceSlice(siteData.artist.text, 0, 3))}</div></div>
        <div class="quote-block">"Son regard est sensible à la souffrance de son peuple, et inquiet de son devenir."</div>
      </div>
    </section>
    <div class="section-bg">
      <section class="philosophy-section">
        <p class="philosophy-quote reveal">${esc(quoteOf())}</p>
        <span class="philosophy-attr reveal">Sa philosophie</span>
      </section>
    </div>
    <section id="galerie" class="gallery-section">
      <div class="gallery-header reveal">
        <div><p class="section-label">Galerie</p><h2 class="section-title">Les <em>Œuvres</em></h2></div>
        <div class="gallery-filters"><button class="filter-btn active" data-gallery-filter="all">Tout</button><button class="filter-btn" data-gallery-filter="peinture">Peintures</button><button class="filter-btn" data-gallery-filter="sculpture">Sculptures</button></div>
      </div>
      <div class="gallery-grid" id="homeGalleryGrid">${works.slice(0, 24).map(galleryCard).join('')}</div>
    </section>
    <div class="section-bg">
      <div id="parcours" class="parcours-section">
        <div class="reveal"><p class="section-label">Parcours</p><h2 class="section-title">Événements & <em>Presse</em></h2></div>
        <div class="parcours-grid">
          <div class="archive-col reveal"><h3>Expositions & événements</h3>${parcoursEntries.slice(0, 6).map((entry) => `<a class="event-item" href="./article.html?slug=${encodeURIComponent(entry.slug)}"><div class="event-year">${esc(entry.date.slice(0, 4))}</div><div class="event-details"><h4>${esc(entry.title)}</h4><p>${esc(excerpt(entry.text, 120))}</p></div></a>`).join('')}</div>
          <div class="archive-col reveal"><h3>Revue de presse</h3>${pressEntries.slice(0, 8).map((entry) => `<a class="press-item" href="./article.html?slug=${encodeURIComponent(entry.slug)}"><div><div class="press-source">${esc(sourceOf(entry))} · ${esc(entry.date.slice(0, 4))}</div><div class="press-title">${esc(entry.title)}</div></div></a>`).join('')}</div>
        </div>
      </div>
    </div>
  `;
}

function renderArtistPage() {
  root.innerHTML = `
    ${pageHero("L'artiste", 'Ezéchiel Janvier Mehome', "Né à Porto-Novo en 1978, Mehomez développe une pratique entre le Bénin et l'Allemagne, entre engagement, matière et mémoire.", imageOf(works[2] || works[0]))}
    <section class="site-section artist-page-grid">
      <div class="reveal"><div class="artiste-portrait"><img src="${esc(artistPortrait)}" alt="Mehomez" loading="lazy"><div class="artiste-portrait-caption">Œuvre, matière, engagement</div></div></div>
      <div class="reveal"><h2 class="artist-title"><span>Parcours d'artiste</span>Une voix plastique entre culture, quotidien et mémoire.</h2><div class="bio-block"><h3>Biographie</h3><div class="artist-copy">${siteData.artist.html || paragraphs(siteData.artist.text)}</div></div><div class="bio-block"><h3>Philosophie</h3><p class="section-copy">${esc(quoteOf())}</p></div><a class="button-link" href="./oeuvres.html">Voir les œuvres</a></div>
    </section>
  `;
}

function renderWorksPage() {
  const years = [...new Set(works.map((work) => work.archiveYear).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  root.innerHTML = `
    ${pageHero('Galerie', "Archives d'œuvres", "Peintures, peintures sculptées et sculptures rassemblées dans une galerie plus contemporaine.", imageOf(works[0]))}
    <section class="gallery-section">
      <div class="archive-toolbar reveal">
        <div><p class="section-label">Archives</p><h2 class="section-title">Toute l'œuvre, sans <em>compression</em></h2></div>
        <div class="archive-filters"><button class="filter-btn active" data-works-type="all">Tout</button><button class="filter-btn" data-works-type="peinture">Peintures</button><button class="filter-btn" data-works-type="sculpture">Sculptures</button><select class="archive-select" id="worksYearFilter"><option value="all">Toutes les années</option>${years.map((year) => `<option value="${esc(year)}">${esc(year)}</option>`).join('')}</select><input class="archive-search" id="worksSearch" type="search" placeholder="Titre, technique, dimension"></div>
      </div>
      <div class="results-note reveal" id="worksCount"></div>
      <div class="gallery-grid gallery-grid--wide" id="worksGrid"></div>
    </section>
  `;

  const grid = document.getElementById('worksGrid');
  const year = document.getElementById('worksYearFilter');
  const search = document.getElementById('worksSearch');
  const buttons = [...document.querySelectorAll('[data-works-type]')];
  let type = 'all';

  const update = () => {
    const filtered = works.filter((work) => {
      const typeOk = type === 'all' || workKind(work) === type;
      const yearOk = year.value === 'all' || work.archiveYear === year.value;
      const hay = [work.title, work.text, work.technique, work.dimensions, work.composition].join(' ').toLowerCase();
      const searchOk = !search.value.trim() || hay.includes(search.value.trim().toLowerCase());
      return typeOk && yearOk && searchOk;
    });
    document.getElementById('worksCount').textContent = `${filtered.length} œuvre${filtered.length > 1 ? 's' : ''}`;
    grid.innerHTML = filtered.length ? filtered.map(galleryCard).join('') : '<div class="empty-state">Aucune œuvre ne correspond à ce filtre.</div>';
  };

  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    type = button.dataset.worksType;
    update();
  }));
  year.addEventListener('change', update);
  search.addEventListener('input', update);
  update();
}

function renderWorkDetailPage() {
  const work = works.find((entry) => entry.slug === currentSlug) || works[0];
  const related = works.filter((entry) => entry.slug !== work.slug && workKind(entry) === workKind(work)).slice(0, 6);
  document.title = `${work.title} | Mehomez`;
  root.innerHTML = `
    ${pageHero(workKindLabel(work), esc(work.title), metaOf(work) || "Archive d'œuvre", imageOf(work))}
    <section class="site-section detail-layout">
      <div class="reveal"><div class="detail-image-panel"><img src="${esc(imageOf(work))}" alt="${esc(work.title)}" loading="lazy"><div class="feature-caption">${esc(work.archiveYear || '')}</div></div></div>
      <div class="reveal">
        <h2 class="detail-title"><span>Fiche d’œuvre</span>${esc(work.title)}</h2>
        <div class="detail-card"><h3>Métadonnées</h3><div class="detail-meta"><div class="detail-meta-item"><span class="detail-meta-label">Type</span><span class="detail-meta-value">${esc(workKindLabel(work))}</span></div>${work.archiveYear ? `<div class="detail-meta-item"><span class="detail-meta-label">Année</span><span class="detail-meta-value">${esc(work.archiveYear)}</span></div>` : ''}${work.technique ? `<div class="detail-meta-item"><span class="detail-meta-label">Technique</span><span class="detail-meta-value">${esc(work.technique)}</span></div>` : ''}${work.dimensions ? `<div class="detail-meta-item"><span class="detail-meta-label">Dimensions</span><span class="detail-meta-value">${esc(work.dimensions)}</span></div>` : ''}${work.composition ? `<div class="detail-meta-item"><span class="detail-meta-label">Composition</span><span class="detail-meta-value">${esc(work.composition)}</span></div>` : ''}</div></div>
        <div class="detail-card"><h3>Texte</h3><div class="detail-prose">${work.html || paragraphs(work.text)}</div></div>
        <a class="button-link" href="./oeuvres.html">Retour à la galerie</a>
      </div>
    </section>
    <section class="gallery-section"><div class="gallery-header reveal"><div><p class="section-label">Explorer</p><h2 class="section-title">Œuvres <em>associées</em></h2></div></div><div class="gallery-grid gallery-grid--wide">${related.map(galleryCard).join('')}</div></section>
  `;
}

function renderParcoursPage() {
  const left = parcoursEntries.slice(0, Math.ceil(parcoursEntries.length / 2));
  const right = parcoursEntries.slice(Math.ceil(parcoursEntries.length / 2));
  root.innerHTML = `
    ${pageHero('Parcours', 'Expositions & événements', "Une lecture plus éditoriale du parcours de Mehomez, sans perdre l'archive.", imageOf(parcoursEntries[0]))}
    <div class="section-bg"><div class="parcours-section"><div class="parcours-grid"><div class="archive-col reveal"><h3>Archives récentes</h3>${left.map((entry) => `<a class="event-item" href="./article.html?slug=${encodeURIComponent(entry.slug)}"><div class="event-year">${esc(entry.date.slice(0, 4))}</div><div class="event-details"><h4>${esc(entry.title)}</h4><p>${esc(excerpt(entry.text, 130))}</p></div></a>`).join('')}</div><div class="archive-col reveal"><h3>Autres jalons</h3>${right.map((entry) => `<a class="event-item" href="./article.html?slug=${encodeURIComponent(entry.slug)}"><div class="event-year">${esc(entry.date.slice(0, 4))}</div><div class="event-details"><h4>${esc(entry.title)}</h4><p>${esc(excerpt(entry.text, 130))}</p></div></a>`).join('')}</div></div></div></div>
  `;
}

function renderPressPage() {
  root.innerHTML = `
    ${pageHero('Presse', 'Revue de presse', "Une traversée plus élégante des articles, annonces et traces publiques autour du travail de Mehomez.", imageOf(pressEntries[0]))}
    <section class="site-section"><div class="story-grid">${pressEntries.map(storyCard).join('')}</div></section>
  `;
}

function renderArticleDetailPage() {
  const entry = currentArticle || pressEntries[0] || parcoursEntries[0];
  const siblings = articleEntries.filter((item) => item.slug !== entry.slug).slice(0, 4);
  document.title = `${entry.title} | Mehomez`;
  root.innerHTML = `
    ${pageHero(entry.type === 'press' ? 'Presse' : 'Parcours', esc(entry.title), `${sourceOf(entry)} · ${fmt(entry.date)}`, imageOf(entry))}
    <section class="site-section detail-layout">
      <div class="reveal"><div class="detail-image-panel"><img src="${esc(imageOf(entry))}" alt="${esc(entry.title)}" loading="lazy"><div class="feature-caption">${esc(sourceOf(entry))}</div></div></div>
      <div class="reveal"><h2 class="detail-title"><span>${entry.type === 'press' ? 'Article' : 'Archive'}</span>${esc(entry.title)}</h2><div class="detail-card"><h3>Repères</h3><div class="detail-meta"><div class="detail-meta-item"><span class="detail-meta-label">Source</span><span class="detail-meta-value">${esc(sourceOf(entry))}</span></div><div class="detail-meta-item"><span class="detail-meta-label">Date</span><span class="detail-meta-value">${esc(fmt(entry.date))}</span></div></div></div><div class="detail-card"><h3>Texte</h3><div class="detail-prose">${entry.html || paragraphs(entry.text)}</div></div><a class="button-link" href="${entry.type === 'press' ? './presse.html' : './parcours.html'}">Retour aux archives</a></div>
    </section>
    <section class="site-section"><div class="story-grid">${siblings.map(storyCard).join('')}</div></section>
  `;
}

function renderContactPage() {
  root.innerHTML = `
    ${pageHero('Contact', 'Prendre contact', 'Coordonnées publiques de l’artiste et liens utiles.', imageOf(works[4] || works[0]))}
    <section class="site-section contact-grid">
      <div class="contact-card reveal"><p class="section-label">Écrire</p><h2 class="section-title">L’artiste</h2>${siteData.contact.emails.map((email) => `<p><a href="mailto:${esc(email)}">${esc(email)}</a></p>`).join('')}</div>
      <div class="contact-card reveal"><p class="section-label">Ressources</p><h2 class="section-title">Liens utiles</h2><p><a href="https://mehomez.de" target="_blank" rel="noreferrer">Site web</a></p><p><a href="http://www.ouadada.com/" target="_blank" rel="noreferrer">Ouadada</a></p><p><a href="http://creapage.net/" target="_blank" rel="noreferrer">Creapage</a></p></div>
      <div class="contact-card reveal"><p class="section-label">Ancrage</p><h2 class="section-title">Présence</h2><p>Porto-Novo, Bénin</p><p>Vit et travaille entre le Bénin et l’Allemagne.</p></div>
    </section>
  `;
}

function renderPage() {
  if (page === 'home') renderHome();
  else if (page === 'artist') renderArtistPage();
  else if (page === 'works') renderWorksPage();
  else if (page === 'work-detail') renderWorkDetailPage();
  else if (page === 'parcours') renderParcoursPage();
  else if (page === 'press') renderPressPage();
  else if (page === 'article-detail') renderArticleDetailPage();
  else if (page === 'contact') renderContactPage();
  else root.innerHTML = '<section class="site-section"><div class="empty-state">Page non reconnue.</div></section>';
}

function setupNav() {
  const nav = document.getElementById('mainNav');
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');
  const logo = document.querySelector('[data-scroll-top]');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links?.classList.toggle('open');
  });
  logo?.addEventListener('click', (event) => {
    event.preventDefault();
    toggle?.setAttribute('aria-expanded', 'false');
    links?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  window.addEventListener('scroll', () => nav?.classList.toggle('is-scrolled', window.scrollY > 100));
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function setupCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });
  const animate = () => {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animate);
  };
  animate();
  const selector = 'a, button, .gallery-item, select, input';
  document.addEventListener('mouseover', (event) => {
    if (event.target.closest(selector)) {
      ring.style.transform = 'translate(-50%, -50%) scale(1.8)';
      ring.style.borderColor = 'var(--ochre)';
    }
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target.closest(selector)) {
      ring.style.transform = 'translate(-50%, -50%) scale(1)';
      ring.style.borderColor = 'rgba(200, 122, 42, 0.5)';
    }
  });
}

function setupHeroSlides() {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  if (!slides.length || !dots.length) return;
  let current = 0;
  const go = (next) => {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (next + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => go(index)));
  window.setInterval(() => go(current + 1), 5000);
}

function setupHomeFilters() {
  const buttons = [...document.querySelectorAll('[data-gallery-filter]')];
  if (!buttons.length) return;
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.galleryFilter;
    document.querySelectorAll('#homeGalleryGrid .gallery-item').forEach((card) => {
      const work = works.find((entry) => entry.slug === card.dataset.slug);
      card.classList.toggle('hidden', !(filter === 'all' || (work && workKind(work) === filter)));
    });
  }));
}

function setupLightbox() {
  const shell = document.createElement('div');
  shell.id = 'lightbox';
  shell.className = 'lightbox';
  shell.innerHTML = `<div class="lightbox-inner"><button class="lightbox-close" type="button" data-lightbox-close>✕</button><img class="lightbox-img" id="lightboxImg" src="" alt=""><div class="lightbox-info"><h3 class="lightbox-title" id="lightboxTitle"></h3><div class="lightbox-details" id="lightboxDetails"></div><div class="lightbox-actions" id="lightboxActions"></div></div></div>`;
  document.body.append(shell);
  const close = () => {
    shell.classList.remove('open');
    document.body.style.overflow = '';
  };
  shell.addEventListener('click', (event) => {
    if (event.target === shell || event.target.closest('[data-lightbox-close]')) close();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
  document.addEventListener('click', (event) => {
    const card = event.target.closest('[data-lightbox-kind="work"]');
    if (!card) return;
    const work = works.find((entry) => entry.slug === card.dataset.slug);
    if (!work) return;
    document.getElementById('lightboxImg').src = imageOf(work);
    document.getElementById('lightboxImg').alt = work.title;
    document.getElementById('lightboxTitle').textContent = work.title;
    document.getElementById('lightboxDetails').textContent = metaOf(work) || work.archiveYear || '';
    document.getElementById('lightboxActions').innerHTML = `<a class="button-link" href="./oeuvre.html?slug=${encodeURIComponent(work.slug)}">Voir la fiche</a>`;
    shell.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

renderNav();
renderPage();
renderFooter();
setupNav();
setupReveal();
setupCursor();
setupHeroSlides();
setupHomeFilters();
setupLightbox();
