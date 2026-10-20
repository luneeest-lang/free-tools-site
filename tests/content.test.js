const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'content');
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
const REQUIRED_KEYS = ['slug', 'title', 'description', 'h1', 'intro', 'howTo', 'faq', 'labels'];
const UI_KEYS = [
  'siteName',
  'home',
  'languageSwitch',
  'footer',
  'toolsHeading',
  'categoryCalc',
  'categoryText',
  'formulaHeading',
  'exampleHeading',
  'notesHeading',
  'sourcesHeading',
  'updatedLabel',
  'privacyLink',
  'footerAds',
];
const SOURCE_SLUGS = ['loan-calculator', 'bmi', 'severance'];

function load(lang, slug) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, lang, `${slug}.json`), 'utf8'));
}

test('8개 도구마다 한국어와 영어 파일이 있다', () => {
  for (const lang of LANGS) {
    for (const slug of SLUGS) {
      assert.ok(fs.existsSync(path.join(ROOT, lang, `${slug}.json`)), `${lang}/${slug}.json`);
    }
  }
});

test('UI 문구 파일에 필수 키가 있다', () => {
  for (const lang of LANGS) {
    const ui = JSON.parse(fs.readFileSync(path.join(ROOT, 'ui', `${lang}.json`), 'utf8'));
    for (const key of UI_KEYS) {
      assert.ok(key in ui, `ui/${lang}.json has ${key}`);
    }
  }
});

test('도구 파일에 필수 키가 있고 slug가 파일 이름과 같다', () => {
  for (const lang of LANGS) {
    for (const slug of SLUGS) {
      const tool = load(lang, slug);
      for (const key of REQUIRED_KEYS) {
        assert.ok(key in tool, `${lang}/${slug} has ${key}`);
      }
      assert.equal(tool.slug, slug);
    }
  }
});

test('title은 60자, description은 160자 이하', () => {
  for (const lang of LANGS) {
    for (const slug of SLUGS) {
      const tool = load(lang, slug);
      assert.ok(tool.title.length <= 60, `${lang}/${slug} title length`);
      assert.ok(tool.description.length <= 160, `${lang}/${slug} description length`);
    }
  }
});

test('FAQ는 정확히 3개', () => {
  for (const lang of LANGS) {
    for (const slug of SLUGS) {
      assert.equal(load(lang, slug).faq.length, 3, `${lang}/${slug} faq count`);
    }
  }
});

test('같은 도구의 한국어와 영어 labels 키 집합이 같다', () => {
  for (const slug of SLUGS) {
    const ko = Object.keys(load('ko', slug).labels).sort();
    const en = Object.keys(load('en', slug).labels).sort();
    assert.deepEqual(en, ko, `${slug} label keys`);
  }
});

test('같은 언어 안에서 title이 중복되지 않는다', () => {
  for (const lang of LANGS) {
    const titles = SLUGS.map((slug) => load(lang, slug).title);
    assert.equal(new Set(titles).size, titles.length);
  }
});

test('영어 퇴직금 페이지는 한국 제도 기준임을 밝힌다', () => {
  assert.ok(load('en', 'severance').intro.includes('Korean'));
});

test('한국어 도구 페이지에 계산 방식, 예시, 주의사항, 수정일이 있다', () => {
  for (const slug of SLUGS) {
    const tool = load('ko', slug);
    assert.equal(typeof tool.formula, 'string', `${slug} formula`);
    assert.equal(typeof tool.example, 'string', `${slug} example`);
    assert.ok(Array.isArray(tool.notes) && tool.notes.length >= 2, `${slug} notes`);
    assert.match(tool.updated, /^\d{4}-\d{2}-\d{2}$/, `${slug} updated`);
  }
});

test('한국어 계산 방식과 예시의 합계는 150자 이상이다', () => {
  for (const slug of SLUGS) {
    const tool = load('ko', slug);
    assert.ok(tool.formula.length + tool.example.length >= 150, `${slug} body length`);
  }
});

test('금융과 건강 계산기는 공식 출처 링크를 가진다', () => {
  for (const slug of SOURCE_SLUGS) {
    const { sources } = load('ko', slug);
    assert.ok(Array.isArray(sources) && sources.length >= 1, `${slug} sources`);
    for (const source of sources) {
      assert.equal(typeof source.title, 'string');
      assert.ok(source.url.startsWith('https://'), `${slug} source url`);
    }
  }
});

test('BMI 라벨에 한국 기준 분류 이름이 있다', () => {
  for (const lang of LANGS) {
    const { labels } = load(lang, 'bmi');
    for (const key of ['categoryPreObese', 'categoryObese1', 'categoryObese2', 'categoryObese3']) {
      assert.ok(key in labels, `${lang} bmi label ${key}`);
    }
  }
});

test('줄바꿈 정리 라벨에 합치기 옵션 이름이 있다', () => {
  for (const lang of LANGS) {
    assert.ok('joinLinesLabel' in load(lang, 'line-cleanup').labels, `${lang} joinLinesLabel`);
  }
});

test('한국어 BMI 페이지는 한국 기준임을 밝힌다', () => {
  const tool = load('ko', 'bmi');
  assert.ok(tool.faq[0].a.includes('한국'));
  assert.ok(!tool.notes[0].includes('WHO 국제 기준입니다'));
});

function loadPrivacy(lang) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, lang, 'privacy.json'), 'utf8'));
}

test('개인정보처리방침 콘텐츠가 두 언어로 있다', () => {
  for (const lang of LANGS) {
    const page = loadPrivacy(lang);
    assert.equal(page.slug, 'privacy');
    assert.ok(page.title.length <= 60, `${lang} privacy title length`);
    assert.ok(page.description.length <= 160, `${lang} privacy description length`);
    assert.match(page.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(Array.isArray(page.sections) && page.sections.length >= 5, `${lang} sections`);
    for (const section of page.sections) {
      assert.equal(typeof section.heading, 'string');
      assert.ok(Array.isArray(section.paragraphs) && section.paragraphs.length >= 1);
    }
    assert.equal(typeof page.contact.heading, 'string');
    assert.equal(typeof page.contact.text, 'string');
  }
});

test('개인정보처리방침은 쿠키, 광고, 글꼴 서비스, 입력값 처리를 다룬다', () => {
  const ko = JSON.stringify(loadPrivacy('ko'));
  for (const word of ['쿠키', 'AdSense', 'Google Fonts', 'GitHub Pages', '서버로 전송되지 않']) {
    assert.ok(ko.includes(word), `ko privacy mentions ${word}`);
  }
  const en = JSON.stringify(loadPrivacy('en'));
  for (const word of ['cookies', 'AdSense', 'Google Fonts', 'GitHub Pages', 'never sent']) {
    assert.ok(en.includes(word), `en privacy mentions ${word}`);
  }
});

test('개인정보처리방침 외부 링크는 https 주소다', () => {
  for (const lang of LANGS) {
    for (const section of loadPrivacy(lang).sections) {
      for (const link of section.links || []) {
        assert.ok(link.url.startsWith('https://'), `${lang} privacy link ${link.url}`);
      }
    }
  }
});
