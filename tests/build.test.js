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

test('페이지 수는 46 (루트 1, 언어 홈 2, 도구 28, 개인정보 2, 소개 2, 가이드 목록 2, 가이드 9)', () => {
  const result = buildSite({ rootDir: ROOT, outDir: fs.mkdtempSync(path.join(os.tmpdir(), 'site-count-')) });
  assert.equal(result.pages, 46);
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
  assert.match(page, /class="updated"[^>]*>[^<]*2026-10-29/);
});

test('출처가 없는 도구는 참고 자료 섹션을 만들지 않는다', () => {
  assert.doesNotMatch(read('ko/char-count/index.html'), /<section class="sources">/);
});

test('영어 도구 페이지에도 확장 콘텐츠 섹션이 렌더링된다', () => {
  const page = read('en/loan-calculator/index.html');
  assert.match(page, /<section class="formula">/);
  assert.match(page, /<section class="example">/);
  assert.match(page, /<section class="notes">/);
  assert.match(page, /class="updated"[^>]*>Last updated: 2026-10-29/);
});

test('영어 BMI와 퇴직금 페이지는 출처 섹션이 있고 텍스트 도구는 없다', () => {
  assert.match(read('en/bmi/index.html'), /<section class="sources">/);
  assert.match(read('en/severance/index.html'), /<section class="sources">/);
  assert.doesNotMatch(read('en/char-count/index.html'), /<section class="sources">/);
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

test('한국어 가이드 목록과 글 페이지가 생성된다', () => {
  assert.ok(fs.existsSync(path.join(outDir, 'ko', 'guides', 'index.html')));
  for (const slug of ['loan-repayment-methods', 'bmi', 'char-count']) {
    const page = read(`ko/guides/${slug}/index.html`);
    assert.match(page, /<html lang="ko"/);
    assert.match(page, /<main class="guide"/);
    assert.doesNotMatch(page, /<link rel="alternate" hreflang="en"/);
    assert.match(page, /class="lang-switch" href="\/en\/guides\/"/);
  }
});

test('영어 가이드 목록과 글 페이지가 생성된다', () => {
  const hub = read('en/guides/index.html');
  assert.match(hub, /<html lang="en"/);
  assert.match(hub, /href="\/en\/guides\/korean-severance-pay\/"/);
  assert.match(hub, /href="\/en\/guides\/korean-bmi-categories\/"/);
  assert.match(hub, /<link rel="alternate" hreflang="ko" href="https:\/\/moatool\.com\/ko\/guides\/">/);
  for (const slug of ['korean-severance-pay', 'korean-bmi-categories']) {
    const page = read(`en/guides/${slug}/index.html`);
    assert.match(page, /<html lang="en"/);
    assert.match(page, /<main class="guide"/);
    assert.match(page, /<section class="sources">/);
    assert.doesNotMatch(page, /undefined/);
  }
  assert.match(read('en/guides/korean-severance-pay/index.html'), /class="cta" href="\/en\/severance\/"/);
  assert.match(read('en/guides/korean-bmi-categories/index.html'), /class="cta" href="\/en\/bmi\/"/);
});

test('짝이 있는 가이드는 hreflang과 언어 전환으로 서로 연결된다', () => {
  const ko = read('ko/guides/severance/index.html');
  const en = read('en/guides/korean-severance-pay/index.html');
  assert.match(ko, /hreflang="en" href="https:\/\/moatool\.com\/en\/guides\/korean-severance-pay\/"/);
  assert.match(ko, /class="lang-switch" href="\/en\/guides\/korean-severance-pay\/"/);
  assert.match(en, /hreflang="ko" href="https:\/\/moatool\.com\/ko\/guides\/severance\/"/);
  assert.match(en, /class="lang-switch" href="\/ko\/guides\/severance\/"/);
});

test('짝이 없는 영어 가이드는 x-default로 자기 주소를 쓴다', () => {
  const page = read('en/guides/korean-bmi-categories/index.html');
  assert.match(page, /hreflang="x-default" href="https:\/\/moatool\.com\/en\/guides\/korean-bmi-categories\/"/);
  assert.match(page, /class="lang-switch" href="\/ko\/guides\/"/);
});

test('가이드 글에서 연결된 도구로 이동하는 링크가 있다', () => {
  assert.match(read('ko/guides/severance/index.html'), /class="cta" href="\/ko\/severance\/"/);
  assert.match(read('ko/guides/loan-repayment-methods/index.html'), /class="cta" href="\/ko\/loan-calculator\/"/);
});

test('도구 페이지에서 관련 가이드로 이동하는 링크가 있다', () => {
  assert.match(read('ko/severance/index.html'), /href="\/ko\/guides\/severance\/"/);
  assert.match(read('ko/loan-calculator/index.html'), /href="\/ko\/guides\/loan-repayment-methods\/"/);
  assert.match(read('ko/bmi/index.html'), /href="\/ko\/guides\/bmi\/"/);
  assert.match(read('ko/char-count/index.html'), /href="\/ko\/guides\/char-count\/"/);
  assert.doesNotMatch(read('ko/date-diff/index.html'), /class="related-guide"/);
  assert.match(read('en/severance/index.html'), /href="\/en\/guides\/korean-severance-pay\/"/);
  assert.match(read('en/bmi/index.html'), /href="\/en\/guides\/korean-bmi-categories\/"/);
  assert.doesNotMatch(read('en/loan-calculator/index.html'), /class="related-guide"/);
});

test('두 언어 홈과 푸터에 가이드가 보인다', () => {
  for (const lang of ['ko', 'en']) {
    const home = read(`${lang}/index.html`);
    assert.match(home, /data-category="guide"/);
    assert.match(home, new RegExp(`<footer[\\s\\S]*href="/${lang}/guides/"[\\s\\S]*</footer>`));
  }
  assert.match(read('en/index.html'), /href="\/en\/guides\/korean-severance-pay\/"/);
});

test('사이트맵에 두 언어 가이드 주소가 들어간다', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /<loc>https:\/\/moatool\.com\/ko\/guides\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/moatool\.com\/ko\/guides\/severance\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/moatool\.com\/en\/guides\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/moatool\.com\/en\/guides\/korean-bmi-categories\/<\/loc>/);
});

