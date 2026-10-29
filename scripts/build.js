const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  renderAboutPage,
  renderToolPage,
  renderHome,
  renderGuidePage,
  renderGuidesHub,
  renderPrivacyPage,
  renderRootIndex,
  setAssetVersion,
  setSiteConfig,
} = require('./lib/render');

// Production origin. It appears in canonical and hreflang links, sitemap.xml,
// and robots.txt. Change it if the site moves to a custom domain.
const SITE_ORIGIN = 'https://moatool.com';
const SLUGS = [
  'loan-calculator',
  'date-diff',
  'date-add',
  'bmi',
  'severance',
  'char-count',
  'case-convert',
  'line-cleanup',
  'dedupe-lines',
  'hourly-wage',
  'korean-age',
  'discharge-date',
  'pyeong',
  'percent',
];
const LANGS = ['ko', 'en'];
const GUIDE_SLUGS = {
  ko: ['severance', 'loan-repayment-methods', 'weekly-holiday-pay', 'korean-age', 'bmi', 'char-count'],
  en: ['korean-severance-pay', 'korean-age-explained', 'korean-bmi-categories'],
};

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(full) : [full];
    });
}

function assetVersion(rootDir) {
  const hash = crypto.createHash('sha256');
  for (const file of [...listFiles(path.join(rootDir, 'assets')), ...listFiles(path.join(rootDir, 'src', 'logic'))]) {
    hash.update(path.relative(rootDir, file));
    hash.update(fs.readFileSync(file));
  }
  return hash.digest('hex').slice(0, 8);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadConfig(rootDir) {
  const file = path.join(rootDir, 'site.config.json');
  const config = fs.existsSync(file) ? readJson(file) : {};
  return {
    adsensePublisherId: config.adsensePublisherId || '',
    contactEmail: config.contactEmail || '',
    naverSiteVerification: config.naverSiteVerification || '',
  };
}

function validateConfig(config) {
  if (config.adsensePublisherId && !/^pub-\d{16}$/.test(config.adsensePublisherId)) {
    throw new Error('adsensePublisherId must look like pub-1234567890123456');
  }
  if (config.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(config.contactEmail)) {
    throw new Error('contactEmail must be a valid email address');
  }
  if (config.naverSiteVerification && !/^[A-Za-z0-9_-]{10,100}$/.test(config.naverSiteVerification)) {
    throw new Error('naverSiteVerification must contain only letters, digits, "-" and "_"');
  }
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
      const links = LANGS.filter((lang) => entry.paths[lang])
        .map((lang) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${origin}${entry.paths[lang]}"/>`)
        .join('\n');
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

function buildSite({ rootDir, outDir, origin = SITE_ORIGIN, config = loadConfig(rootDir) }) {
  validateConfig(config);
  setAssetVersion(assetVersion(rootDir));
  setSiteConfig({
    adsenseClient: config.adsensePublisherId ? `ca-${config.adsensePublisherId}` : null,
    contactEmail: config.contactEmail,
    naverVerification: config.naverSiteVerification,
  });
  const ui = {};
  const tools = {};
  const privacy = {};
  const about = {};
  const guideHub = {};
  const guides = {};
  const relatedByTool = {};
  // An English guide may name a Korean guide as its `pair`; paired guides link via hreflang.
  const guidePaths = { ko: {}, en: {} };
  for (const lang of LANGS) {
    const dir = path.join(rootDir, 'content', lang, 'guides');
    guideHub[lang] = readJson(path.join(dir, 'index.json'));
    guides[lang] = GUIDE_SLUGS[lang].map((slug) => readJson(path.join(dir, `${slug}.json`)));
    relatedByTool[lang] = {};
    for (const guide of guides[lang]) {
      relatedByTool[lang][guide.toolSlug] = { slug: guide.slug, title: guide.h1 };
      guidePaths[lang][guide.slug] = { [lang]: `/${lang}/guides/${guide.slug}/` };
    }
  }
  for (const guide of guides.en) {
    if (!guide.pair) continue;
    const paths = { ko: `/ko/guides/${guide.pair}/`, en: `/en/guides/${guide.slug}/` };
    guidePaths.en[guide.slug] = paths;
    guidePaths.ko[guide.pair] = paths;
  }
  for (const lang of LANGS) {
    ui[lang] = readJson(path.join(rootDir, 'content', 'ui', `${lang}.json`));
    privacy[lang] = readJson(path.join(rootDir, 'content', lang, 'privacy.json'));
    about[lang] = readJson(path.join(rootDir, 'content', lang, 'about.json'));
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
      renderHome({
        lang,
        ui: ui[lang],
        tools: Object.values(tools[lang]),
        alternates: home,
        origin,
        guides: guides[lang],
      })
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
        renderToolPage({
          lang,
          tool: tools[lang][slug],
          ui: ui[lang],
          alternates,
          origin,
          relatedGuide: relatedByTool[lang][slug],
        })
      );
      pages += 1;
      sitemapEntries.push({ lang, paths: alternates.paths });
    }
  }

  const hubPaths = { paths: { ko: '/ko/guides/', en: '/en/guides/' } };
  for (const lang of LANGS) {
    writePage(
      outDir,
      `${lang}/guides/index.html`,
      renderGuidesHub({ lang, hub: guideHub[lang], guides: guides[lang], ui: ui[lang], alternates: hubPaths, origin })
    );
    pages += 1;
    sitemapEntries.push({ lang, paths: hubPaths.paths });
  }

  for (const lang of LANGS) {
    for (const guide of guides[lang]) {
      const alternates = { paths: guidePaths[lang][guide.slug] };
      writePage(
        outDir,
        `${lang}/guides/${guide.slug}/index.html`,
        renderGuidePage({ lang, guide, ui: ui[lang], alternates, origin })
      );
      pages += 1;
      sitemapEntries.push({ lang, paths: alternates.paths });
    }
  }

  const aboutPaths = { paths: { ko: '/ko/about/', en: '/en/about/' } };
  for (const lang of LANGS) {
    writePage(
      outDir,
      `${lang}/about/index.html`,
      renderAboutPage({ lang, page: about[lang], ui: ui[lang], alternates: aboutPaths, origin })
    );
    pages += 1;
    sitemapEntries.push({ lang, paths: aboutPaths.paths });
  }

  const privacyPaths = { paths: { ko: '/ko/privacy/', en: '/en/privacy/' } };
  for (const lang of LANGS) {
    writePage(
      outDir,
      `${lang}/privacy/index.html`,
      renderPrivacyPage({ lang, page: privacy[lang], ui: ui[lang], alternates: privacyPaths, origin })
    );
    pages += 1;
    sitemapEntries.push({ lang, paths: privacyPaths.paths });
  }

  writePage(outDir, 'index.html', renderRootIndex({ ui: ui.ko, origin }));
  pages += 1;

  if (config.adsensePublisherId) {
    writePage(outDir, 'ads.txt', `google.com, ${config.adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`);
  }

  const assetsDir = path.join(rootDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    fs.cpSync(assetsDir, path.join(outDir, 'assets'), { recursive: true });
  }
  fs.cpSync(path.join(rootDir, 'src', 'logic'), path.join(outDir, 'assets', 'logic'), { recursive: true });
  const faviconIco = path.join(rootDir, 'assets', 'favicon.ico');
  if (fs.existsSync(faviconIco)) {
    fs.copyFileSync(faviconIco, path.join(outDir, 'favicon.ico'));
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
