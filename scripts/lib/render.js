const { TOOL_FORMS, CALC_SLUGS, TEXT_SLUGS } = require('./forms');

function categoryOf(slug) {
  return CALC_SLUGS.includes(slug) ? 'calc' : 'text';
}

const LOGIC_FILE = {
  'loan-calculator': 'finance',
  severance: 'finance',
  'date-diff': 'date',
  'date-add': 'date',
  'hourly-wage': 'finance',
  'korean-age': 'date',
  'discharge-date': 'date',
  pyeong: 'units',
  percent: 'units',
  bmi: 'health',
  'char-count': 'text',
  'case-convert': 'text',
  'line-cleanup': 'text',
  'dedupe-lines': 'text',
};

let assetVersion = 'dev';
let siteConfig = { adsenseClient: null, contactEmail: null, naverVerification: null };

function setAssetVersion(version) {
  assetVersion = version;
}

function setSiteConfig(config) {
  siteConfig = {
    adsenseClient: config.adsenseClient || null,
    contactEmail: config.contactEmail || null,
    naverVerification: config.naverVerification || null,
  };
}

function iconTags() {
  return `
  <link rel="icon" href="${asset('/assets/favicon.svg')}" type="image/svg+xml">
  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="${asset('/assets/apple-touch-icon.png')}">`;
}

function verificationTag() {
  if (!siteConfig.naverVerification) return '';
  return `\n  <meta name="naver-site-verification" content="${escapeHtml(siteConfig.naverVerification)}" />`;
}

function adsenseTag() {
  if (!siteConfig.adsenseClient) return '';
  return `\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClient}" crossorigin="anonymous"></script>`;
}