test('가이드 글에 출처 링크와 수정일이 렌더링된다', () => {
  const page = read('ko/guides/severance/index.html');
  assert.match(page, /<section class="sources">/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.match(page, /class="updated"/);
});

test('영어 대출 계산기는 소수점 둘째 자리까지 보여 주고 한국어는 정수로 보여 준다', () => {
  const common = fs.readFileSync(path.join(ROOT, 'assets', 'common.js'), 'utf8');
  const loan = fs.readFileSync(path.join(ROOT, 'assets', 'tools', 'loan-calculator.js'), 'utf8');
  assert.match(common, /function fmtMoney/);
  assert.match(loan, /documentElement\.lang === 'ko' \? 0 : 2/);
  assert.match(loan, /fmtMoney/);
  assert.match(loan, /decimals/);
});

test('날짜 차이 페이지에 나머지 일수 결과 칸이 있다', () => {
  assert.match(read('ko/date-diff/index.html'), /<output id="remainder">/);
  assert.match(read('en/date-diff/index.html'), /<output id="remainder">/);
});

test('모든 페이지 head에 파비콘 링크가 있다', () => {
  for (const page of ['index.html', 'ko/index.html', 'en/bmi/index.html', 'ko/guides/bmi/index.html', 'ko/privacy/index.html']) {
    const html = read(page);
    assert.match(html, /<link rel="icon" href="\/assets\/favicon\.svg\?v=[0-9a-f]{8}" type="image\/svg\+xml">/, page);
    assert.match(html, /<link rel="icon" href="\/favicon\.ico" sizes="48x48">/, page);
    assert.match(html, /<link rel="apple-touch-icon" href="\/assets\/apple-touch-icon\.png\?v=[0-9a-f]{8}">/, page);
  }
});

test('파비콘 파일이 올바른 형식으로 생성된다', () => {
  const svg = read('assets/favicon.svg');
  assert.match(svg, /<svg[^>]*viewBox="0 0 64 64"/);
  const ico = fs.readFileSync(path.join(outDir, 'favicon.ico'));
  assert.deepEqual([...ico.subarray(0, 4)], [0, 0, 1, 0]);
  assert.equal(ico[6], 48);
  assert.equal(ico[7], 48);
  const png = fs.readFileSync(path.join(outDir, 'assets', 'apple-touch-icon.png'));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 180);
  assert.equal(png.readUInt32BE(20), 180);
});

