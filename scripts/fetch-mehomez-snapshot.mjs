import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_ROOT = 'https://mehomez.de';
const API_ROOT = `${SITE_ROOT}/wp-json/wp/v2`;

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'CodexMehomezSnapshot/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return {
    body: await response.json(),
    headers: response.headers,
  };
}

async function fetchCollection(endpoint, query = '') {
  const firstUrl = `${API_ROOT}/${endpoint}?per_page=100${query}`;
  const first = await fetchJson(firstUrl);
  const totalPages = Number(first.headers.get('x-wp-totalpages') || '1');
  const items = Array.isArray(first.body) ? [...first.body] : [];

  if (totalPages > 1) {
    const remaining = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map(async (page) => {
        const pageUrl = `${API_ROOT}/${endpoint}?per_page=100&page=${page}${query}`;
        const result = await fetchJson(pageUrl);
        return result.body;
      }),
    );

    for (const chunk of remaining) {
      items.push(...chunk);
    }
  }

  return {
    items,
    totalPages,
    totalItems: Number(first.headers.get('x-wp-total') || String(items.length)),
  };
}

async function main() {
  const [pages, posts, categories, media] = await Promise.all([
    fetchCollection('pages', '&_embed=1'),
    fetchCollection('posts', '&_embed=1'),
    fetchCollection('categories'),
    fetchCollection('media'),
  ]);

  const snapshot = {
    capturedAt: new Date().toISOString(),
    source: SITE_ROOT,
    site: {
      title: 'Mehomez',
      description: 'Artiste plasticien au Bénin',
    },
    meta: {
      pages: { totalItems: pages.totalItems, totalPages: pages.totalPages },
      posts: { totalItems: posts.totalItems, totalPages: posts.totalPages },
      categories: { totalItems: categories.totalItems, totalPages: categories.totalPages },
      media: { totalItems: media.totalItems, totalPages: media.totalPages },
    },
    pages: pages.items,
    posts: posts.items,
    categories: categories.items,
    media: media.items,
  };

  const outDir = path.join(process.cwd(), 'data', 'source');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, 'wordpress-snapshot.json'),
    JSON.stringify(snapshot, null, 2),
    'utf8',
  );

  console.log(
    JSON.stringify(
      {
        capturedAt: snapshot.capturedAt,
        counts: snapshot.meta,
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
