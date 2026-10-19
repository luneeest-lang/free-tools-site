const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildSite } = require('../scripts/build');

const ROOT = path.join(__dirname, '..');
let outDir;

function read(relative) {
  return fs.readFileSync(path.join(outDir, relative), 'utf8');
}

before(() => {
  outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-build-'));
  buildSite({ rootDir: ROOT, outDir });
});

after(() => {
  fs.rmSync(outDir, { recursive: true, force: true });
});

test('언어별 도구 페이지가 생성된다', () => {
  assert.ok(fs.existsSync(path.join(outDir, 'ko', 'bmi', 'index.html')));
  assert.ok(fs.existsSync(path.join(outDir, 'en', 'bmi', 'index.html')));
});

test('페이지의 html lang 속성이 언어와 같다', () => {
  assert.match(read('ko/bmi/index.html'), /<html lang="ko"/);
  assert.match(read('en/bmi/index.html'), /<html lang="en"/);
});

test('같은 도구의 다른 언어 주소를 hreflang으로 연결한다', () => {
  assert.match(read('ko/bmi/index.html'), /hreflang="en"/);
  assert.match(read('en/bmi/index.html'), /hreflang="ko"/);
});

test('사이트맵에 언어 연결 태그가 들어간다', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<xhtml:link rel="alternate"/);
});

test('robots.txt에 사이트맵 위치가 있다', () => {
  assert.match(read('robots.txt'), /Sitemap: \S+\/sitemap\.xml/);
});

test('루트 안내 페이지가 두 언어 홈으로 링크한다', () => {
  const root = read('index.html');
  assert.match(root, /href="\/ko\/"/);
  assert.match(root, /href="\/en\/"/);
});

test('계산기 페이지에 폼 입력 칸이 있다', () => {
  const page = read('ko/loan-calculator/index.html');
  assert.match(page, /id="principal"/);
  assert.match(page, /id="rate"/);
  assert.match(page, /id="months"/);
});

test('페이지 수는 19 (루트 1, 언어 홈 2, 도구 16)', () => {
  const result = buildSite({ rootDir: ROOT, outDir: fs.mkdtempSync(path.join(os.tmpdir(), 'site-count-')) });
  assert.equal(result.pages, 19);
});
