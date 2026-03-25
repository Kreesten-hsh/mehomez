import { siteData } from './data/mehomez-content.js';

const root = document.querySelector('[data-page-root]');
const header = document.querySelector('[data-site-header]');
const footer = document.querySelector('[data-site-footer]');
const currentPage = document.body.dataset.page;
const themeStorageKey = 'mehomez-theme';

const pageFileByKey = {
  home: 'mehomez-portfolio.html',
  artist: 'artiste.html',
  works: 'oeuvres.html',
  'work-detail': 'oeuvre.html',
  parcours: 'parcours.html',
  press: 'presse.html',
  'article-detail': 'article.html',
  contact: 'contact.html',
};

const works = siteData.works || [];
const pressEntries = siteData.press || [];
const parcoursEntries = siteData.parcours || [];
const pageEntries = [...pressEntries, ...parcoursEntries];

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatShortDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function excerpt(text = '', max = 220) {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trim()}...`;
}

function sentenceBlock(text = '', sentences = 2) {
  const chunks = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
  return chunks.slice(0, sentences).join('. ') + (chunks.length ? '.' : '');
}

function getLeadImage(entry) {
  return entry?.images?.[0] || siteData.artist.portrait || '';
}

function getWorkTypeLabel(work) {
  return work.type === 'work-sculpture' ? 'Sculpture' : 'Peinture / peinture sculptée';
}

function inferSource(entry) {
  const title = entry?.title || '';
  if (title.includes(':')) return title.split(':')[0].trim();
  if (title.includes(',')) return title.split(',')[0].trim();
  return entry.type === 'press' ? 'Revue de presse' : 'Infos & Parcours';
}

function pageHero({ eyebrow, title, lead, image, meta = [] }) {
  const imageStyle = image ? `style="background-image:url('${escapeHtml(image)}')"` : '';
  return `
    <section class="hero section-shell">
      <div class="hero__grid">
        <div class="hero__copy reveal">
          <p class="eyebrow">${escapeHtml(eyebrow)}</p>
          <h1>${escapeHtml(title)}</h1>
          <p class="lede">${escapeHtml(lead)}</p>
          ${
            meta.length
              ? `<ul class="meta-strip">${meta
                  .map((item) => `<li>${escapeHtml(item)}</li>`)
                  .join('')}</ul>`
              : ''
          }
        </div>
        <div class="hero__visual reveal" ${imageStyle}>
          <div class="hero__visual-overlay">
            <span class="hero__visual-label">Portfolio reconstitué</span>
            <strong>${escapeHtml(siteData.site.title)}</strong>
          </div>
        </div>
      </div>
    </section>
  `;
}

function sectionHeading({ eyebrow, title, lead }) {
  return `
    <div class="section-heading reveal">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h2>${escapeHtml(title)}</h2>
      <p class="section-lede">${escapeHtml(lead)}</p>
    </div>
  `;
}

function workCard(work, featured = false) {
  const image = getLeadImage(work);
  const chips = [getWorkTypeLabel(work), work.archiveYear].filter(Boolean);
  return `
    <article class="work-card ${featured ? 'work-card--featured' : ''} reveal">
      <a class="work-card__media" href="./oeuvre.html?slug=${encodeURIComponent(work.slug)}">
        ${
          image
            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(work.title)}" loading="lazy" />`
            : '<div class="media-fallback">Archive visuelle</div>'
        }
      </a>
      <div class="work-card__body">
        <div class="chip-list">
          ${chips.map((chip) => `<span class="chip">${escapeHtml(chip)}</span>`).join('')}
        </div>
        <h3><a href="./oeuvre.html?slug=${encodeURIComponent(work.slug)}">${escapeHtml(work.title)}</a></h3>
        <p>${escapeHtml(excerpt(work.composition || work.excerpt || work.text, featured ? 180 : 120))}</p>
        <dl class="card-meta">
          ${work.technique ? `<div><dt>Technique</dt><dd>${escapeHtml(work.technique)}</dd></div>` : ''}
          ${work.dimensions ? `<div><dt>Dimensions</dt><dd>${escapeHtml(work.dimensions)}</dd></div>` : ''}
        </dl>
      </div>
    </article>
  `;
}

function storyCard(entry, detailHref = './article.html') {
  const image = getLeadImage(entry);
  return `
    <article class="story-card reveal">
      <a class="story-card__media" href="${detailHref}?slug=${encodeURIComponent(entry.slug)}">
        ${
          image
            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(entry.title)}" loading="lazy" />`
            : '<div class="media-fallback">Archive</div>'
        }
      </a>
      <div class="story-card__body">
        <p class="story-card__meta">${escapeHtml(inferSource(entry))} · ${escapeHtml(formatShortDate(entry.date))}</p>
        <h3><a href="${detailHref}?slug=${encodeURIComponent(entry.slug)}">${escapeHtml(entry.title)}</a></h3>
        <p>${escapeHtml(excerpt(entry.excerpt || entry.text, 160))}</p>
      </div>
    </article>
  `;
}

function collectionLink({ title, text, href, count }) {
  return `
    <a class="collection-link reveal" href="${href}">
      <span class="collection-link__count">${escapeHtml(String(count))}</span>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </a>
  `;
}

function detailMetaGrid(items) {
  const visible = items.filter((item) => item.value);
  return `
    <dl class="detail-meta-grid">
      ${visible
        .map(
          (item) => `
            <div>
              <dt>${escapeHtml(item.label)}</dt>
              <dd>${escapeHtml(item.value)}</dd>
            </div>
          `,
        )
        .join('')}
    </dl>
  `;
}

function prosePanel(html = '', fallbackText = '') {
  const content = html?.trim() ? html : `<p>${escapeHtml(fallbackText)}</p>`;
  return `<div class="panel prose reveal">${content}</div>`;
}

function renderHeader() {
  const currentFile = pageFileByKey[currentPage] || '';
  header.innerHTML = `
    <div class="site-header__inner">
      <a class="brand" href="./mehomez-portfolio.html">
        <span class="brand__mark">M</span>
        <span class="brand__text">Mehomez</span>
      </a>
      <nav class="site-nav" aria-label="Navigation principale">
        ${siteData.site.navigation
          .map((item) => {
            const fileName = item.href.replace('./', '');
            const active = currentFile === fileName ? 'is-active' : '';
            return `<a class="${active}" href="${item.href}">${escapeHtml(item.label)}</a>`;
          })
          .join('')}
      </nav>
      <div class="site-header__actions">
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Changer le thème">
          <span data-theme-toggle-label>Mode sombre</span>
        </button>
        <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="mobile-nav">
          Menu
        </button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-nav" data-mobile-nav hidden aria-label="Navigation mobile">
      ${siteData.site.navigation
        .map((item) => {
          const fileName = item.href.replace('./', '');
          const active = currentFile === fileName ? 'is-active' : '';
          return `<a class="${active}" href="${item.href}">${escapeHtml(item.label)}</a>`;
        })
        .join('')}
    </nav>
  `;
}

function renderFooter() {
  footer.innerHTML = `
    <div class="site-footer__grid">
      <div>
        <p class="eyebrow">À propos du projet</p>
        <p class="site-footer__lede">
          Version modernisée réalisée à partir du contenu public de
          <a href="${siteData.site.source}" target="_blank" rel="noreferrer">mehomez.de</a>.
        </p>
      </div>
      <div class="site-footer__stats">
        <span>${works.length} œuvres</span>
        <span>${parcoursEntries.length} jalons de parcours</span>
        <span>${pressEntries.length} archives presse</span>
      </div>
      <div class="site-footer__meta">
        <span>Thème ${document.documentElement.dataset.theme === 'dark' ? 'sombre' : 'clair'}</span>
        <span>Inventaire capturé le ${escapeHtml(formatDate(siteData.site.capturedAt))}</span>
      </div>
    </div>
  `;
}

function getThemePreference() {
  const stored = localStorage.getItem(themeStorageKey);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const label = document.querySelector('[data-theme-toggle-label]');
  if (label) label.textContent = theme === 'dark' ? 'Mode clair' : 'Mode sombre';
  renderFooter();
}

function setupThemeToggle() {
  applyTheme(getThemePreference());
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  button.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

function setupMenuToggle() {
  const button = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (!button || !mobileNav) return;
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    mobileNav.hidden = expanded;
  });
}

function renderHome() {
  const featuredWorks = siteData.home.featuredWorks
    .map((slug) => works.find((work) => work.slug === slug))
    .filter(Boolean);
  const featuredPress = siteData.home.highlightedPress
    .map((slug) => pressEntries.find((entry) => entry.slug === slug))
    .filter(Boolean);
  const featuredParcours = siteData.home.highlightedParcours
    .map((slug) => parcoursEntries.find((entry) => entry.slug === slug))
    .filter(Boolean);

  root.innerHTML = `
    ${pageHero({
      eyebrow: 'Portfolio modernisé',
      title: 'Mehomez, entre mémoire, matière et présence.',
      lead:
        siteData.home.text ||
        "Artiste plasticien béninois, Mehomez vit et travaille entre l'Allemagne et le Bénin.",
      image: getLeadImage(featuredWorks[0]),
      meta: [
        "Vit et travaille entre l'Allemagne et le Bénin",
        `${works.length} œuvres archivées`,
        `${pressEntries.length} articles de presse`,
      ],
    })}
    <section class="section-shell stat-band">
      <div class="stat-band__grid">
        <div class="stat-card reveal"><strong>${works.length}</strong><span>œuvres documentées</span></div>
        <div class="stat-card reveal"><strong>${parcoursEntries.length}</strong><span>jalons de parcours</span></div>
        <div class="stat-card reveal"><strong>${pressEntries.length}</strong><span>archives presse</span></div>
      </div>
    </section>
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Œuvres',
        title: 'Une entrée contemporaine dans l’archive complète.',
        lead:
          'La page d’accueil met en scène quelques pièces fortes, mais toutes les œuvres restent accessibles dans les archives par type et par année.',
      })}
      <div class="cards-grid cards-grid--featured">
        ${featuredWorks.map((work, index) => workCard(work, index === 0)).join('')}
      </div>
    </section>
    <section class="section-shell split-grid">
      <div class="panel panel--tall reveal">
        <p class="eyebrow">L'artiste</p>
        <h2>Une pratique née du quotidien, de la culture et de la récupération.</h2>
        <p class="section-lede">${escapeHtml(sentenceBlock(siteData.artist.text, 4))}</p>
        <a class="cta-link" href="./artiste.html">Lire la présentation complète</a>
      </div>
      <div class="collection-grid">
        ${collectionLink({
          title: 'Œuvres',
          text: 'Accéder à l’ensemble des peintures, peintures sculptées et sculptures.',
          href: './oeuvres.html',
          count: works.length,
        })}
        ${collectionLink({
          title: 'Parcours',
          text: 'Expositions, événements, résidences et archives biographiques.',
          href: './parcours.html',
          count: parcoursEntries.length,
        })}
        ${collectionLink({
          title: 'Presse',
          text: 'Revue de presse, articles et traces de réception publique.',
          href: './presse.html',
          count: pressEntries.length,
        })}
      </div>
    </section>
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Parcours',
        title: 'Trajectoires, expositions, prises de parole.',
        lead:
          'Le parcours n’est pas traité comme une annexe. Il devient une couche éditoriale à part entière du portfolio.',
      })}
      <div class="cards-grid cards-grid--stories">
        ${featuredParcours.map((entry) => storyCard(entry)).join('')}
      </div>
    </section>
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Presse',
        title: 'Une mémoire de réception publique conservée et réordonnée.',
        lead:
          'Les articles de presse gardent leur date, leur source et leurs visuels, mais dans une interface plus lisible et plus muséale.',
      })}
      <div class="cards-grid cards-grid--stories">
        ${featuredPress.map((entry) => storyCard(entry)).join('')}
      </div>
    </section>
  `;
}

function renderArtistPage() {
  root.innerHTML = `
    ${pageHero({
      eyebrow: "L'artiste",
      title: 'Ezéchiel Janvier Mehome',
      lead: sentenceBlock(siteData.artist.text, 3),
      image: siteData.artist.portrait,
      meta: ["Né à Porto-Novo en 1978", "Peinture, peinture sculptée, sculpture"],
    })}
    <section class="section-shell artist-grid">
      <div class="panel artist-panel reveal">
        <p class="eyebrow">Démarche</p>
        <p class="section-lede">${escapeHtml(sentenceBlock(siteData.artist.text, 5))}</p>
        <div class="accent-stack">
          <span>Matériaux locaux</span>
          <span>Assemblages</span>
          <span>Peinture sculptée</span>
        </div>
      </div>
      ${prosePanel(siteData.artist.html, siteData.artist.text)}
    </section>
  `;
}

function renderWorksPage() {
  const years = [...new Set(works.map((work) => work.archiveYear).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  root.innerHTML = `
    ${pageHero({
      eyebrow: 'Archives d’œuvres',
      title: 'Peintures, peintures sculptées et sculptures.',
      lead:
        'Les archives restent complètes, mais deviennent consultables avec des filtres clairs, une meilleure hiérarchie et des fiches plus nettes.',
      image: getLeadImage(works[0]),
      meta: [`${works.length} œuvres conservées`, `${years.length} années visibles`],
    })}
    <section class="section-shell">
      <div class="panel filter-panel reveal">
        <div class="filter-grid">
          <label class="field">
            <span>Type</span>
            <select id="type-filter">
              <option value="all">Tous les types</option>
              <option value="work-painting">Peintures et peintures sculptées</option>
              <option value="work-sculpture">Sculptures</option>
            </select>
          </label>
          <label class="field">
            <span>Année</span>
            <select id="year-filter">
              <option value="all">Toutes les années</option>
              ${years.map((year) => `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`).join('')}
            </select>
          </label>
          <label class="field field--search">
            <span>Recherche</span>
            <input id="search-filter" type="search" placeholder="Titre, technique, dimension..." />
          </label>
        </div>
      </div>
      <div class="results-bar reveal"><p id="works-results"></p></div>
      <div id="works-grid" class="cards-grid cards-grid--works"></div>
    </section>
  `;

  const grid = document.getElementById('works-grid');
  const results = document.getElementById('works-results');
  const typeFilter = document.getElementById('type-filter');
  const yearFilter = document.getElementById('year-filter');
  const searchFilter = document.getElementById('search-filter');

  function updateGrid() {
    const type = typeFilter.value;
    const year = yearFilter.value;
    const search = searchFilter.value.trim().toLowerCase();
    const filtered = works.filter((work) => {
      const matchesType = type === 'all' || work.type === type;
      const matchesYear = year === 'all' || work.archiveYear === year;
      const haystack = [work.title, work.technique, work.dimensions, work.composition, work.text].join(' ').toLowerCase();
      const matchesSearch = !search || haystack.includes(search);
      return matchesType && matchesYear && matchesSearch;
    });
    results.textContent = `${filtered.length} œuvre${filtered.length > 1 ? 's' : ''} affichée${filtered.length > 1 ? 's' : ''}`;
    grid.innerHTML = filtered.length
      ? filtered.map((work) => workCard(work)).join('')
      : `<div class="empty-state"><strong>Aucun résultat.</strong><p>Essaie un autre filtre ou une autre année.</p></div>`;
  }

  typeFilter.addEventListener('change', updateGrid);
  yearFilter.addEventListener('change', updateGrid);
  searchFilter.addEventListener('input', updateGrid);
  updateGrid();
}

function renderWorkDetailPage() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const work = works.find((item) => item.slug === slug) || works[0];
  const related = works.filter((item) => item.slug !== work.slug && item.type === work.type).slice(0, 3);
  document.title = `${work.title} | Mehomez`;

  root.innerHTML = `
    ${pageHero({
      eyebrow: 'Fiche d’œuvre',
      title: work.title,
      lead: excerpt(work.text, 280) || 'Archive d’œuvre',
      image: getLeadImage(work),
      meta: [getWorkTypeLabel(work), work.archiveYear, formatDate(work.date)].filter(Boolean),
    })}
    <section class="section-shell detail-grid">
      <div class="detail-gallery reveal">
        <figure class="detail-figure panel">
          ${
            getLeadImage(work)
              ? `<img src="${escapeHtml(getLeadImage(work))}" alt="${escapeHtml(work.title)}" />`
              : '<div class="media-fallback media-fallback--large">Œuvre sans média principal</div>'
          }
        </figure>
        ${
          work.images.length > 1
            ? `<div class="thumb-strip">${work.images
                .slice(1, 4)
                .map((image) => `<figure class="thumb-card"><img src="${escapeHtml(image)}" alt="${escapeHtml(work.title)}" loading="lazy" /></figure>`)
                .join('')}</div>`
            : ''
        }
      </div>
      <div class="detail-stack">
        <div class="panel reveal">
          <p class="eyebrow">Métadonnées</p>
          ${detailMetaGrid([
            { label: 'Type', value: getWorkTypeLabel(work) },
            { label: 'Année d’archive', value: work.archiveYear },
            { label: 'Technique', value: work.technique },
            { label: 'Dimensions', value: work.dimensions },
            { label: 'Composition', value: work.composition },
          ])}
          <div class="chip-list">
            ${work.categories.map((category) => `<span class="chip">${escapeHtml(category.name)}</span>`).join('')}
          </div>
        </div>
        ${prosePanel(work.html, work.text)}
        <div class="panel reveal">
          <a class="cta-link" href="${work.link}" target="_blank" rel="noreferrer">Voir l’archive d’origine</a>
        </div>
      </div>
    </section>
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Explorer',
        title: 'Autres œuvres à proximité de cette archive.',
        lead: 'La navigation détail reste reliée au reste de l’œuvre et non isolée dans une fiche orpheline.',
      })}
      <div class="cards-grid cards-grid--works">
        ${related.map((item) => workCard(item)).join('')}
      </div>
    </section>
  `;
}

function renderParcoursPage() {
  root.innerHTML = `
    ${pageHero({
      eyebrow: 'Infos & Parcours',
      title: 'Expositions, résidences, événements et archives de trajectoire.',
      lead:
        'Le parcours est traité ici comme une ligne éditoriale, avec ses contextes, ses lieux et ses prises de parole.',
      image: getLeadImage(parcoursEntries[0]),
      meta: [`${parcoursEntries.length} entrées conservées`, "Archives d'une pratique située"],
    })}
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Chronologie',
        title: 'Une timeline éditoriale du parcours.',
        lead:
          'Chaque entrée garde sa date et son contenu, mais gagne une forme plus lisible, plus dense et plus contemporaine.',
      })}
      <div class="timeline">
        ${parcoursEntries
          .map(
            (entry) => `
              <article class="timeline-item reveal">
                <span class="timeline-item__date">${escapeHtml(formatDate(entry.date))}</span>
                <div class="timeline-item__body">
                  <h3><a href="./article.html?slug=${encodeURIComponent(entry.slug)}">${escapeHtml(entry.title)}</a></h3>
                  <p>${escapeHtml(excerpt(entry.text, 220))}</p>
                  <a class="cta-link" href="./article.html?slug=${encodeURIComponent(entry.slug)}">Ouvrir l’archive</a>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;
}

function renderPressPage() {
  root.innerHTML = `
    ${pageHero({
      eyebrow: 'Revue de presse',
      title: 'La presse conservée comme une matière vivante.',
      lead:
        'Le redesign remet la presse à niveau visuel sans casser la nature documentaire des coupures, articles et annonces.',
      image: getLeadImage(pressEntries[0]),
      meta: [`${pressEntries.length} archives presse`, 'Dates et sources conservées'],
    })}
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Archives',
        title: 'Une lecture plus claire de la réception publique.',
        lead:
          'Les articles sont reclassés dans une grille éditoriale, mais toutes les entrées restent consultables individuellement.',
      })}
      <div class="cards-grid cards-grid--stories">
        ${pressEntries.map((entry) => storyCard(entry)).join('')}
      </div>
    </section>
  `;
}

function renderArticleDetailPage() {
  const slug = new URLSearchParams(window.location.search).get('slug');
  const entry = pageEntries.find((item) => item.slug === slug) || pressEntries[0] || parcoursEntries[0];
  const siblings = pageEntries.filter((item) => item.slug !== entry.slug).slice(0, 3);
  const pageLabel = entry.type === 'press' ? 'Revue de presse' : 'Infos & Parcours';
  document.title = `${entry.title} | Mehomez`;

  root.innerHTML = `
    ${pageHero({
      eyebrow: pageLabel,
      title: entry.title,
      lead: excerpt(entry.text, 260),
      image: getLeadImage(entry),
      meta: [inferSource(entry), formatDate(entry.date)].filter(Boolean),
    })}
    <section class="section-shell detail-grid">
      <div class="detail-gallery reveal">
        <figure class="detail-figure panel">
          ${
            getLeadImage(entry)
              ? `<img src="${escapeHtml(getLeadImage(entry))}" alt="${escapeHtml(entry.title)}" />`
              : '<div class="media-fallback media-fallback--large">Archive sans image principale</div>'
          }
        </figure>
      </div>
      <div class="detail-stack">
        <div class="panel reveal">
          <p class="eyebrow">${escapeHtml(pageLabel)}</p>
          ${detailMetaGrid([
            { label: 'Source', value: inferSource(entry) },
            { label: 'Date', value: formatDate(entry.date) },
            { label: 'Rubrique', value: pageLabel },
          ])}
        </div>
        ${prosePanel(entry.html, entry.text)}
        ${
          entry.embeds?.length
            ? `<div class="panel prose reveal">${entry.embeds
                .map((url) => `<p><a class="cta-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Ouvrir le média embarqué</a></p>`)
                .join('')}</div>`
            : ''
        }
        <div class="panel reveal">
          <a class="cta-link" href="${entry.link}" target="_blank" rel="noreferrer">Voir l’archive d’origine</a>
        </div>
      </div>
    </section>
    <section class="section-shell">
      ${sectionHeading({
        eyebrow: 'Continuer',
        title: 'Autres archives à consulter.',
        lead: 'Les entrées connexes restent à portée pour encourager une lecture continue du corpus.',
      })}
      <div class="cards-grid cards-grid--stories">
        ${siblings.map((item) => storyCard(item)).join('')}
      </div>
    </section>
  `;
}

