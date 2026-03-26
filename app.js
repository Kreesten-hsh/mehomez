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
  ['home', 'Accueil', './index.html'],
  ['artist', "L'artiste", './artiste.html'],
  ['works', 'Galerie', './oeuvres.html'],
  ['parcours', 'Parcours', './parcours.html'],
  ['press', 'Presse', './presse.html'],
  ['contact', 'Contact', './contact.html'],
];

const heroSlides = [1, 2, 3, 4, 5, 6, 7].map(
  (n) => `https://mehomez.de/wp-content/themes/mehomez/images/diapo-accueil/0${n}.jpg`,
);

const esc = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fmt = (value = '') =>
  value
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))
    : '';

const excerpt = (text = '', max = 180) => {
  const compact = text.replace(/\s+/g, ' ').trim();
  return compact.length <= max ? compact : `${compact.slice(0, max).trim()}...`;
};

const sentenceBlock = (text = '', count = 2) => {
  const chunks = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const selected = chunks.slice(0, count);
  return selected.join('. ') + (selected.length ? '.' : '');
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

const normalizeKey = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

const assetUrl = (asset, size = 'large') => {
  if (!asset) return '';
  if (typeof asset === 'string') return asset;
  return asset[size] || asset.large || asset.medium || asset.full || asset.thumbnail || '';
};

const ownImageOf = (entry, size = 'large') => assetUrl(entry?.image, size) || entry?.images?.[0] || '';

const imageOf = (entry, size = 'large', allowFallback = true) => {
  const own = ownImageOf(entry, size);
  if (own) return own;
  if (!allowFallback) return '';
  return assetUrl(siteData.artist.portrait, size) || heroSlides[0];
};

const imgTag = (
  entry,
  { size = 'medium', alt = '', loading = 'lazy', fetchpriority = 'auto', className = '', allowFallback = true } = {},
) => {
  const src = imageOf(entry, size, allowFallback);
  if (!src) return '';
  const classAttr = className ? ` class="${className}"` : '';
  const fetchAttr = fetchpriority !== 'auto' ? ` fetchpriority="${fetchpriority}"` : '';
  return `<img${classAttr} src="${esc(src)}" alt="${esc(alt)}" loading="${loading}" decoding="async"${fetchAttr}>`;
};

const mediaTag = (
  entry,
  {
    size = 'medium',
    alt = '',
    loading = 'lazy',
    fetchpriority = 'auto',
    className = '',
    placeholderLabel = '',
  } = {},
) => {
  const image = imgTag(entry, { size, alt, loading, fetchpriority, className, allowFallback: false });
  if (image) return image;
  return `<div class="media-placeholder"><span>${esc(placeholderLabel || sourceOf(entry))}</span></div>`;
};

const workKind = (work) => (work.type === 'work-sculpture' ? 'sculpture' : 'peinture');
const workKindLabel = (work) => (workKind(work) === 'sculpture' ? 'Sculpture' : 'Peinture sculptée');
const sourceOf = (entry) => {
  const title = entry?.title || '';
  if (title.includes(':')) return title.split(':')[0].trim();
  if (title.includes(',')) return title.split(',')[0].trim();
  return entry?.type === 'press' ? 'Revue de presse' : 'Infos & Parcours';
};
const metaOf = (work) =>
  [work.composition, work.technique ? `Technique ${work.technique}` : '', work.dimensions, work.archiveYear]
    .filter(Boolean)
    .join(' · ');

const artistPortraitAsset = { image: siteData.artist.portrait };
const currentArticle = articleEntries.find((entry) => entry.slug === currentSlug) || null;
const currentArticleSection = currentArticle ? (currentArticle.type === 'press' ? 'press' : 'parcours') : null;
const quoteOf = () => (siteData.artist.text.match(/L'artiste tire son inspiration[^.]+\./i)?.[0] || sentenceBlock(siteData.artist.text, 1));

const extractSectionsFromHtml = (html = '') => {
  if (typeof DOMParser === 'undefined' || !html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const wrapper = doc.body.firstElementChild;
  if (!wrapper) return [];

  const sections = [];
  let current = null;

  [...wrapper.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && /^H[1-6]$/.test(node.tagName)) {
      current = {
        title: node.textContent.trim(),
        key: normalizeKey(node.textContent.trim()),
        html: '',
        text: '',
      };
      sections.push(current);
      return;
    }

    if (!current) return;
    current.html += node.outerHTML || node.textContent || '';
    current.text += `${node.textContent || ''}\n`;
  });

  return sections.map((section) => ({
    ...section,
    text: section.text.replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim(),
  }));
};

const artistSections = extractSectionsFromHtml(siteData.artist.html);
const artistWorkSection =
  artistSections.find((section) => section.key === normalizeKey("L'œuvre")) ||
  artistSections[0] ||
  null;
const artistBioSection =
  artistSections.find((section) => section.key === normalizeKey("L'artiste")) ||
  artistSections[1] ||
  null;
const artistPhilosophySection =
  artistSections.find((section) => section.key === normalizeKey('Sa philosophie')) ||
  artistSections[2] ||
  null;

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
      ${imgTag(work, { size: 'medium', alt: work.title, loading: 'lazy', fetchpriority: 'low' })}
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
      <div class="story-card-image">
        ${mediaTag(entry, {
          size: 'medium',
          alt: entry.title,
          loading: 'lazy',
          fetchpriority: 'low',
          placeholderLabel: sourceOf(entry),
        })}
      </div>
      <div class="story-card-body">
        <p class="story-card-meta">${esc(sourceOf(entry))} · ${esc(fmt(entry.date))}</p>
        <h3>${esc(entry.title)}</h3>
        <p class="story-summary">${esc(excerpt(entry.text, 180))}</p>
        <a class="cta-link" href="./article.html?slug=${encodeURIComponent(entry.slug)}">Ouvrir l'archive</a>
      </div>
    </article>
  `;
}

function pressLeadCard(entry) {
  if (!entry) return '';

  return `
    <article class="press-lead-card reveal">
      <a class="press-lead-media" href="./article.html?slug=${encodeURIComponent(entry.slug)}" aria-label="Lire ${esc(entry.title)}">
        ${mediaTag(entry, {
          size: 'full',
          alt: entry.title,
          loading: 'eager',
          fetchpriority: 'high',
          placeholderLabel: sourceOf(entry),
        })}
      </a>
      <div class="press-lead-body">
        <p class="story-card-meta">${esc(sourceOf(entry))} · ${esc(fmt(entry.date))}</p>
        <h2>${esc(entry.title)}</h2>
        <p class="story-summary">${esc(excerpt(entry.text, 280))}</p>
        <a class="button-link" href="./article.html?slug=${encodeURIComponent(entry.slug)}">Lire l'archive</a>
      </div>
    </article>
  `;
}

function pressArchiveItem(entry) {
  return `
    <article class="press-row reveal">
      <a class="press-row-media" href="./article.html?slug=${encodeURIComponent(entry.slug)}" aria-label="Lire ${esc(entry.title)}">
        ${mediaTag(entry, {
          size: 'medium',
          alt: entry.title,
          loading: 'lazy',
          fetchpriority: 'low',
          placeholderLabel: sourceOf(entry),
        })}
      </a>
      <div class="press-row-body">
        <p class="story-card-meta">${esc(sourceOf(entry))} · ${esc(fmt(entry.date))}</p>
        <h3>${esc(entry.title)}</h3>
        <p class="story-summary">${esc(excerpt(entry.text, 170))}</p>
        <a class="cta-link" href="./article.html?slug=${encodeURIComponent(entry.slug)}">Ouvrir l'archive</a>
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
            const active =
              key === page ||
              (page === 'work-detail' && key === 'works') ||
              (page === 'article-detail' && key === currentArticleSection);
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
      <div class="hero-slideshow">
        ${heroSlides
          .map((url, index) => `<div class="hero-slide ${index === 0 ? 'active' : ''}" ${index === 0 ? `style="background-image:url('${url}')"` : `data-bg="${url}"`}></div>`)
          .join('')}
      </div>
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
        <div class="artiste-portrait">
          ${imgTag(artistPortraitAsset, { size: 'full', alt: 'Portrait de Mehomez', loading: 'eager', fetchpriority: 'high' })}
          <div class="artiste-portrait-caption">Ezéchiel Janvier Mehome · Porto-Novo, 1978</div>
        </div>
      </div>
      <div class="reveal">
        <h2 class="artist-title"><span>Ezéchiel Janvier Mehome</span>dit Mehomez</h2>
        <div class="bio-block"><h3>L'œuvre</h3><div class="artist-copy">${artistWorkSection?.html || paragraphs(sentenceSlice(siteData.artist.text, 0, 4))}</div></div>
        <div class="bio-block"><h3>Biographie</h3><div class="artist-copy">${artistBioSection?.html || paragraphs(sentenceSlice(siteData.artist.text, 4, 4))}</div></div>
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
  const artistLead =
    sentenceSlice(artistBioSection?.text || siteData.artist.text, 0, 3) ||
    sentenceSlice(siteData.artist.text, 0, 3);
  const philosophyLead =
    artistPhilosophySection?.text ||
    `${quoteOf()}\n${sentenceSlice(siteData.artist.text, 7, 2)}`;

  root.innerHTML = `
    ${pageHero("L'artiste", 'Ezéchiel Janvier Mehome', "Né à Porto-Novo en 1978, Mehomez développe une pratique entre le Bénin et l'Allemagne, entre engagement, matière et mémoire.", imageOf(works[2] || works[0], 'large'))}
    <section class="site-section artist-intro-grid">
      <div class="reveal">
        <div class="artiste-portrait artiste-portrait--feature">
          ${imgTag(artistPortraitAsset, { size: 'full', alt: 'Portrait de Mehomez', loading: 'eager', fetchpriority: 'high' })}
          <div class="artiste-portrait-caption">Œuvre, matière, engagement</div>
        </div>
      </div>
      <div class="reveal artist-intro-copy">
        <p class="section-label">Présentation</p>
        <h2 class="artist-title"><span>Ezéchiel Janvier Mehome</span>Une voix plastique entre culture, quotidien et mémoire.</h2>
        <p class="section-copy">${esc(artistLead)}</p>
        <div class="artist-facts">
          <div class="artist-fact"><span class="artist-fact-label">Né à</span><strong>Porto-Novo, 1978</strong></div>
          <div class="artist-fact"><span class="artist-fact-label">Pratique</span><strong>Peinture sculptée, peinture, sculpture</strong></div>
          <div class="artist-fact"><span class="artist-fact-label">Ancrage</span><strong>Bénin · Allemagne</strong></div>
        </div>
      </div>
    </section>
    <section class="site-section artist-story-grid">
      <article class="artist-story-card reveal">
        <p class="mini-label">L'œuvre</p>
        <div class="artist-story-copy">${artistWorkSection?.html || paragraphs(sentenceSlice(siteData.artist.text, 0, 4))}</div>
      </article>
      <article class="artist-story-card reveal">
        <p class="mini-label">Biographie</p>
        <div class="artist-story-copy">${artistBioSection?.html || paragraphs(sentenceSlice(siteData.artist.text, 4, 4))}</div>
      </article>
      <article class="artist-story-card artist-story-card--quote reveal">
        <p class="mini-label">Sa philosophie</p>
        <div class="artist-story-copy">${artistPhilosophySection?.html || paragraphs(philosophyLead)}</div>
      </article>
    </section>
    <div class="section-bg">
      <section class="site-section artist-closing">
        <p class="philosophy-quote reveal">${esc(quoteOf())}</p>
        <div class="artist-closing-actions reveal">
          <a class="button-link" href="./oeuvres.html">Voir les œuvres</a>
          <a class="button-link" href="./contact.html">Contacter l'artiste</a>
        </div>
      </section>
    </div>
  `;
}

function renderWorksPage() {
  const years = [...new Set(works.map((work) => work.archiveYear).filter(Boolean))].sort((a, b) => b.localeCompare(a));

  root.innerHTML = `
    ${pageHero('Galerie', "Archives d'œuvres", "Peintures, peintures sculptées et sculptures rassemblées dans une galerie plus contemporaine.", imageOf(works[0], 'large'))}
    <section class="gallery-section">
      <div class="archive-toolbar reveal">
        <div class="archive-head">
          <p class="section-label">Archives</p>
          <h2 class="section-title">Toute l'œuvre, sans <em>compression</em></h2>
          <p class="section-copy">Affinez la lecture par type, année et mots-clés sans perdre la densité de l'archive.</p>
        </div>
        <div class="filters-panel">
          <div class="filter-group">
            <span class="filter-group-label">Type</span>
            <div class="filter-pill-group">
              <button class="filter-btn active" data-works-type="all">Tout</button>
              <button class="filter-btn" data-works-type="peinture">Peintures</button>
              <button class="filter-btn" data-works-type="sculpture">Sculptures</button>
            </div>
          </div>
          <div class="filter-group filter-group--fields">
            <label class="filter-field">
              <span>Année</span>
              <select class="archive-select" id="worksYearFilter">
                <option value="all">Toutes les années</option>
                ${years.map((year) => `<option value="${esc(year)}">${esc(year)}</option>`).join('')}
              </select>
            </label>
            <label class="filter-field filter-field--search">
              <span>Recherche</span>
              <input class="archive-search" id="worksSearch" type="search" placeholder="Titre, technique, dimension">
            </label>
          </div>
        </div>
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
      const haystack = [work.title, work.text, work.technique, work.dimensions, work.composition].join(' ').toLowerCase();
      const searchOk = !search.value.trim() || haystack.includes(search.value.trim().toLowerCase());
      return typeOk && yearOk && searchOk;
    });

    document.getElementById('worksCount').textContent = `${filtered.length} œuvre${filtered.length > 1 ? 's' : ''}`;
    grid.innerHTML = filtered.length
      ? filtered.map(galleryCard).join('')
      : '<div class="empty-state">Aucune œuvre ne correspond à ce filtre.</div>';

    grid.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
  };

  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      type = button.dataset.worksType;
      update();
    }),
  );

  year.addEventListener('change', update);
  search.addEventListener('input', update);
  update();
}

function renderWorkDetailPage() {
  const work = works.find((entry) => entry.slug === currentSlug) || works[0];
  const related = works.filter((entry) => entry.slug !== work.slug && workKind(entry) === workKind(work)).slice(0, 6);
  document.title = `${work.title} | Mehomez`;

  root.innerHTML = `
    ${pageHero(workKindLabel(work), esc(work.title), metaOf(work) || "Archive d'œuvre", imageOf(work, 'large'))}
    <section class="site-section detail-layout">
      <div class="reveal"><div class="detail-image-panel">${imgTag(work, { size: 'full', alt: work.title, loading: 'eager', fetchpriority: 'high' })}<div class="feature-caption">${esc(work.archiveYear || '')}</div></div></div>
      <div class="reveal">
        <h2 class="detail-title"><span>Fiche d'œuvre</span>${esc(work.title)}</h2>
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
    ${pageHero('Parcours', 'Expositions & événements', "Une lecture plus éditoriale du parcours de Mehomez, sans perdre l'archive.", imageOf(parcoursEntries[0], 'large'))}
    <div class="section-bg"><div class="parcours-section"><div class="parcours-grid"><div class="archive-col reveal"><h3>Archives récentes</h3>${left.map((entry) => `<a class="event-item" href="./article.html?slug=${encodeURIComponent(entry.slug)}"><div class="event-year">${esc(entry.date.slice(0, 4))}</div><div class="event-details"><h4>${esc(entry.title)}</h4><p>${esc(excerpt(entry.text, 130))}</p></div></a>`).join('')}</div><div class="archive-col reveal"><h3>Autres jalons</h3>${right.map((entry) => `<a class="event-item" href="./article.html?slug=${encodeURIComponent(entry.slug)}"><div class="event-year">${esc(entry.date.slice(0, 4))}</div><div class="event-details"><h4>${esc(entry.title)}</h4><p>${esc(excerpt(entry.text, 130))}</p></div></a>`).join('')}</div></div></div></div>
  `;
}

function renderPressPage() {
  const featured = pressEntries[0] || null;
  const archive = pressEntries.slice(1);
  const years = [...new Set(pressEntries.map((entry) => entry.date?.slice(0, 4)).filter(Boolean))];

  root.innerHTML = `
    ${pageHero('Presse', 'Revue de presse', "Une traversée plus élégante des articles, annonces et traces publiques autour du travail de Mehomez.", imageOf(featured, 'large'))}
    <section class="site-section press-shell">
      <div class="press-overview reveal">
        <div>
          <p class="section-label">Archives</p>
          <h2 class="section-title">Articles, annonces et traces <em>publiques</em></h2>
        </div>
        <p class="section-copy">La revue de presse reste fidèle aux titres, dates et sources rendus publics sur le site original, avec une lecture plus nette sur desktop comme sur mobile.</p>
        <div class="press-stats">
          <div class="artist-fact"><span class="artist-fact-label">Entrées</span><strong>${pressEntries.length}</strong></div>
          <div class="artist-fact"><span class="artist-fact-label">Période</span><strong>${years[years.length - 1] || ''} - ${years[0] || ''}</strong></div>
          <div class="artist-fact"><span class="artist-fact-label">Dernière trace</span><strong>${featured ? fmt(featured.date) : ''}</strong></div>
        </div>
      </div>
      ${pressLeadCard(featured)}
    </section>
    <section class="site-section press-archive">
      <div class="archive-toolbar reveal">
        <div class="archive-head">
          <p class="section-label">Lecture continue</p>
          <h2 class="section-title">Tout l'historique <em>presse</em></h2>
        </div>
      </div>
      <div class="press-list">${archive.map(pressArchiveItem).join('')}</div>
    </section>
  `;
}

function renderArticleDetailPage() {
  const entry = currentArticle || pressEntries[0] || parcoursEntries[0];
  const siblings = articleEntries.filter((item) => item.slug !== entry.slug).slice(0, 4);
  document.title = `${entry.title} | Mehomez`;

  root.innerHTML = `
    ${pageHero(entry.type === 'press' ? 'Presse' : 'Parcours', esc(entry.title), `${sourceOf(entry)} · ${fmt(entry.date)}`, imageOf(entry, 'large'))}
    <section class="site-section detail-layout">
      <div class="reveal"><div class="detail-image-panel">${mediaTag(entry, { size: 'full', alt: entry.title, loading: 'eager', fetchpriority: 'high', placeholderLabel: sourceOf(entry) })}<div class="feature-caption">${esc(sourceOf(entry))}</div></div></div>
      <div class="reveal"><h2 class="detail-title"><span>${entry.type === 'press' ? 'Article' : 'Archive'}</span>${esc(entry.title)}</h2><div class="detail-card"><h3>Repères</h3><div class="detail-meta"><div class="detail-meta-item"><span class="detail-meta-label">Source</span><span class="detail-meta-value">${esc(sourceOf(entry))}</span></div><div class="detail-meta-item"><span class="detail-meta-label">Date</span><span class="detail-meta-value">${esc(fmt(entry.date))}</span></div></div></div><div class="detail-card"><h3>Texte</h3><div class="detail-prose">${entry.html || paragraphs(entry.text)}</div></div><a class="button-link" href="${entry.type === 'press' ? './presse.html' : './parcours.html'}">Retour aux archives</a></div>
    </section>
    <section class="site-section"><div class="story-grid">${siblings.map(storyCard).join('')}</div></section>
  `;
}

function renderContactPage() {
  root.innerHTML = `
    ${pageHero('Contact', 'Prendre contact', "Coordonnées publiques de l'artiste, liens utiles et formulaire de prise de contact.", imageOf(works[4] || works[0], 'large'))}
    <section class="site-section contact-layout">
      <div class="contact-grid">
        <div class="contact-card reveal"><p class="section-label">Écrire</p><h2 class="section-title">L'artiste</h2>${siteData.contact.emails.map((email) => `<p><a href="mailto:${esc(email)}">${esc(email)}</a></p>`).join('')}</div>
        <div class="contact-card reveal"><p class="section-label">Ressources</p><h2 class="section-title">Liens utiles</h2><p><a href="https://mehomez.de" target="_blank" rel="noreferrer">Site web</a></p><p><a href="http://www.ouadada.com/" target="_blank" rel="noreferrer">Ouadada</a></p><p><a href="http://creapage.net/" target="_blank" rel="noreferrer">Creapage</a></p></div>
        <div class="contact-card reveal"><p class="section-label">Ancrage</p><h2 class="section-title">Présence</h2><p>Porto-Novo, Bénin</p><p>Vit et travaille entre le Bénin et l'Allemagne.</p></div>
      </div>
      <div class="contact-form-card reveal">
        <p class="section-label">Formulaire</p>
        <h2 class="section-title">Envoyer un message</h2>
        <form class="contact-form" data-contact-form>
          <label class="form-field"><span>Nom</span><input type="text" name="name" required></label>
          <label class="form-field"><span>Email</span><input type="email" name="email" required></label>
          <label class="form-field"><span>Objet</span><input type="text" name="subject" required></label>
          <label class="form-field form-field--full"><span>Message</span><textarea name="message" rows="6" required></textarea></label>
          <button class="form-submit" type="submit">Préparer l'email</button>
          <p class="form-note">Le formulaire ouvre votre messagerie avec le message prérempli.</p>
          <p class="form-status" data-contact-status aria-live="polite"></p>
        </form>
      </div>
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
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

function setupCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

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

  const selector = 'a, button, .gallery-item, select, input, textarea';

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

function ensureSlideImage(slide) {
  if (!slide || slide.style.backgroundImage) return;
  const bg = slide.dataset.bg;
  if (!bg) return;
  slide.style.backgroundImage = `url('${bg}')`;
  slide.removeAttribute('data-bg');
}

function setupHeroSlides() {
  const slides = [...document.querySelectorAll('.hero-slide')];
  const dots = [...document.querySelectorAll('.hero-dot')];
  if (!slides.length || !dots.length) return;

  ensureSlideImage(slides[0]);
  ensureSlideImage(slides[1]);

  let current = 0;
  const go = (next) => {
    const target = (next + slides.length) % slides.length;
    ensureSlideImage(slides[target]);
    ensureSlideImage(slides[(target + 1) % slides.length]);
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = target;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => go(index)));
  window.setInterval(() => go(current + 1), 5000);
}

function setupHomeFilters() {
  const buttons = [...document.querySelectorAll('[data-gallery-filter]')];
  if (!buttons.length) return;

  buttons.forEach((button) =>
    button.addEventListener('click', () => {
      buttons.forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.galleryFilter;
      document.querySelectorAll('#homeGalleryGrid .gallery-item').forEach((card) => {
        const work = works.find((entry) => entry.slug === card.dataset.slug);
        card.classList.toggle('hidden', !(filter === 'all' || (work && workKind(work) === filter)));
      });
    }),
  );
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });

  document.addEventListener('click', (event) => {
    const card = event.target.closest('[data-lightbox-kind="work"]');
    if (!card) return;

    const work = works.find((entry) => entry.slug === card.dataset.slug);
    if (!work) return;

    document.getElementById('lightboxImg').src = imageOf(work, 'full');
    document.getElementById('lightboxImg').alt = work.title;
    document.getElementById('lightboxTitle').textContent = work.title;
    document.getElementById('lightboxDetails').textContent = metaOf(work) || work.archiveYear || '';
    document.getElementById('lightboxActions').innerHTML = `<a class="button-link" href="./oeuvre.html?slug=${encodeURIComponent(work.slug)}">Voir la fiche</a>`;
    shell.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
}

function setupBackToTop() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'back-to-top';
  button.setAttribute('aria-label', 'Retour en haut');
  button.innerHTML = '↑';
  document.body.append(button);

  const sync = () => button.classList.toggle('is-visible', window.scrollY > 520);
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', sync, { passive: true });
  sync();
}

function setupContactForm() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const status = form.querySelector('[data-contact-status]');
  const targetEmail = siteData.contact.emails[0] || '';

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || '').trim();
    const message = String(formData.get('message') || '').trim();

    const body = [`Nom: ${name}`, `Email: ${email}`, '', message].join('\n');
    const mailto = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Ouverture de votre messagerie...';
    window.location.href = mailto;
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
setupBackToTop();
setupContactForm();
