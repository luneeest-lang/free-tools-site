const fs = require('node:fs');
const path = require('node:path');
const { renderToolPage, renderHome, renderRootIndex } = require('./lib/render');

const SITE_ORIGIN = 'https://example.com';
const SLUGS = [
  'loan-calculator',
  'date-diff',
  'bmi',
  'severance',
  'char-count',
  'case-convert',
  'line-cleanup',
  'dedupe-lines',
];
const LANGS = ['ko', 'en'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writePage(outDir, relative, content) {
  const file = path.join(outDir, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, 'utf8');
}

function toolPaths(slug) {
  return { paths: { ko: `/ko/${slug}/`, en: `/en/${slug}/` } };
}

function homePaths() {
  return { paths: { ko: '/ko/', en: '/en/' } };
}

function sitemapXml(origin, entries) {
  const urls = entries
    .map((entry) => {
      const links = LANGS.map(
        (lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${origin}${entry.paths[lang]}"/>`
      ).join('\n');
      return `  <url>
    <loc>${origin}${entry.paths[entry.lang]}</loc>
${links}
  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function robotsTxt(origin) {
  return `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
}

function buildSite({ rootDir, outDir, origin = SITE_ORIGIN }) {
  const ui = {};
  const tools = {};
  for (const lang of LANGS) {
    ui[lang] = readJson(path.join(rootDir, 'content', 'ui', `${lang}.json`));
    tools[lang] = {};
    for (const slug of SLUGS) {
      tools[lang][slug] = readJson(path.join(rootDir, 'content', lang, `${slug}.json`));
    }
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  let pages = 0;
  const sitemapEntries = [];

  for (const lang of LANGS) {
    const home = homePaths();
    writePage(
      outDir,
      `${lang}/index.html`,
      renderHome({ lang, ui: ui[lang], tools: Object.values(tools[lang]), alternates: home, origin })
    );
    pages += 1;
    sitemapEntries.push({ lang, paths: home.paths });
  }

  for (const lang of LANGS) {
    for (const slug of SLUGS) {
      const alternates = toolPaths(slug);
      writePage(
        outDir,
        `${lang}/${slug}/index.html`,
        renderToolPage({ lang, tool: tools[lang][slug], ui: ui[lang], alternates, origin })
      );
      pages += 1;
      sitemapEntries.push({ lang, paths: alternates.paths });
    }
  }

  writePage(outDir, 'index.html', renderRootIndex({ ui: ui.ko, origin }));
  pages += 1;

  const assetsDir = path.join(rootDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.cpSync(assetsDir, path.join(outDir, 'assets'), { recursive: true });
  }

  writePage(outDir, 'sitemap.xml', sitemapXml(origin, sitemapEntries));
  writePage(outDir, 'robots.txt', robotsTxt(origin));

  return { pages };
}

module.exports = { buildSite, SITE_ORIGIN };

if (require.main === module) {
  const rootDir = path.join(__dirname, '..');
  const result = buildSite({ rootDir, outDir: path.join(rootDir, 'site') });
  console.log(`built ${result.pages} pages`);
}
