const { TOOL_FORMS, CALC_SLUGS, TEXT_SLUGS } = require('./forms');

function categoryOf(slug) {
  return CALC_SLUGS.includes(slug) ? 'calc' : 'text';
}

const LOGIC_FILE = {
  'loan-calculator': 'finance',
  severance: 'finance',
  'date-diff': 'date',
  bmi: 'health',
  'char-count': 'text',
  'case-convert': 'text',
  'line-cleanup': 'text',
  'dedupe-lines': 'text',
};

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

function head({ lang, title, description, origin, alternates }) {
  const hreflangs = ['ko', 'en']
    .map((code) => `<link rel="alternate" hreflang="${code}" href="${escapeHtml(origin + alternates[code])}">`)
    .join('\n    ');
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&display=swap">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(origin + alternates[lang])}">
    ${hreflangs}
    <link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + alternates.ko)}">
  <link rel="stylesheet" href="/assets/style.css">
</head>`;
}

function header({ lang, ui, alternates }) {
  const other = lang === 'ko' ? 'en' : 'ko';
  return `<header class="site-header">
  <a class="site-name" href="/${lang}/">${escapeHtml(ui.siteName)}</a>
  <a class="lang-switch" href="${alternates[other]}" hreflang="${other}" lang="${other}">${escapeHtml(ui.languageSwitch)}</a>
</header>`;
}

function footer(ui) {
  return `<footer class="site-footer">
  <p>${escapeHtml(ui.footer)}</p>
</footer>`;
}

function renderField(field, labels) {
  const label = escapeHtml(labels[field.labelKey]);
  if (field.type === 'checkbox') {
    return `<div class="field field-check">
  <input id="${field.id}" name="${field.id}" type="checkbox">
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
    <input id="${field.id}" name="${field.id}" type="${type}"${inputmode}>
    ${unit}
  </div>
</div>`;
}

function renderOutput(output, labels) {
  const cls = output.primary ? 'output output-primary' : 'output';
  return `<div class="${cls}">
  <span class="output-label">${escapeHtml(labels[output.labelKey])}</span>
  <output id="${output.id}"></output>
</div>`;
}

function renderErrors(keys, labels) {
  return keys
    .map((key) => `<p class="error" data-error="${key}" role="alert" hidden>${escapeHtml(labels[key])}</p>`)
    .join('\n');
}

function renderToolPage({ lang, tool, ui, alternates, origin }) {
  const form = TOOL_FORMS[tool.slug];
  const labels = tool.labels;
  const inputs = form.inputs.map((field) => renderField(field, labels)).join('\n');
  const outputs = form.outputs.map((output) => renderOutput(output, labels)).join('\n');
  return `${head({
    lang,
    title: tool.title,
    description: tool.description,
    origin,
    alternates: alternates.paths,
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
  <section class="howto">
    <h2>${escapeHtml(ui.howToHeading)}</h2>
    <ol>${tool.howTo.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
  </section>
  <section class="faq">
    <h2>${escapeHtml(ui.faqHeading)}</h2>
    ${tool.faq.map((item) => `<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('\n')}
  </section>
</main>
${footer(ui)}
<script type="application/json" id="tool-labels">${JSON.stringify(labels).replace(/</g, '\\u003c')}</script>
<script src="/assets/logic/${LOGIC_FILE[tool.slug]}.js"></script>
<script src="/assets/common.js"></script>
<script src="/assets/tools/${tool.slug}.js" defer></script>
</body>
</html>
`;
}

function renderHome({ lang, ui, tools, alternates, origin }) {
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
  return `${head({ lang, title, description, origin, alternates: alternates.paths })}
<body>
${header({ lang, ui, alternates: alternates.paths })}
<main class="home">
  <h1>${escapeHtml(ui.heroTitle)}</h1>
  <p class="lead">${escapeHtml(ui.heroLead)}</p>
  ${section(ui.categoryCalc, CALC_SLUGS, 'calc')}
  ${section(ui.categoryText, TEXT_SLUGS, 'text')}
</main>
${footer(ui)}
</body>
</html>
`;
}

function renderRootIndex({ ui, origin }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(ui.siteName)}</title>
  <meta name="description" content="${escapeHtml(ui.homeDescription)}">
  <link rel="alternate" hreflang="ko" href="${escapeHtml(origin)}/ko/">
  <link rel="alternate" hreflang="en" href="${escapeHtml(origin)}/en/">
  <link rel="stylesheet" href="/assets/style.css">
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

module.exports = { escapeHtml, renderToolPage, renderHome, renderRootIndex };
