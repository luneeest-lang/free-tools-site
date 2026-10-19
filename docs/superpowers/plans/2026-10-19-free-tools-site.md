# 무료 도구 웹사이트 구현 계획 (한국어 / English)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 계산기 4종과 텍스트 도구 4종을 한국어/영어 두 언어로 제공하는 정적 도구 사이트를 만든다.

**Architecture:** 계산 로직은 `src/logic/`의 순수 함수로 두고 테스트한다. 페이지 텍스트는 `content/{ko,en}/*.json`에 두고, `scripts/build.js`가 이 파일과 템플릿으로 `site/`의 정적 HTML을 만든다. 브라우저 쪽 JavaScript는 입력과 결과 칸만 연결한다.

**Tech Stack:** Node.js 18+ (내장 `node:test`, `node:assert/strict`, `node:fs`, `node:path`), 순수 HTML/CSS/JavaScript. 외부 npm 패키지는 쓰지 않는다.

**Spec:** [docs/superpowers/specs/2026-10-19-free-tools-site-design.md](../specs/2026-10-19-free-tools-site-design.md)

## Global Constraints

- 외부 npm 패키지를 설치하지 않는다. `package.json`의 `dependencies`와 `devDependencies`는 비워 둔다.
- 배포 결과물(`site/`)은 HTML, CSS, JavaScript만 포함한다.
- 입력값을 서버나 외부 주소로 보내는 코드를 쓰지 않는다.
- 페이지 본문 텍스트는 HTML에 직접 넣는다. JavaScript로 언어를 바꾸지 않는다.
- 언어 전환은 URL 경로(`/ko/`, `/en/`)로만 한다. 언어 설정을 저장하지 않는다.
- 모든 도구 페이지는 `<html lang>`, `<title>`, `<meta name="description">`, `hreflang`을 가진다.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>`을 붙인다.

## Review Focus

1. 대출 금리 0%: 월 상환액은 원금 ÷ 기간이어야 한다. 0으로 나누면 안 된다.
2. 날짜 차이에서 종료일이 시작일보다 앞선 경우: 음수 대신 안내 메시지를 보여야 한다.
3. 빈 입력이나 숫자가 아닌 입력: 결과 대신 입력 오류 안내가 보여야 한다.
4. 여러 줄 텍스트에서 빈 입력과 줄바꿈만 있는 입력: 결과가 빈 문자열이거나 0이어야 한다.
5. 영어 페이지에서 쉼표와 소수점 표기: `Intl`로 `en-US` 형식을 써야 한다.

---

## File Structure

- `package.json`: 스크립트 정의 (`build`, `test`)
- `src/logic/finance.js`: `monthlyPayment`, `severancePay`
- `src/logic/date.js`: `dateDiff`
- `src/logic/health.js`: `bmi`, `bmiCategory`
- `src/logic/text.js`: `charCount`, `convertCase`, `cleanupLines`, `dedupeLines`
- `src/logic/index.js`: 위 함수를 모아 내보냄 (필요 없으면 생략)
- `content/ko/<slug>.json`, `content/en/<slug>.json`: 도구별 텍스트 (8 x 2 = 16개)
- `content/ui/ko.json`, `content/ui/en.json`: 공통 문구 (헤더, 푸터, 언어 선택기 라벨)
- `scripts/build.js`: 템플릿에서 `site/`를 생성
- `scripts/lib/render.js`: 페이지 HTML 조립 함수 (테스트 가능하도록 분리)
- `assets/style.css`: 공통 스타일
- `assets/common.js`: 공통 동작 (현재 언어 표시 등, 최소한만)
- `assets/tools/<slug>.js`: 도구별 입력과 결과 연결 (8개)
- `tests/logic/*.test.js`: 계산 함수 테스트
- `tests/content.test.js`: 텍스트 파일 검사
- `tests/build.test.js`: 빌드 결과 검사

도구 slug: `loan-calculator`, `date-diff`, `bmi`, `severance`, `char-count`, `case-convert`, `line-cleanup`, `dedupe-lines`

---

### Task 1: 프로젝트 기본 설정

**Files:**
- Create: `package.json`
- Create: `.gitignore`

**Interfaces:**
- Consumes: 없음
- Produces: `npm test`는 `node --test tests/`를 실행한다. `npm run build`는 `node scripts/build.js`를 실행한다.

- [ ] **Step 1: `package.json` 작성**

`"private": true`, `"type": "commonjs"`, `scripts.test = "node --test tests/"`, `scripts.build = "node scripts/build.js"`를 넣는다. `dependencies`는 넣지 않는다.

- [ ] **Step 2: `.gitignore` 작성**

내용: `node_modules/`. `site/`는 배포 대상이므로 커밋한다.

- [ ] **Step 3: 테스트 실행 확인**

Run: `npm test`
Expected: 테스트 파일이 없으므로 "tests 0" 또는 파일 없음 메시지가 나오고 오류 없이 끝남

- [ ] **Step 4: 커밋**

```bash
git add package.json .gitignore
git commit -m "chore: add package scripts and gitignore

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 2: 금융 계산 로직 (대출 이자, 퇴직금)

**Files:**
- Create: `src/logic/finance.js`
- Test: `tests/logic/finance.test.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `monthlyPayment({ principal: number, annualRatePercent: number, months: number }) -> { payment: number, totalPayment: number, totalInterest: number }`
    - 원리금균등상환 방식. 금리 0이면 `payment = principal / months`.
    - 금액은 원 단위로 반올림한다 (`Math.round`).
  - `severancePay({ wagesLast3Months: number, daysLast3Months: number, daysWorked: number }) -> { averageDailyWage: number, severance: number }`
    - `averageDailyWage = wagesLast3Months / daysLast3Months`
    - `severance = averageDailyWage * 30 * daysWorked / 365`, 원 단위 반올림
    - `daysLast3Months`나 `daysWorked`가 0 이하이면 `RangeError`를 던진다.

- [ ] **Step 1: 실패하는 테스트 작성**

```js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { monthlyPayment, severancePay } = require('../../src/logic/finance');

test('금리 0%면 원금을 기간으로 나눈다', () => {
  const r = monthlyPayment({ principal: 12000000, annualRatePercent: 0, months: 12 });
  assert.equal(r.payment, 1000000);
  assert.equal(r.totalInterest, 0);
});

test('원리금균등 상환액을 계산한다', () => {
  // 1억 원, 연 5%, 360개월
  const r = monthlyPayment({ principal: 100000000, annualRatePercent: 5, months: 360 });
  assert.equal(r.payment, 536821);
});

test('퇴직금은 평균임금 x 30 x 근속일수 / 365', () => {
  const r = severancePay({ wagesLast3Months: 9000000, daysLast3Months: 90, daysWorked: 365 });
  assert.equal(r.averageDailyWage, 100000);
  assert.equal(r.severance, 3000000);
});

test('기간이 0 이하이면 RangeError', () => {
  assert.throws(() => severancePay({ wagesLast3Months: 1, daysLast3Months: 0, daysWorked: 10 }), RangeError);
});
```

- [ ] **Step 2: 테스트 실행해서 실패 확인**

Run: `node --test tests/logic/finance.test.js`
Expected: FAIL, `Cannot find module '../../src/logic/finance'`

- [ ] **Step 3: `src/logic/finance.js` 구현**

위 Interfaces의 두 함수를 `module.exports`로 내보낸다. 원리금균등 공식은 `P * r * (1+r)^n / ((1+r)^n - 1)`이며, `r`은 월 금리(`annualRatePercent / 100 / 12`)다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test tests/logic/finance.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/logic/finance.js tests/logic/finance.test.js
git commit -m "feat: add loan payment and severance calculations

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 3: 날짜 차이와 BMI 로직

**Files:**
- Create: `src/logic/date.js`, `src/logic/health.js`
- Test: `tests/logic/date.test.js`, `tests/logic/health.test.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `dateDiff({ start: string, end: string }) -> { days: number, weeks: number, remainderDays: number, error: null } | { error: 'end_before_start' | 'invalid_date' }`
    - `start`, `end`는 `YYYY-MM-DD` 문자열. UTC 기준으로 계산해 시간대 영향을 없앤다.
    - `days`는 `end - start`의 일수. `weeks`는 `Math.floor(days / 7)`, `remainderDays`는 `days % 7`.
  - `bmi({ heightCm: number, weightKg: number }) -> number | null`
    - `weight / (height/100)^2`, 소수점 첫째 자리로 반올림. 입력이 양수가 아니면 `null`.
  - `bmiCategory(value: number) -> 'underweight' | 'normal' | 'overweight' | 'obese'`
    - 18.5 미만, 25 미만, 30 미만, 그 이상. 경계값은 아래 등급에 넣지 않는다 (18.5는 `normal`, 25는 `overweight`).

- [ ] **Step 1: 실패하는 테스트 작성**

테스트 항목:
- `dateDiff({ start: '2024-02-28', end: '2024-03-01' })`의 `days`는 2 (윤년)
- `dateDiff({ start: '2025-03-01', end: '2025-02-01' })`는 `error: 'end_before_start'`
- `dateDiff({ start: '2025-13-01', end: '2025-02-01' })`는 `error: 'invalid_date'`
- `bmi({ heightCm: 170, weightKg: 65 })`는 `22.5`
- `bmi({ heightCm: 0, weightKg: 65 })`는 `null`
- `bmiCategory(18.5)`는 `'normal'`, `bmiCategory(25)`는 `'overweight'`

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/logic/`
Expected: FAIL, 모듈을 찾을 수 없음

- [ ] **Step 3: 두 파일 구현**

날짜 검사는 정규식으로 형식을 본 뒤 `Date.UTC`로 실제 존재하는 날짜인지 확인한다. 잘못된 날짜는 `invalid_date`다.

- [ ] **Step 4: 통과 확인**

Run: `node --test tests/logic/`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/logic/date.js src/logic/health.js tests/logic/date.test.js tests/logic/health.test.js
git commit -m "feat: add date difference and BMI calculations

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 텍스트 도구 로직

**Files:**
- Create: `src/logic/text.js`
- Test: `tests/logic/text.test.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `charCount(text: string) -> { chars: number, charsNoSpaces: number, words: number, lines: number }`
    - `words`는 공백으로 나눈 조각 중 빈 것을 뺀 수. 빈 문자열이면 모두 0 (`lines`도 0).
  - `convertCase(text: string, mode: 'upper' | 'lower' | 'title' | 'sentence') -> string`
    - `title`은 각 단어의 첫 글자만 대문자. `sentence`는 첫 글자만 대문자.
    - 한글은 그대로 둔다.
  - `cleanupLines(text: string) -> string`
    - 각 줄 앞뒤 공백 제거. 연속된 빈 줄은 하나로 줄인다. 앞뒤의 빈 줄은 제거한다.
  - `dedupeLines(text: string, options?: { ignoreCase?: boolean }) -> { result: string, removed: number }`
    - 처음 나온 줄만 남긴다. 순서는 유지한다. `ignoreCase` 기본값은 `false`.
    - 빈 줄은 중복 처리 대상에서 제외하고 그대로 둔다.

- [ ] **Step 1: 실패하는 테스트 작성**

테스트 항목:
- `charCount('')`는 모두 0
- `charCount('a b\nc')`의 `chars`는 5, `charsNoSpaces`는 3, `words`는 3, `lines`는 2
- `convertCase('hello world', 'title')`은 `'Hello World'`
- `convertCase('안녕 hello', 'upper')`은 `'안녕 HELLO'`
- `cleanupLines('  a  \n\n\n  b \n')`은 `'a\n\nb'`
- `cleanupLines('')`은 `''`
- `dedupeLines('a\nb\na')`은 `{ result: 'a\nb', removed: 1 }`
- `dedupeLines('A\na', { ignoreCase: true })`은 `{ result: 'A', removed: 1 }`

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/logic/text.test.js`
Expected: FAIL

- [ ] **Step 3: `src/logic/text.js` 구현**

줄바꿈은 `\r\n`과 `\n`을 모두 처리한다. 결과의 줄바꿈은 `\n`으로 통일한다.

- [ ] **Step 4: 통과 확인**

Run: `node --test tests/logic/text.test.js`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/logic/text.js tests/logic/text.test.js
git commit -m "feat: add text tool logic

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 5: 콘텐츠 파일과 검사

**Files:**
- Create: `content/ui/ko.json`, `content/ui/en.json`
- Create: `content/ko/<slug>.json`, `content/en/<slug>.json` (8개 slug x 2 = 16개)
- Test: `tests/content.test.js`

**Interfaces:**
- Consumes: 없음
- Produces, 도구 콘텐츠 파일 스키마:
  ```json
  {
    "slug": "bmi",
    "title": "BMI 계산기 | 키와 몸무게로 BMI 계산",
    "description": "키와 몸무게를 입력하면 BMI와 체중 기준을 바로 계산합니다.",
    "h1": "BMI 계산기",
    "intro": "문단 1~2개",
    "howTo": ["단계 1", "단계 2", "단계 3"],
    "faq": [{ "q": "질문", "a": "답" }],
    "labels": { "...도구별 입력/결과 라벨..." }
  }
  ```
  - `title`은 60자 이하, `description`은 160자 이하
  - `faq`는 정확히 3개
  - `labels`는 `assets/tools/<slug>.js`가 쓰는 키를 모두 포함 (입력 칸 이름, 결과 라벨, 오류 메시지)
  - 영어 퇴직금 페이지(`content/en/severance.json`)의 `intro`에 "This calculator follows Korean severance pay rules." 취지의 문장을 반드시 넣는다.
- `content/ui/<lang>.json` 스키마: `{ "siteName", "home", "languageSwitch", "footer", "toolsHeading", "categoryCalc", "categoryText" }`

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/content.test.js`는 다음을 검사한다.
- 8개 slug 각각에 `ko`, `en` 파일이 있다.
- 각 파일의 필수 키가 모두 있다 (`slug`, `title`, `description`, `h1`, `intro`, `howTo`, `faq`, `labels`).
- `title` 길이 60 이하, `description` 길이 160 이하.
- `faq` 길이가 3.
- `ko`와 `en` 파일의 `labels` 키 집합이 같다.
- 같은 언어 안에서 `title`이 중복되지 않는다.
- `content/en/severance.json`의 `intro`에 "Korean" 문자열이 있다.

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/content.test.js`
Expected: FAIL, 파일 없음

- [ ] **Step 3: 콘텐츠 작성**

16개 파일을 작성한다. 각 도구의 `intro`와 `faq`는 페이지마다 다른 내용으로 쓴다. 문장을 복사해 여러 도구에 붙이지 않는다.

- [ ] **Step 4: 통과 확인**

Run: `node --test tests/content.test.js`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add content tests/content.test.js
git commit -m "feat: add bilingual content for all tools

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 6: 페이지 렌더링과 빌드 스크립트

**Files:**
- Create: `scripts/lib/render.js`
- Create: `scripts/build.js`
- Test: `tests/build.test.js`

**Interfaces:**
- Consumes: Task 5의 콘텐츠 파일 스키마, `content/ui/<lang>.json`
- Produces:
  - `renderToolPage({ lang: 'ko'|'en', tool: object, ui: object, alternates: { ko: string, en: string } }) -> string` (완성된 HTML 문자열)
    - 헤더에 언어 선택기 링크를 둔다. 링크 주소는 같은 도구의 다른 언어 주소다.
    - `<html lang="{lang}">`, `<title>`, `<meta name="description">`, `<link rel="alternate" hreflang="ko|en" href="...">` 두 개와 `hreflang="x-default"`는 `ko` 주소로 준다.
    - 도구 스크립트는 `<script src="/assets/tools/{slug}.js" defer>`로 연결한다.
    - FAQ는 `<details>`로 렌더링한다.
  - `renderHome({ lang, ui, tools, alternates }) -> string`
  - `renderRootIndex({ ui }) -> string`
    - 한국어와 영어 홈으로 가는 링크를 둔다. 브라우저 언어가 `ko`로 시작하면 `/ko/`로 이동하는 짧은 스크립트를 넣는다. 링크는 스크립트와 상관없이 항상 보인다.
  - `buildSite({ rootDir: string, outDir: string }) -> { pages: number }` (`scripts/build.js`에서 export)
    - 출력: `site/index.html`, `site/{ko,en}/index.html`, `site/{ko,en}/<slug>/index.html`, `site/sitemap.xml`, `site/robots.txt`, `site/assets/` 복사
    - `sitemap.xml`의 각 `<url>`에 `xhtml:link` 두 개(ko, en)를 넣는다.
    - `robots.txt`는 `User-agent: *`와 `Sitemap: /sitemap.xml`을 포함한다. 주소 기준은 `SITE_ORIGIN` 상수로 두고 초기값은 `https://example.com`으로 한다 (배포 전 교체 필요).
  - `scripts/build.js`는 `require.main === module`일 때 `buildSite`를 실행한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/build.test.js`는 `os.tmpdir()` 아래 임시 폴더에 `buildSite`를 실행하고 다음을 확인한다.
- `ko/bmi/index.html`과 `en/bmi/index.html`이 있다.
- 두 파일 모두 `<html lang>`이 각각 `ko`, `en`이다.
- `ko/bmi/index.html`에 `hreflang="en"`이 들어 있다.
- `sitemap.xml`에 `hreflang`이 아닌 `xhtml:link`가 있다 (`rel="alternate"`).
- `robots.txt`에 `Sitemap:` 줄이 있다.
- 페이지 수는 `index.html` 1 + 언어 홈 2 + 도구 페이지 16 = 19.

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/build.test.js`
Expected: FAIL

- [ ] **Step 3: 렌더 함수와 빌드 구현**

HTML 이스케이프 함수를 하나 두고, 콘텐츠 값을 넣을 때 모두 거친다. 콘텐츠 값이 HTML이 아니라 문자열이라고 가정한다.

- [ ] **Step 4: 통과 확인**

Run: `node --test tests/build.test.js && npm run build`
Expected: PASS, 그리고 `site/` 생성

- [ ] **Step 5: 커밋**

```bash
git add scripts tests/build.test.js site
git commit -m "feat: add static page renderer and build script

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 7: 스타일과 도구 화면 연결

**Files:**
- Create: `assets/style.css`
- Create: `assets/common.js`
- Create: `assets/tools/loan-calculator.js`, `date-diff.js`, `bmi.js`, `severance.js`, `char-count.js`, `case-convert.js`, `line-cleanup.js`, `dedupe-lines.js`

**Interfaces:**
- Consumes: Task 2~4의 로직 함수 (`src/logic/*`), Task 6이 만든 페이지의 입력/결과 요소 id
- Produces: 각 도구 스크립트는 `DOMContentLoaded` 후 `form`의 `input` 이벤트에 반응해 결과를 갱신한다. 브라우저 전용 코드이므로 `src/logic`을 직접 `require`할 수 없다. 대신 Task 6 빌드가 `src/logic/*.js`를 `site/assets/logic/`으로 복사하고, 도구 스크립트는 `<script type="module">`로 `import`한다.

**규칙**
- 계산 결과 숫자는 `Intl.NumberFormat(document.documentElement.lang)`으로 표시한다.
- 오류 메시지는 `labels`에 있는 문구를 HTML에 미리 넣고 `hidden` 속성으로 토글한다.
- 입력 칸이 비어 있으면 결과 영역을 비운다. 오류 메시지를 띄우지 않는다.
- `src/logic` 복사와 `type="module"` 연결 때문에 Task 6의 `buildSite`에 `assets/logic` 복사를 추가해야 한다. 이 변경은 이 태스크에 포함한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/build.test.js`에 추가:
- `site/assets/logic/finance.js`가 있다.
- `site/ko/bmi/index.html`에 `type="module"` 스크립트가 있다.
- `site/assets/style.css`에 `@media (max-width` 규칙이 있다.
- `site/en/loan-calculator/index.html`에 `lang="en"`이 있고, 같은 파일이 `assets/tools/loan-calculator.js`를 참조한다. 이 JavaScript가 `Intl.NumberFormat`에 `document.documentElement.lang`을 넘기는지는 `grep`으로 확인한다 (`Run: grep -n "NumberFormat" site/assets/tools/loan-calculator.js`, Expected: 한 줄 이상 출력).

- [ ] **Step 2: 실패 확인**

Run: `node --test tests/build.test.js`
Expected: FAIL

- [ ] **Step 3: 스타일, 공통 스크립트, 도구 스크립트 작성**

`style.css`: 모바일 우선. 좌우 여백 16px. 가로 스크롤이 생기지 않도록 한다. 색은 CSS 변수로 두고 `prefers-color-scheme: dark`를 지원한다.

`common.js`: 헤더의 현재 언어 링크에 `aria-current="true"`를 붙이는 정도로 최소한만 둔다.

- [ ] **Step 4: 통과 확인과 수동 확인**

Run: `node --test tests/ && npm run build`
Expected: 전체 PASS, 빌드 성공.
수동 확인: `site/`를 로컬 정적 서버로 열어 각 도구의 입력과 결과, 언어 전환 링크, 모바일 폭(375px)에서 가로 스크롤이 없는지 확인한다.

- [ ] **Step 5: 커밋**

```bash
git add assets scripts site
git commit -m "feat: add styles and tool screen bindings

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

### Task 8: 검색 등록 준비와 배포 안내

**Files:**
- Modify: `scripts/build.js` (`SITE_ORIGIN` 상수 교체 지점 주석 확인)
- Create: `README.md` (빌드와 배포 방법만)

**Interfaces:**
- Consumes: Task 6의 `SITE_ORIGIN`
- Produces: 배포 가능한 `site/` 폴더

- [ ] **Step 1: 실제 도메인 확인**

배포 도메인이 정해지지 않았으므로 `SITE_ORIGIN`은 `https://example.com`으로 둔다. 배포 전에 실제 도메인으로 교체해야 한다고 `README.md`에 적는다. 이 값을 사용자에게 물어보는 것이 다음 단계다.

- [ ] **Step 2: `README.md` 작성**

내용: 빌드 명령(`npm run build`), 테스트 명령(`npm test`), 언어별 텍스트 수정 위치(`content/`), 배포 방법(GitHub Pages 또는 Cloudflare Pages에서 `site/` 폴더 배포), `SITE_ORIGIN` 교체 안내.

- [ ] **Step 3: 최종 검증**

Run: `npm test && npm run build`
Expected: 전체 PASS, 빌드 성공. 페이지 수 19.

- [ ] **Step 4: 커밋**

```bash
git add README.md scripts/build.js
git commit -m "docs: add build and deploy notes

Co-Authored-By: Claude Haiku 5.5 <noreply@anthropic.com>"
```

---

## Self-Review 결과

- **스펙 커버리지**: 2절의 도구 8개는 Task 2~4와 Task 5에서 다룬다. 3절 언어 지원은 Task 5(라벨), Task 6(hreflang, 선택기, 루트 안내)에서 다룬다. 4.1절 빌드 스크립트는 Task 6이다. 5절 도구 동작은 Task 2~4와 Task 7이다. 6절 검색 콘텐츠는 Task 5다. 7절 테스트는 Task 2~6에 흩어져 있다. 8절 배포는 Task 8이다. 빠진 항목은 없다.
- **타입 일관성**: 함수 이름과 반환 형식은 Interfaces 블록에서 한 번만 정의하고 이후 태스크는 그 이름을 쓴다.
- **Review Focus**: 다섯 항목 각각에 대응하는 테스트를 Task 2(0% 금리), Task 3(날짜 역순, 잘못된 입력), Task 4(빈 입력), Task 7(입력 오류 표시)에 넣어야 한다. 5번 `Intl` 영어 표기는 Task 7 Step 1에 확인 항목을 추가해 반영했다.

## 실행 방식 선택

계획이 저장되었습니다: [docs/superpowers/plans/2026-10-19-free-tools-site.md](docs/superpowers/plans/2026-10-19-free-tools-site.md)

검토 후 실행 방식을 골라 주세요.

- **Subagent-driven**: 태스크마다 새 서브에이전트가 구현하고, 다음 태스크 전에 별도 리뷰어가 확인합니다. 검토가 가장 철저하지만 태스크와 리뷰마다 새 컨텍스트를 쓰므로 비용이 큽니다.
- **Native**: 이 세션에서 제가 직접 모든 태스크를 구현하고, 마지막에 전체 브랜치를 한 번 리뷰합니다. 빠르고 비용이 적지만 마지막 전까지 독립 검토가 없습니다.

**추천은 Native**입니다. 태스크가 8개이고 같은 저장소에서 순서대로 쌓이는 작업이라, 계획이 이미 인터페이스를 고정해 두었기 때문에 직접 구현해도 충분합니다. 다만 배포 전 실제 사용자에게 보여줄 사이트이므로 최종 리뷰는 꼭 받는 것을 권합니다.

계획을 검토하시고 승인하면서 실행 방식도 알려 주세요. 또한 배포할 도메인이 정해졌는지도 알려 주시면 Task 8에 반영하겠습니다.

