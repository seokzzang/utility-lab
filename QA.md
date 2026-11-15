# QA / 자체 리뷰 — 2026-11-15

## 변경 범위
- index.html: 앱 카탈로그.
- apps/photo-fit/{index.html,style.css,app.js}: 사진 편집 도구.
- package.json / lock, playwright.config.js, tests/photo.spec.js: 검증 도구.
- README, AGENTS, done-criteria, loop-state: 실행/유지보수/인계.

## 실제 검증
- `npm run check`: PASS.
- `APP_URL=http://127.0.0.1:4174/apps/photo-fit/ npm test`: 3/3 PASS, Chromium.
- 413×531 JPG 출력, MIME, 500KB 제한, 50KB 압축 제한, 다운로드 파일명 확인.
- 고정 픽셀/5KB로 맞출 수 없는 경우 다운로드 없이 오류 처리.
- 잘못된 형식/손상된 사진/잘못된 픽셀, 프리셋 변경, 결과 무효화, 초기화/재선택 복구.
- 사진 처리 중 외부 네트워크 요청 없음. pageerror 없음.
- 390px/1280px 레이아웃 가로 넘침 없음, 스크린샷 직접 관찰.
- 카탈로그 → 앱 내비게이션 PASS.
- npm audit --omit=dev: 취약점 0.

## 자체 코드 리뷰
approve (로컬 MVP). 독립 리뷰가 아닌 철수 자체 리뷰.
입력 제한, decode 경합 ticket, 변환 중 컨트롤 잠금, Blob URL 정리, 조건 변경 시 이전 결과 제거 확인.
비밀정보, 외부 폰트/스크립트/업로드 없음. 파일명은 textContent로만 표시.

## 공개 배포 검증 — 2026-11-15
- seokzzang/utility-lab main에 코드 게시, 대니가 Pages main/root 설정.
- 카탈로그 및 앱 공개 주소 HTTP 200 확인.
- `APP_URL=https://seokzzang.github.io/utility-lab/apps/photo-fit/ npm test`: 3/3 PASS (19.5s).
- 공개 카탈로그에서 앱 링크 이동 PASS.
- 공개 환경에서 JPG 다운로드/픽셀/목표 용량/불가능한 용량 오류/손상 파일/재시도/390px와 1280px 레이아웃 검증.

## 잔여 위험
- 실기기 iOS Safari/Android, 실제 EXIF 방향·대용량 모바일 메모리 처리 미검증.
- 목표 KB는 브라우저 JPEG 인코더에 따라 품질 차이가 날 수 있음.
- 여권 적합성/제출 승인 판정 기능이 아님.
- 독립 리뷰가 아닌 자체 리뷰. 사용자 첫 사용 피드백은 아직 없음.

## 종료
completed. 다음 선택 아이템은 apps/<slug>/ 에 추가, 카탈로그 링크와 브라우저 검증을 함께 유지.