function renderContactPage() {
  root.innerHTML = `
    ${pageHero({
      eyebrow: 'Contact',
      title: 'Prendre contact avec Mehomez.',
      lead:
        'La page de contact reprend les informations présentes sur le site public actuel et les remet dans un cadre plus simple et plus direct.',
      image: siteData.artist.portrait,
      meta: ['Coordonnées publiques conservées', 'Version démonstrative locale'],
    })}
    <section class="section-shell contact-grid">
      <div class="panel reveal">
        <p class="eyebrow">Coordonnées</p>
        <h2>Contacter l’artiste</h2>
        <div class="link-stack">
          ${siteData.contact.emails.map((email) => `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>`).join('')}
        </div>
      </div>
      <div class="panel reveal">
        <p class="eyebrow">Liens utiles</p>
        <h2>Ressources et archives</h2>
        <div class="link-stack">
          ${siteData.contact.links
            .map((link) => `<a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${escapeHtml(link)}</a>`)
            .join('')}
        </div>
      </div>
      ${prosePanel(`<p>${escapeHtml(siteData.contact.text)}</p>`, siteData.contact.text)}
    </section>
  `;
}

function renderNotFound() {
  root.innerHTML = `
    <section class="section-shell">
      <div class="empty-state">
        <strong>Page inconnue.</strong>
        <p>La structure locale n’a pas reconnu cette page.</p>
      </div>
    </section>
  `;
}

function renderPage() {
  switch (currentPage) {
    case 'home':
      renderHome();
      break;
    case 'artist':
      renderArtistPage();
      break;
    case 'works':
      renderWorksPage();
      break;
    case 'work-detail':
      renderWorkDetailPage();
      break;
    case 'parcours':
      renderParcoursPage();
      break;
    case 'press':
      renderPressPage();
      break;
    case 'article-detail':
      renderArticleDetailPage();
      break;
    case 'contact':
      renderContactPage();
      break;
    default:
      renderNotFound();
      break;
  }
}

renderHeader();
setupThemeToggle();
setupMenuToggle();
renderPage();
