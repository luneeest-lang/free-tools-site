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
const UI_KEYS = ['siteName', 'home', 'languageSwitch', 'footer', 'toolsHeading', 'categoryCalc', 'categoryText'];

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
