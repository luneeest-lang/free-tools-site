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

test('페이지 수는 21 (루트 1, 언어 홈 2, 도구 16, 개인정보 2)', () => {
  const result = buildSite({ rootDir: ROOT, outDir: fs.mkdtempSync(path.join(os.tmpdir(), 'site-count-')) });
  assert.equal(result.pages, 21);
});

test('로직 파일이 site/assets/logic에 복사된다', () => {
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'logic', 'finance.js')));
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'logic', 'text.js')));
});

test('도구 페이지가 로직 파일과 도구 스크립트를 불러온다', () => {
  const page = read('ko/loan-calculator/index.html');
  assert.match(page, /src="\/assets\/logic\/finance\.js\?v=[0-9a-f]{8}"/);
  assert.match(page, /src="\/assets\/tools\/loan-calculator\.js\?v=[0-9a-f]{8}"/);
});

test('도구 페이지에 라벨 데이터가 들어 있다', () => {
  assert.match(read('en/bmi/index.html'), /id="tool-labels"/);
});

test('스타일에 모바일 규칙과 다크 모드 규칙이 있다', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets', 'style.css'), 'utf8');
  assert.match(css, /@media \(max-width/);
  assert.match(css, /prefers-color-scheme: dark/);
});

test('영어 숫자 표기는 페이지 lang 속성을 따른다', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'common.js'), 'utf8');
  assert.match(js, /Intl\.NumberFormat\(document\.documentElement\.lang\)/);
});

test('도구 페이지의 사이트 이름은 해당 언어 홈으로 연결된다', () => {
  assert.match(read('ko/bmi/index.html'), /class="site-name" href="\/ko\/"/);
  assert.match(read('en/bmi/index.html'), /class="site-name" href="\/en\/"/);
});

test('대출 원금 입력은 자동으로 콤마를 넣는다', () => {
  const common = fs.readFileSync(path.join(ROOT, 'assets', 'common.js'), 'utf8');
  const loan = fs.readFileSync(path.join(ROOT, 'assets', 'tools', 'loan-calculator.js'), 'utf8');
  assert.match(common, /function groupDigits/);
  assert.match(loan, /bindAmount\('principal'\)/);
});

test('퇴직금 임금 총액 입력은 자동으로 콤마를 넣는다', () => {
  const severance = fs.readFileSync(path.join(ROOT, 'assets', 'tools', 'severance.js'), 'utf8');
  assert.match(severance, /bindAmount\('wages'\)/);
});

test('도구 페이지는 카테고리 속성을 가진다', () => {
  assert.match(read('ko/loan-calculator/index.html'), /<main class="tool" data-category="calc">/);
  assert.match(read('ko/bmi/index.html'), /<main class="tool" data-category="calc">/);
  assert.match(read('ko/char-count/index.html'), /<main class="tool" data-category="text">/);
});

test('홈 카테고리 섹션에 카테고리 속성이 있다', () => {
  const home = read('ko/index.html');
  assert.match(home, /class="category category-calc" data-category="calc"/);
  assert.match(home, /class="category category-text" data-category="text"/);
});

test('부드러운 글꼴을 Google Fonts에서 불러온다', () => {
  assert.match(read('ko/index.html'), /fonts\.googleapis\.com\/css2\?family=Gowun/);
});

test('스타일에 카테고리별 색 변수가 있다', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets', 'style.css'), 'utf8');
  assert.match(css, /\[data-category="calc"\]/);
  assert.match(css, /\[data-category="text"\]/);
});

test('스타일과 스크립트 주소에 버전 번호가 붙는다', () => {
  const page = read('ko/bmi/index.html');
  assert.match(page, /href="\/assets\/style\.css\?v=[0-9a-f]{8}"/);
  assert.match(page, /src="\/assets\/common\.js\?v=[0-9a-f]{8}"/);
  assert.match(page, /src="\/assets\/tools\/bmi\.js\?v=[0-9a-f]{8}"/);
});

test('한국어 도구 페이지에 확장 콘텐츠 섹션이 렌더링된다', () => {
  const page = read('ko/loan-calculator/index.html');
  assert.match(page, /<section class="formula">/);
  assert.match(page, /<section class="example">/);
  assert.match(page, /<section class="notes">/);
  assert.match(page, /<section class="sources">/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.match(page, /class="updated"[^>]*>[^<]*2026-10-19/);
});

test('출처가 없는 도구는 참고 자료 섹션을 만들지 않는다', () => {
  assert.doesNotMatch(read('ko/char-count/index.html'), /<section class="sources">/);
});

test('영어 페이지는 아직 확장 섹션 없이도 정상 생성된다', () => {
  assert.doesNotMatch(read('en/loan-calculator/index.html'), /<section class="formula">/);
});

test('BMI 스크립트는 한국어 페이지에서 한국 기준을 쓴다', () => {
  const js = fs.readFileSync(path.join(ROOT, 'assets', 'tools', 'bmi.js'), 'utf8');
  assert.match(js, /documentElement\.lang === 'ko'/);
  assert.match(js, /'korea'/);
});

test('줄바꿈 정리 페이지에 합치기 체크박스가 있다', () => {
  assert.match(read('ko/line-cleanup/index.html'), /id="joinLines"/);
  assert.match(read('en/line-cleanup/index.html'), /id="joinLines"/);
});

function buildWithConfig(config) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-config-'));
  buildSite({ rootDir: ROOT, outDir: dir, config });
  return dir;
}