test('소개 페이지가 두 언어로 생성되고 서로 연결된다', () => {
  const ko = read('ko/about/index.html');
  const en = read('en/about/index.html');
  assert.match(ko, /<html lang="ko"/);
  assert.match(en, /<html lang="en"/);
  assert.match(ko, /<link rel="alternate" hreflang="en" href="https:\/\/moatool\.com\/en\/about\/">/);
  assert.match(ko, /<main class="about">/);
});

test('소개 페이지에 문의 이메일이 설정에 따라 표시된다', () => {
  const withMail = buildWithConfig({ adsensePublisherId: '', contactEmail: 'hello@example.com' });
  assert.match(fs.readFileSync(path.join(withMail, 'ko', 'about', 'index.html'), 'utf8'), /mailto:hello@example\.com/);
  fs.rmSync(withMail, { recursive: true, force: true });
  const noMail = buildWithConfig({ adsensePublisherId: '', contactEmail: '' });
  assert.doesNotMatch(fs.readFileSync(path.join(noMail, 'ko', 'about', 'index.html'), 'utf8'), /mailto:/);
  fs.rmSync(noMail, { recursive: true, force: true });
});

test('모든 페이지 헤더에 메뉴가 있다', () => {
  for (const page of ['ko/index.html', 'ko/bmi/index.html', 'ko/guides/severance/index.html', 'ko/privacy/index.html', 'ko/about/index.html']) {
    const html = read(page);
    assert.match(html, /<nav class="site-nav"/, page);
    assert.match(html, /<a href="\/ko\/">도구<\/a>/, page);
    assert.match(html, /<a href="\/ko\/guides\/">가이드<\/a>/, page);
    assert.match(html, /<a href="\/ko\/about\/">소개<\/a>/, page);
  }
  for (const page of ['en/index.html', 'en/bmi/index.html', 'en/about/index.html', 'en/guides/index.html']) {
    const html = read(page);
    assert.match(html, /<a href="\/en\/">Tools<\/a>/, page);
    assert.match(html, /<a href="\/en\/guides\/">Guides<\/a>/, page);
    assert.match(html, /<a href="\/en\/about\/">About<\/a>/, page);
  }
});

test('푸터에 소개 링크가 있고 사이트맵에 소개 주소가 있다', () => {
  assert.match(read('ko/bmi/index.html'), /<footer[\s\S]*href="\/ko\/about\/"[\s\S]*<\/footer>/);
  assert.match(read('en/index.html'), /<footer[\s\S]*href="\/en\/about\/"[\s\S]*<\/footer>/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/moatool\.com\/ko\/about\/<\/loc>/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/moatool\.com\/en\/about\/<\/loc>/);
});

test('퇴직금 계산기는 입사일과 퇴직일, 상여금, 연차수당을 입력받는다', () => {
  for (const lang of ['ko', 'en']) {
    const page = read(`${lang}/severance/index.html`);
    for (const id of ['hireDate', 'leaveDate', 'wages', 'annualBonus', 'annualLeavePay']) {
      assert.match(page, new RegExp(`id="${id}"`), `${lang} ${id}`);
    }
    for (const id of ['severance', 'dailyWage', 'daysWorked', 'period']) {
      assert.match(page, new RegExp(`<output id="${id}">`), `${lang} output ${id}`);
    }
    assert.doesNotMatch(page, /id="daysLast3"/, `${lang} old input removed`);
    assert.match(page, /type="date"/);
  }
});

test('대출 계산기에 상환 방식 선택과 월별 상환표가 있다', () => {
  for (const lang of ['ko', 'en']) {
    const page = read(`${lang}/loan-calculator/index.html`);
    assert.match(page, /<select id="method"/, lang);
    for (const value of ['equalPayment', 'equalPrincipal', 'bullet']) {
      assert.match(page, new RegExp(`<option value="${value}"`), `${lang} ${value}`);
    }
    assert.match(page, /<output id="lastPayment">/, lang);
    assert.match(page, /<details class="schedule"/, lang);
    assert.match(page, /<tbody id="schedule-body">/, lang);
  }
});

