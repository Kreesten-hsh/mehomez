import fs from 'node:fs/promises';
import path from 'node:path';

const SNAPSHOT_PATH = path.join(process.cwd(), 'data', 'source', 'wordpress-snapshot.json');

function decodeHtml(text = '') {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&ecirc;/g, 'ê')
    .replace(/&agrave;/g, 'à')
    .replace(/&ocirc;/g, 'ô')
    .replace(/&uuml;/g, 'ü')
    .replace(/&#038;/g, '&')
    .replace(/&hellip;/g, '...')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function stripHtml(text = '') {
  return decodeHtml(text);
}

function slugifyLabel(text = '') {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function extractImageUrls(html = '') {
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function extractIframeUrls(html = '') {
  return [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function buildCategoryMaps(categories) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const childrenByParent = new Map();

  for (const category of categories) {
    const siblings = childrenByParent.get(category.parent) || [];
    siblings.push(category);
    childrenByParent.set(category.parent, siblings);
  }

  return { byId, childrenByParent };
}

function getCategoryTrail(categoryId, byId) {
  const trail = [];
  let current = byId.get(categoryId);

  while (current) {
    trail.unshift(current);
    if (!current.parent) {
      break;
    }
    current = byId.get(current.parent);
  }

  return trail;
}

function classifyPost(post, byId) {
  const categoryIds = post.categories || [];
  const trails = categoryIds.map((id) => getCategoryTrail(id, byId));
  const rootIds = new Set(trails.filter(Boolean).map((trail) => trail[0]?.id).filter(Boolean));

  if (rootIds.has(45)) {
    return 'work-painting';
  }

  if (rootIds.has(5)) {
    return 'work-sculpture';
  }

  if (categoryIds.includes(6) || trails.some((trail) => trail.some((item) => item.id === 6))) {
    return 'press';
  }

  if (rootIds.has(31)) {
    return 'parcours';
  }

  return 'uncategorized';
}

function extractField(text, label) {
  const pattern = new RegExp(`${label}\\s*:?\\s*([^\\n]+)`, 'i');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function normalizePage(page) {
  return {
    id: page.id,
    slug: page.slug,
    title: stripHtml(page.title?.rendered || ''),
    excerpt: stripHtml(page.excerpt?.rendered || ''),
    html: page.content?.rendered || '',
    text: stripHtml(page.content?.rendered || ''),
    date: page.date,
    link: page.link,
  };
}

function normalizePost(post, byId, mediaById) {
  const categoryTrails = (post.categories || []).map((id) => getCategoryTrail(id, byId));
  const categories = categoryTrails.map((trail) => ({
    id: trail.at(-1)?.id,
    name: trail.at(-1)?.name || '',
    slug: trail.at(-1)?.slug || '',
    trail: trail.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
    })),
  }));

  const html = post.content?.rendered || '';
  const text = stripHtml(html);
  const featuredMediaId = post.featured_media || 0;
  const featuredMedia = mediaById.get(featuredMediaId);
  const images = unique([
    featuredMedia?.source_url || '',
    ...extractImageUrls(html),
  ]);

  const archiveCategory = categories.find((category) =>
    /(\b20\d{2}\b)|(\b200\d\b)|(\b201\d\b)|(\b202\d\b)/.test(category.name),
  );
  const archiveYear =
    archiveCategory?.name.match(/(20\d{2}|200\d|201\d|202\d)/)?.[1] ||
    post.date?.slice(0, 4) ||
    '';

  return {
    id: post.id,
    slug: post.slug,
    link: post.link,
    type: classifyPost(post, byId),
    title: stripHtml(post.title?.rendered || ''),
    excerpt: stripHtml(post.excerpt?.rendered || ''),
    html,
    text,
    date: post.date,
    dateGmt: post.date_gmt,
    createdYear: post.date?.slice(0, 4) || '',
    archiveYear,
    categories,
    tags: post.tags || [],
    images,
    embeds: extractIframeUrls(html),
    composition: extractField(text, 'Composition'),
    technique: extractField(text, 'Technique'),
    dimensions: extractField(text, 'Dimensions'),
    materials: extractField(text, 'Matériaux') || extractField(text, 'Materiaux'),
  };
}

function selectPage(pages, slug) {
  return pages.find((page) => page.slug === slug) || null;
}

function extractEmails(text) {
  return unique(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || []);
}

async function main() {
  const raw = JSON.parse(await fs.readFile(SNAPSHOT_PATH, 'utf8'));
  const { byId } = buildCategoryMaps(raw.categories);
  const mediaById = new Map(raw.media.map((item) => [item.id, item]));
  const pages = raw.pages.map(normalizePage);
  const posts = raw.posts.map((post) => normalizePost(post, byId, mediaById));

  const works = posts
    .filter((post) => post.type === 'work-painting' || post.type === 'work-sculpture')
    .sort((left, right) => new Date(right.date) - new Date(left.date));

  const press = posts
    .filter((post) => post.type === 'press')
    .sort((left, right) => new Date(right.date) - new Date(left.date));

  const parcours = posts
    .filter((post) => post.type === 'parcours')
    .sort((left, right) => new Date(right.date) - new Date(left.date));

  const artistPage = selectPage(pages, 'lartiste');
  const homePage = selectPage(pages, 'a-propos');
  const contactPage = selectPage(pages, 'contact');

  const allText = [
    artistPage?.text || '',
    homePage?.text || '',
    contactPage?.text || '',
    ...posts.map((post) => post.text),
  ].join('\n');

  const payload = {
    site: {
      title: raw.site.title,
      description: raw.site.description,
      source: raw.source,
      capturedAt: raw.capturedAt,
      counts: raw.meta,
      navigation: [
        { label: 'Accueil', href: './mehomez-portfolio.html' },
        { label: "L'artiste", href: './artiste.html' },
        { label: 'Œuvres', href: './oeuvres.html' },
        { label: 'Parcours', href: './parcours.html' },
        { label: 'Presse', href: './presse.html' },
        { label: 'Contact', href: './contact.html' },
      ],
    },
    artist: {
      title: artistPage?.title || 'Mehomez',
      html: artistPage?.html || '',
      text: artistPage?.text || '',
      portrait:
        works.find((work) => work.images.length > 0)?.images[0] ||
        press.find((entry) => entry.images.length > 0)?.images[0] ||
        '',
    },
    home: {
      title: homePage?.title || 'Page d’accueil',
      html: homePage?.html || '',
      text: homePage?.text || '',
      featuredWorks: works.slice(0, 6).map((work) => work.slug),
      highlightedPress: press.slice(0, 3).map((entry) => entry.slug),
      highlightedParcours: parcours.slice(0, 4).map((entry) => entry.slug),
    },
    works,
    press,
    parcours,
    contact: {
      title: contactPage?.title || 'Contact',
      html: contactPage?.html || '',
      text: contactPage?.text || '',
      emails: extractEmails(allText),
      links: unique([
        raw.source,
        'http://www.ouadada.com/',
        'http://creapage.net/',
      ]),
    },
    categories: raw.categories
      .map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        parent: category.parent,
        count: category.count,
      }))
      .sort((left, right) => left.name.localeCompare(right.name, 'fr')),
  };

  const outDir = path.join(process.cwd(), 'data');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'mehomez-content.json'), JSON.stringify(payload, null, 2), 'utf8');
  await fs.writeFile(
    path.join(outDir, 'mehomez-content.js'),
    `export const siteData = ${JSON.stringify(payload, null, 2)};\n`,
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        works: works.length,
        press: press.length,
        parcours: parcours.length,
        emails: payload.contact.emails,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