test('개인정보처리방침 페이지가 두 언어로 생성된다', () => {
  assert.match(read('ko/privacy/index.html'), /<html lang="ko"/);
  assert.match(read('en/privacy/index.html'), /<html lang="en"/);
  assert.match(read('ko/privacy/index.html'), /hreflang="en"/);
});

test('모든 푸터에 개인정보처리방침 링크가 있다', () => {
  assert.match(read('ko/bmi/index.html'), /href="\/ko\/privacy\/"/);
  assert.match(read('en/index.html'), /href="\/en\/privacy\/"/);
  assert.match(read('ko/privacy/index.html'), /href="\/ko\/privacy\/"/);
});

test('사이트맵에 개인정보처리방침 주소가 들어간다', () => {
  assert.match(read('sitemap.xml'), /\/ko\/privacy\//);
  assert.match(read('sitemap.xml'), /\/en\/privacy\//);
});

test('설정이 비어 있으면 광고 코드와 ads.txt를 만들지 않는다', () => {
  const dir = buildWithConfig({ adsensePublisherId: '', contactEmail: '' });
  assert.ok(!fs.existsSync(path.join(dir, 'ads.txt')));
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'ko', 'index.html'), 'utf8'), /adsbygoogle/);
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'ko', 'privacy', 'index.html'), 'utf8'), /mailto:/);
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'ko', 'index.html'), 'utf8'), /광고 서비스는 쿠키/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('게시자 ID가 있으면 ads.txt와 광고 코드가 생긴다', () => {
  const dir = buildWithConfig({ adsensePublisherId: 'pub-1234567890123456', contactEmail: 'hello@example.com' });
  assert.equal(
    fs.readFileSync(path.join(dir, 'ads.txt'), 'utf8').trim(),
    'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0'
  );
  for (const page of ['index.html', 'ko/index.html', 'en/bmi/index.html', 'ko/privacy/index.html']) {
    assert.match(
      fs.readFileSync(path.join(dir, page), 'utf8'),
      /adsbygoogle\.js\?client=ca-pub-1234567890123456/,
      page
    );
  }
  assert.match(fs.readFileSync(path.join(dir, 'ko', 'index.html'), 'utf8'), /광고 서비스는 쿠키/);
  assert.match(fs.readFileSync(path.join(dir, 'ko', 'privacy', 'index.html'), 'utf8'), /mailto:hello@example\.com/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('형식이 잘못된 게시자 ID나 이메일은 빌드를 중단한다', () => {
  assert.throws(() => buildWithConfig({ adsensePublisherId: 'ca-pub-123', contactEmail: '' }), /adsensePublisherId/);
  assert.throws(() => buildWithConfig({ adsensePublisherId: '', contactEmail: 'not-an-email' }), /contactEmail/);
});

test('네이버 소유 확인 값이 있으면 모든 페이지 head에 메타 태그가 들어간다', () => {
  const token = '039452e4a2ed6ef92166e9a02eaa07735279ac95';
  const dir = buildWithConfig({ adsensePublisherId: '', contactEmail: '', naverSiteVerification: token });
  for (const page of ['index.html', 'ko/index.html', 'en/index.html', 'ko/bmi/index.html', 'en/privacy/index.html']) {
    assert.match(
      fs.readFileSync(path.join(dir, page), 'utf8'),
      new RegExp(`<meta name="naver-site-verification" content="${token}" />`),
      page
    );
  }
  fs.rmSync(dir, { recursive: true, force: true });
});

test('네이버 소유 확인 값이 비어 있으면 메타 태그를 만들지 않는다', () => {
  const dir = buildWithConfig({ adsensePublisherId: '', contactEmail: '', naverSiteVerification: '' });
  assert.doesNotMatch(fs.readFileSync(path.join(dir, 'ko', 'index.html'), 'utf8'), /naver-site-verification/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('형식이 잘못된 네이버 소유 확인 값은 빌드를 중단한다', () => {
  assert.throws(
    () => buildWithConfig({ adsensePublisherId: '', contactEmail: '', naverSiteVerification: '"><script>' }),
    /naverSiteVerification/
  );
});