test('날짜 더하기 페이지가 두 언어로 생성되고 홈과 사이트맵에 들어간다', () => {
  for (const lang of ['ko', 'en']) {
    const page = read(`${lang}/date-add/index.html`);
    assert.match(page, /<input id="start"[^>]*type="date"/);
    assert.match(page, /<input id="days"[^>]*inputmode="numeric"/);
    assert.match(page, /<input id="includeStart"[^>]*type="checkbox"/);
    assert.match(page, /<output id="resultDate">/);
    assert.match(page, /\/assets\/logic\/date\.js/);
    assert.match(read(`${lang}/index.html`), new RegExp(`href="/${lang}/date-add/"`));
  }
  assert.match(read('sitemap.xml'), /https:\/\/moatool\.com\/ko\/date-add\//);
});

test('글자수 세기 페이지에 바이트 결과 칸이 있다', () => {
  const page = read('ko/char-count/index.html');
  assert.match(page, /<output id="bytesKr">/);
  assert.match(page, /<output id="bytesUtf8">/);
});

test('텍스트 변환 결과에는 복사 버튼이 있고 계산기에는 없다', () => {
  for (const slug of ['case-convert', 'line-cleanup', 'dedupe-lines']) {
    for (const lang of ['ko', 'en']) {
      assert.match(read(`${lang}/${slug}/index.html`), /<button type="button" class="copy-btn" data-copy="output"[^>]*>/, `${lang}/${slug}`);
    }
  }
  assert.match(read('ko/case-convert/index.html'), /data-copied="복사했습니다"/);
  assert.doesNotMatch(read('ko/bmi/index.html'), /data-copy=/);
});

test('새 계산기 5개가 두 언어로 생성되고 알맞은 로직 파일을 불러온다', () => {
  const logic = {
    'hourly-wage': 'finance',
    'korean-age': 'date',
    'discharge-date': 'date',
    pyeong: 'units',
    percent: 'units',
  };
  for (const [slug, file] of Object.entries(logic)) {
    for (const lang of ['ko', 'en']) {
      const page = read(`${lang}/${slug}/index.html`);
      assert.match(page, new RegExp(`/assets/logic/${file}\.js`), `${lang}/${slug}`);
      assert.match(page, new RegExp(`/assets/tools/${slug}\.js`), `${lang}/${slug}`);
      assert.match(read(`${lang}/index.html`), new RegExp(`href="/${lang}/${slug}/"`));
    }
  }
  assert.ok(fs.existsSync(path.join(outDir, 'assets', 'logic', 'units.js')));
});

test('시급 계산기는 주휴수당 포함이 기본으로 켜져 있다', () => {
  assert.match(read('ko/hourly-wage/index.html'), /<input id="includeHoliday" name="includeHoliday" type="checkbox" checked>/);
  assert.match(read('ko/line-cleanup/index.html'), /<input id="joinLines" name="joinLines" type="checkbox">/);
});

test('계산기에는 결과 링크 복사 버튼이 있고 텍스트 도구에는 없다', () => {
  for (const slug of ['loan-calculator', 'date-add', 'discharge-date', 'percent']) {
    const page = read(`ko/${slug}/index.html`);
    assert.match(page, /data-share/, slug);
    assert.match(page, /class="share-hint"/, slug);
  }
  assert.match(read('ko/date-add/index.html'), /data-copied="링크를 복사했습니다"/);
  assert.doesNotMatch(read('ko/char-count/index.html'), /data-share/);
});

test('기준일 입력은 공유 링크에서 빠진다', () => {
  assert.match(read('ko/discharge-date/index.html'), /<input id="on" name="on" type="date" data-no-share>/);
  assert.match(read('ko/korean-age/index.html'), /<input id="on" name="on" type="date" data-no-share>/);
  assert.match(read('ko/discharge-date/index.html'), /<input id="enlist" name="enlist" type="date">/);
});

test('새 가이드가 도구와 연결되고 만 나이 가이드는 두 언어가 짝을 이룬다', () => {
  assert.match(read('ko/hourly-wage/index.html'), /href="\/ko\/guides\/weekly-holiday-pay\/"/);
  assert.match(read('ko/korean-age/index.html'), /href="\/ko\/guides\/korean-age\/"/);
  assert.match(read('en/korean-age/index.html'), /href="\/en\/guides\/korean-age-explained\/"/);
  assert.match(read('ko/guides/weekly-holiday-pay/index.html'), /class="cta" href="\/ko\/hourly-wage\/"/);
  assert.match(read('ko/guides/korean-age/index.html'), /hreflang="en" href="https:\/\/moatool\.com\/en\/guides\/korean-age-explained\/"/);
  assert.match(read('en/guides/korean-age-explained/index.html'), /class="lang-switch" href="\/ko\/guides\/korean-age\/"/);
});

test('모든 언어 페이지에 공유 미리보기(Open Graph) 태그가 있다', () => {
  const pages = {
    'ko/index.html': 'https://moatool.com/ko/',
    'ko/hourly-wage/index.html': 'https://moatool.com/ko/hourly-wage/',
    'en/korean-age/index.html': 'https://moatool.com/en/korean-age/',
    'ko/guides/weekly-holiday-pay/index.html': 'https://moatool.com/ko/guides/weekly-holiday-pay/',
    'en/about/index.html': 'https://moatool.com/en/about/',
  };
  for (const [page, url] of Object.entries(pages)) {
    const html = read(page);
    const title = html.match(/<title>([^<]*)<\/title>/)[1];
    assert.ok(html.includes(`<meta property="og:title" content="${title}">`), page);
    assert.match(html, /<meta property="og:description" content="[^"]+">/, page);
    assert.ok(html.includes(`<meta property="og:url" content="${url}">`), page);
    assert.match(html, /<meta property="og:image" content="https:\/\/moatool\.com\/assets\/og-(ko|en)\.png">/, page);
    assert.match(html, /<meta property="og:site_name" content="[^"]+">/, page);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/, page);
  }
  assert.match(read('ko/guides/weekly-holiday-pay/index.html'), /<meta property="og:type" content="article">/);
  assert.match(read('ko/hourly-wage/index.html'), /<meta property="og:type" content="website">/);
  assert.match(read('ko/index.html'), /<meta property="og:locale" content="ko_KR">/);
  assert.match(read('en/index.html'), /<meta property="og:locale" content="en_US">/);
  assert.match(read('en/index.html'), /og-en\.png/);
});

test('공유 미리보기 이미지는 1200x630 PNG다', () => {
  for (const lang of ['ko', 'en']) {
    const png = fs.readFileSync(path.join(outDir, 'assets', `og-${lang}.png`));
    assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG');
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
  }
});

test('가이드 RSS가 언어별로 생성되고 페이지에서 연결된다', () => {
  const ko = read('ko/guides/rss.xml');
  assert.match(ko, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss version="2\.0"/);
  assert.match(ko, /<link>https:\/\/moatool\.com\/ko\/guides\/<\/link>/);
  assert.match(ko, /<item>[\s\S]*<link>https:\/\/moatool\.com\/ko\/guides\/weekly-holiday-pay\/<\/link>[\s\S]*<\/item>/);
  assert.match(ko, /<pubDate>[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 00:00:00 \+0900<\/pubDate>/);
  assert.equal((ko.match(/<item>/g) || []).length, 6);
  assert.equal((read('en/guides/rss.xml').match(/<item>/g) || []).length, 3);
  assert.match(read('ko/guides/index.html'), /<link rel="alternate" type="application\/rss\+xml" title="[^"]+" href="https:\/\/moatool\.com\/ko\/guides\/rss\.xml">/);
  assert.match(read('ko/guides/severance/index.html'), /type="application\/rss\+xml"/);
  assert.match(read('en/guides/index.html'), /href="https:\/\/moatool\.com\/en\/guides\/rss\.xml"/);
});

test('루트 주소는 이동 없이 한국어 홈을 보여 주고 대표 주소는 /ko/다', () => {
  const html = read('index.html');
  assert.match(html, /<html lang="ko">/);
  assert.doesNotMatch(html, /location\.replace/);
  assert.doesNotMatch(html, /http-equiv="refresh"/);
  assert.match(html, /<main class="home">/);
  assert.match(html, /href="\/ko\/hourly-wage\/"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/moatool\.com\/ko\/">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/moatool\.com\/ko\/">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/moatool\.com\/assets\/og-ko\.png">/);
});
