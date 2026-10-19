# 무료 도구 사이트

계산기 4종과 텍스트 도구 4종을 한국어와 영어로 제공하는 정적 사이트입니다. 서버와 데이터베이스가 없고, 모든 계산은 브라우저에서 이뤄집니다.

설계 문서는 [docs/superpowers/specs/2026-10-19-free-tools-site-design.md](docs/superpowers/specs/2026-10-19-free-tools-site-design.md), 구현 계획은 [docs/superpowers/plans/2026-10-19-free-tools-site.md](docs/superpowers/plans/2026-10-19-free-tools-site.md)에 있습니다.

## 요구 사항

- Node.js 18 이상 (외부 npm 패키지는 쓰지 않습니다)

## 명령어

```bash
npm test
```

계산 로직과 빌드 결과, 콘텐츠 파일을 검사합니다.

```bash
npm run build
```

`site/` 폴더를 새로 만듭니다. 페이지 19개(루트 1, 언어 홈 2, 도구 16), `sitemap.xml`, `robots.txt`가 생성됩니다.

## 폴더 구조

- `content/ui/`: 헤더, 푸터, 홈 화면 문구 (언어별)
- `content/ko/`, `content/en/`: 도구별 제목, 설명, 본문, FAQ, 입력 칸과 결과 라벨 (언어별)
- `src/logic/`: 계산 함수. Node 테스트와 브라우저에서 같은 파일을 씁니다.
- `scripts/build.js`: `content/`와 템플릿으로 `site/`를 만듭니다.
- `scripts/lib/forms.js`: 도구별 입력 칸과 결과 칸 정의
- `scripts/lib/render.js`: 페이지 HTML 생성
- `assets/`: 공통 스타일, 공통 스크립트, 도구별 화면 스크립트

텍스트를 고치려면 `content/` 아래 JSON 파일을 수정한 뒤 `npm run build`를 실행하세요. 계산 방식을 바꾸려면 `src/logic/`을 고칩니다.

## 배포 전 확인

1. `scripts/build.js`의 `SITE_ORIGIN`을 실제 주소로 바꿉니다. 현재 값은 `https://luneeest-lang.github.io`이며, 사이트맵과 `hreflang`에 들어갑니다. 커스텀 도메인을 쓰면 여기를 바꾸세요.
2. `npm test`와 `npm run build`를 실행합니다.
3. GitHub 저장소의 Settings > Pages에서 Source를 "GitHub Actions"로 설정합니다. `master` 또는 `feature/free-tools-site`에 푸시하면 `.github/workflows/pages.yml`이 테스트, 빌드, 배포를 자동으로 실행합니다.

## 참고

- 퇴직금 계산기는 한국 근로기준법의 개략 계산입니다. 영어 페이지에도 이 점을 밝혀 두었습니다.
- 대출 계산기는 중도상환 수수료를 반영하지 않습니다.
