import fs from 'node:fs/promises';
import path from 'node:path';

const snapshotPath = path.join(process.cwd(), 'data', 'source', 'wordpress-snapshot.json');
const contentPath = path.join(process.cwd(), 'data', 'mehomez-content.json');

function summarizeMissing(entries, label) {
  const missingImage = entries.filter((entry) => !entry.images || entry.images.length === 0).length;
  const missingText = entries.filter((entry) => !(entry.text || '').trim()).length;
  return { label, missingImage, missingText };
}

async function main() {
  const snapshot = JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
  const content = JSON.parse(await fs.readFile(contentPath, 'utf8'));

  const expectedWorks = snapshot.posts.filter((post) => {
    const categories = new Set(post.categories || []);
    return [45, 5].some((id) => categories.has(id));
  }).length;

  const report = {
    snapshotCapturedAt: snapshot.capturedAt,
    snapshotTotals: snapshot.meta,
    localTotals: {
      works: content.works.length,
      press: content.press.length,
      parcours: content.parcours.length,
    },
    quality: [
      summarizeMissing(content.works, 'works'),
      summarizeMissing(content.press, 'press'),
      summarizeMissing(content.parcours, 'parcours'),
    ],
    contactEmails: content.contact.emails,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