function asset(url) {
  return `${url}?v=${assetVersion}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paragraphs(text) {
  return text
    .split('\n\n')
    .map((part) => `<p>${escapeHtml(part)}</p>`)
    .join('\n');
}

// Open Graph tags drive link previews in KakaoTalk, Naver, and social apps.
function openGraphTags({ lang, title, description, url, origin, siteName, type }) {
  return `
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${escapeHtml(siteName)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:image" content="${escapeHtml(origin)}/assets/og-${lang}.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="${lang === 'ko' ? 'ko_KR' : 'en_US'}">
  <meta name="twitter:card" content="summary_large_image">`;
}

function rssTag(rss) {
  if (!rss) return '';
  return `
  <link rel="alternate" type="application/rss+xml" title="${escapeHtml(rss.title)}" href="${escapeHtml(rss.url)}">`;
}

function rssLink(lang, ui, origin) {
  return { title: `${ui.siteName} ${ui.guidesHeading}`, url: `${origin}/${lang}/guides/rss.xml` };
}

function head({ lang, title, description, origin, alternates, siteName, type = 'website', rss }) {
  const hreflangs = ['ko', 'en']
    .filter((code) => alternates[code])
    .map((code) => `<link rel="alternate" hreflang="${code}" href="${escapeHtml(origin + alternates[code])}">`)
    .join('\n    ');
  const url = origin + alternates[lang];
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">${verificationTag()}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(url)}">
    ${hreflangs}
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + (alternates.ko || alternates[lang]))}">${openGraphTags({ lang, title, description, url, origin, siteName, type })}${rssTag(rss)}
  <link rel="stylesheet" href="${asset('/assets/style.css')}">${iconTags()}${adsenseTag()}
</head>`;
}

function header({ lang, ui, alternates, fallback }) {
  const other = lang === 'ko' ? 'en' : 'ko';
  const links = [[`/${lang}/`, ui.navTools]];
  links.push([`/${lang}/guides/`, ui.navGuides]);
  links.push([`/${lang}/about/`, ui.navAbout]);
  const nav = links.map(([href, label]) => `<a href="${href}">${escapeHtml(label)}</a>`).join('');
  return `<header class="site-header">
  <a class="site-name" href="/${lang}/">${escapeHtml(ui.siteName)}</a>
  <nav class="site-nav" aria-label="${escapeHtml(ui.navLabel)}">${nav}</nav>
  <a class="lang-switch" href="${alternates[other] || fallback || `/${other}/`}" hreflang="${other}" lang="${other}">${escapeHtml(ui.languageSwitch)}</a>
</header>`;
}

function footer(ui, lang) {
  const text = siteConfig.adsenseClient ? `${ui.footer} ${ui.footerAds}` : ui.footer;
  return `<footer class="site-footer">
  <p>${escapeHtml(text)}</p>
  <p><a href="/${lang}/guides/">${escapeHtml(ui.guidesLink)}</a> · <a href="/${lang}/about/">${escapeHtml(ui.aboutLink)}</a> · <a href="/${lang}/privacy/">${escapeHtml(ui.privacyLink)}</a></p>
</footer>`;
}

function renderField(field, labels) {
  const label = escapeHtml(labels[field.labelKey]);
  if (field.type === 'checkbox') {
    return `<div class="field field-check">
  <input id="${field.id}" name="${field.id}" type="checkbox"${field.checked ? ' checked' : ''}>
  <label for="${field.id}">${label}</label>
</div>`;
  }
  if (field.type === 'select') {
    const options = field.options
      .map((option) => `<option value="${option.value}">${escapeHtml(labels[option.labelKey])}</option>`)
      .join('');
    return `<div class="field">
  <label for="${field.id}">${label}</label>
  <select id="${field.id}" name="${field.id}">${options}</select>
</div>`;
  }
  if (field.type === 'textarea') {
    return `<div class="field">
  <label for="${field.id}">${label}</label>
  <textarea id="${field.id}" name="${field.id}" rows="8"></textarea>
</div>`;
  }
  const unit = field.unitKey ? `<span class="unit">${escapeHtml(labels[field.unitKey])}</span>` : '';
  const inputmode = field.inputmode ? ` inputmode="${field.inputmode}"` : '';
  const type = field.type === 'date' ? 'date' : 'text';
  return `<div class="field">
  <label for="${field.id}">${label}</label>
  <div class="field-row">
    <input id="${field.id}" name="${field.id}" type="${type}"${inputmode}${field.noShare ? ' data-no-share' : ''}>
    ${unit}
  </div>
</div>`;
}

function renderOutput(output, labels, ui) {
  const cls = output.primary ? 'output output-primary' : 'output';
  const copy = output.copy
    ? `\n  <button type="button" class="copy-btn" data-copy="${output.id}" data-label="${escapeHtml(ui.copyLabel)}" data-copied="${escapeHtml(ui.copiedLabel)}">${escapeHtml(ui.copyLabel)}</button>`
    : '';
  return `<div class="${cls}">
  <span class="output-label">${escapeHtml(labels[output.labelKey])}</span>
  <output id="${output.id}"></output>${copy}
</div>`;
}

function renderErrors(keys, labels) {
  return keys
    .map((key) => `<p class="error" data-error="${key}" role="alert" hidden>${escapeHtml(labels[key])}</p>`)
    .join('\n');
}

function renderExplanation(tool, ui) {
  const sections = [];
  if (tool.formula) {
    sections.push(`<section class="formula">
    <h2>${escapeHtml(ui.formulaHeading)}</h2>
    ${paragraphs(tool.formula)}
  </section>`);
  }
  if (tool.example) {
    sections.push(`<section class="example">
    <h2>${escapeHtml(ui.exampleHeading)}</h2>
    ${paragraphs(tool.example)}
  </section>`);
  }
  if (tool.notes && tool.notes.length) {
    sections.push(`<section class="notes">
    <h2>${escapeHtml(ui.notesHeading)}</h2>
    <ul>${tool.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>
  </section>`);
  }
  return sections.join('\n  ');
}

function renderReferences(tool, ui) {
  const parts = [];
  if (tool.sources && tool.sources.length) {
    const links = tool.sources
      .map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a></li>`)
      .join('');
    parts.push(`<section class="sources">
    <h2>${escapeHtml(ui.sourcesHeading)}</h2>
    <ul>${links}</ul>
  </section>`);
  }
  if (tool.updated) {
    parts.push(`<p class="updated">${escapeHtml(ui.updatedLabel)}: ${escapeHtml(tool.updated)}</p>`);
  }
  return parts.join('\n  ');
}

function renderSchedule(labels) {
  const columns = ['colMonth', 'colPayment', 'colPrincipal', 'colInterest', 'colBalance']
    .map((key) => `<th scope="col">${escapeHtml(labels[key])}</th>`)
    .join('');
  return `<details class="schedule" id="schedule">
    <summary>${escapeHtml(labels.scheduleLabel)}</summary>
    <div class="table-wrap">
      <table>
        <thead><tr>${columns}</tr></thead>
        <tbody id="schedule-body"></tbody>
      </table>
    </div>
  </details>`;
}

// The share link keeps inputs after "#", which browsers never send to the server.
function renderShare(ui) {
  return `<div class="share">
    <button type="button" class="copy-btn" data-share data-label="${escapeHtml(ui.shareLabel)}" data-copied="${escapeHtml(ui.sharedLabel)}">${escapeHtml(ui.shareLabel)}</button>
    <p class="share-hint">${escapeHtml(ui.shareHint)}</p>
  </div>`;
}

function renderRelatedGuide(relatedGuide, ui, lang) {
  if (!relatedGuide) return '';
  return `<section class="related-guide">
    <h2>${escapeHtml(ui.relatedGuideHeading)}</h2>
    <p><a href="/${lang}/guides/${escapeHtml(relatedGuide.slug)}/">${escapeHtml(relatedGuide.title)}</a></p>
  </section>`;
}

function renderToolPage({ lang, tool, ui, alternates, origin, relatedGuide }) {
  const form = TOOL_FORMS[tool.slug];
  const labels = tool.labels;
  const inputs = form.inputs.map((field) => renderField(field, labels)).join('\n');
  const outputs = form.outputs.map((output) => renderOutput(output, labels, ui)).join('\n');
  return `${head({
    lang,
    title: tool.title,
    description: tool.description,
    origin,
    alternates: alternates.paths,
    siteName: ui.siteName,
  })}
<body>
${header({ lang, ui, alternates: alternates.paths })}
<main class="tool" data-category="${categoryOf(tool.slug)}">
  <h1>${escapeHtml(tool.h1)}</h1>
  <div class="intro">${paragraphs(tool.intro)}</div>
  <form class="tool-form" id="tool-form">
    ${inputs}
    <div class="results" aria-live="polite">
      ${outputs}
    </div>
    ${renderErrors(form.errorKeys, labels)}
  </form>
  ${CALC_SLUGS.includes(tool.slug) ? renderShare(ui) : ''}
  ${form.schedule ? renderSchedule(labels) : ''}
  <section class="howto">
    <h2>${escapeHtml(ui.howToHeading)}</h2>
    <ol>${tool.howTo.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
  </section>
  ${renderExplanation(tool, ui)}
  ${renderRelatedGuide(relatedGuide, ui, lang)}
  <section class="faq">
    <h2>${escapeHtml(ui.faqHeading)}</h2>
    ${tool.faq.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('\n')}
  </section>
  ${renderReferences(tool, ui)}
</main>
${footer(ui, lang)}
<script type="application/json" id="tool-labels">${JSON.stringify(labels).replace(/</g, '\\u003c')}</script>
<script src="${asset(`/assets/logic/${LOGIC_FILE[tool.slug]}.js`)}"></script>
<script src="${asset('/assets/common.js')}"></script>
<script src="${asset(`/assets/tools/${tool.slug}.js`)}" defer></script>
</body>
</html>
`;
}

function guideCards(guides, lang) {
  return guides
    .map(
      (guide) => `<a class="tool-card" href="/${lang}/guides/${escapeHtml(guide.slug)}/">
  <span class="tool-card-title">${escapeHtml(guide.h1)}</span>
  <span class="tool-card-desc">${escapeHtml(guide.description)}</span>
</a>`
    )
    .join('\n');
}

function renderHome({ lang, ui, tools, alternates, origin, guides = [] }) {
  const bySlug = new Map(tools.map((tool) => [tool.slug, tool]));
  const card = (slug) => {
    const tool = bySlug.get(slug);
    return `<a class="tool-card" href="${alternates.paths[lang]}${slug}/">
  <span class="tool-card-title">${escapeHtml(tool.h1)}</span>
  <span class="tool-card-desc">${escapeHtml(tool.description)}</span>
</a>`;
  };
  const section = (heading, slugs, category) => `<section class="category category-${category}" data-category="${category}">
  <h2>${escapeHtml(heading)}</h2>
  <div class="grid">${slugs.map(card).join('\n')}</div>
</section>`;
  const title = `${ui.siteName} | ${ui.home}`;
  const description = ui.homeDescription;
  return `${head({ lang, title, description, origin, alternates: alternates.paths, siteName: ui.siteName })}
<body>
${header({ lang, ui, alternates: alternates.paths })}
<main class="home">
  <h1>${escapeHtml(ui.heroTitle)}</h1>
  <p class="lead">${escapeHtml(ui.heroLead)}</p>
  ${section(ui.categoryCalc, CALC_SLUGS, 'calc')}
  ${section(ui.categoryText, TEXT_SLUGS, 'text')}
  ${
    guides.length
      ? `<section class="category category-guide" data-category="guide">
  <h2>${escapeHtml(ui.guidesHeading)}</h2>
  <div class="grid">${guideCards(guides, lang)}</div>
</section>`
      : ''
  }
</main>
${footer(ui, lang)}
</body>
</html>
`;
}

function renderTextSections(sections) {
  return sections
    .map((section) => {
      const paragraphsHtml = section.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('\n    ');
      const items = section.items
        ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      return `<section>
    <h2>${escapeHtml(section.heading)}</h2>
    ${paragraphsHtml}
    ${items}
  </section>`;
    })
    .join('\n  ');
}

function renderGuidePage({ lang, guide, ui, alternates, origin }) {
  const cta = `<p><a class="cta" href="/${lang}/${escapeHtml(guide.toolSlug)}/">${escapeHtml(guide.ctaText)}</a></p>`;
  return `${head({
    lang,
    title: guide.title,
    description: guide.description,
    origin,
    alternates: alternates.paths,
    siteName: ui.siteName,
    type: 'article',
    rss: rssLink(lang, ui, origin),
  })}
<body>
${header({ lang, ui, alternates: alternates.paths, fallback: `/${lang === 'ko' ? 'en' : 'ko'}/guides/` })}
<main class="guide" data-category="${categoryOf(guide.toolSlug)}">
  <h1>${escapeHtml(guide.h1)}</h1>
  <div class="intro">${paragraphs(guide.intro)}</div>
  ${cta}
  ${renderTextSections(guide.sections)}
  ${cta}
  ${renderReferences(guide, ui)}
</main>
${footer(ui, lang)}
</body>
</html>
`;
}

function renderGuidesHub({ lang, hub, guides, ui, alternates, origin }) {
  return `${head({
    lang,
    title: hub.title,
    description: hub.description,
    origin,
    alternates: alternates.paths,
    siteName: ui.siteName,
    rss: rssLink(lang, ui, origin),
  })}
<body>
${header({ lang, ui, alternates: alternates.paths })}
<main class="guide-hub">
  <h1>${escapeHtml(hub.h1)}</h1>
  <p class="lead">${escapeHtml(hub.intro)}</p>
  <section class="category category-guide" data-category="guide">
    <div class="grid">${guideCards(guides, lang)}</div>
  </section>
</main>
${footer(ui, lang)}
</body>
</html>
`;
}

function renderAboutPage({ lang, page, ui, alternates, origin }) {
  const contact = siteConfig.contactEmail
    ? `<section class="contact">
    <h2>${escapeHtml(page.contact.heading)}</h2>
    <p>${escapeHtml(page.contact.text)}</p>
    <p><a href="mailto:${escapeHtml(siteConfig.contactEmail)}">${escapeHtml(siteConfig.contactEmail)}</a></p>
  </section>`
    : '';
  return `${head({
    lang,
    title: page.title,
    description: page.description,
    origin,
    alternates: alternates.paths,
    siteName: ui.siteName,
  })}
<body>
${header({ lang, ui, alternates: alternates.paths })}
<main class="about">
  <h1>${escapeHtml(page.h1)}</h1>
  <div class="intro">${paragraphs(page.intro)}</div>
  ${renderTextSections(page.sections)}
  ${contact}
  <p class="updated">${escapeHtml(ui.updatedLabel)}: ${escapeHtml(page.updated)}</p>
</main>
${footer(ui, lang)}
</body>
</html>
`;
}

function renderPrivacyPage({ lang, page, ui, alternates, origin }) {
  const sections = page.sections
    .map((section) => {
      const paragraphsHtml = section.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('\n    ');
      const items = section.items
        ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : '';
      const links = section.links
        ? `<ul>${section.links
            .map(
              (link) =>
                `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.title)}</a></li>`
            )
            .join('')}</ul>`
        : '';
      return `<section>
    <h2>${escapeHtml(section.heading)}</h2>
    ${paragraphsHtml}
    ${items}
    ${links}
  </section>`;
    })
    .join('\n  ');
  const contact = siteConfig.contactEmail
    ? `<section class="contact">
    <h2>${escapeHtml(page.contact.heading)}</h2>
    <p>${escapeHtml(page.contact.text)}</p>
    <p><a href="mailto:${escapeHtml(siteConfig.contactEmail)}">${escapeHtml(siteConfig.contactEmail)}</a></p>
  </section>`
    : '';
  return `${head({
    lang,
    title: page.title,
    description: page.description,
    origin,
    alternates: alternates.paths,
    siteName: ui.siteName,
  })}
<body>
${header({ lang, ui, alternates: alternates.paths })}
<main class="privacy">
  <h1>${escapeHtml(page.h1)}</h1>
  ${sections}
  ${contact}
  <p class="updated">${escapeHtml(ui.updatedLabel)}: ${escapeHtml(page.updated)}</p>
</main>
${footer(ui, lang)}
</body>
</html>
`;
}

function renderRootIndex({ ui, origin }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">${verificationTag()}
  <title>${escapeHtml(ui.siteName)}</title>
  <meta name="description" content="${escapeHtml(ui.homeDescription)}">
  <link rel="alternate" hreflang="ko" href="${escapeHtml(origin)}/ko/">
  <link rel="alternate" hreflang="en" href="${escapeHtml(origin)}/en/">
  <link rel="stylesheet" href="${asset('/assets/style.css')}">${iconTags()}${adsenseTag()}
  <script>
    if (navigator.language && navigator.language.indexOf('ko') === 0) {
      location.replace('/ko/');
    }
  </script>
</head>
<body>
<main class="root-index">
  <h1>${escapeHtml(ui.siteName)}</h1>
  <p><a href="/ko/">한국어</a></p>
  <p><a href="/en/">English</a></p>
</main>
</body>
</html>
`;
}

module.exports = {
  escapeHtml,
  setAssetVersion,
  setSiteConfig,
  renderToolPage,
  renderHome,
  renderAboutPage,
  renderGuidePage,
  renderGuidesHub,
  renderPrivacyPage,
  renderRootIndex,
};
