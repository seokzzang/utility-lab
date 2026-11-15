# Utility Lab — 작은 도구 실험실

일상의 작은 불편을 해결하는 브라우저 도구를 하나의 저장소에 모읍니다.

## 앱

- `apps/photo-fit/` — 딱맞춤: 사진 자르기, 픽셀 지정, 목표 용량 이하 JPG 변환.
- 루트 `index.html` — 앱 목록. 새 앱은 `apps/<slug>/` 아래 추가하고 목록에 연결합니다.

## 로컬 실행 / 검증

Node.js 20+, Python 3가 필요합니다.

```sh
npm ci
npx playwright install chromium
npm run check
npm start
npm test
```

http://127.0.0.1:4173/apps/photo-fit/ 에서 실행합니다. 테스트도 실행 중인 이 서버를 사용합니다. 다른 주소는 `APP_URL`에 앱의 URL(끝 `/` 포함)을 지정합니다.

## GitHub Pages

권장 저장소: `seokzzang/utility-lab` (공개).
Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
별도 빌드나 서버, API 키 없이 정적 파일로 배포됩니다.
예상 주소는 `https://seokzzang.github.io/utility-lab/`이며 실제 배포 확인 전에는 운영 URL로 간주하지 않습니다.

## 개인정보와 제한

사진은 Canvas API로 기기 안에서 처리합니다. 업로드, 외부 폰트, 분석 스크립트가 없습니다. GitHub Pages는 페이지 요청에 대한 일반 호스팅 로그를 수집할 수 있지만 사진을 전송하지 않습니다.
지원 입력: JPG, PNG, WebP. 최대 30MB, 4천만 화소. 출력: JPG, 가로/세로 32~4096px, 목표 용량 5~10000KB. 크기를 유지한 채 용량을 맞출 수 없으면 다운로드를 제공하지 않고 조건 변경을 안내합니다. PNG 투명 영역은 흰색으로 저장됩니다.
여권 프리셋은 참고용 413×531px/500KB입니다. 얼굴 크기, 배경, 촬영 시점 등 여권 적합성을 판정하거나 승인 보장하지 않습니다. [공식 규정](https://www.passport.go.kr/home/kor/contents.do?menuPos=12)을 확인하세요.
HEIC/애니메이션 편집, 얼굴 보정/인식, 배경 제거, 일괄 처리, 결제는 포함하지 않습니다. EXIF 방향은 브라우저 이미지 디코더에 의존하므로 실제 iPhone/Safari 사진은 별도 실기기 확인이 필요합니다.
