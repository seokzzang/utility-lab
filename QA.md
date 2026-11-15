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

## 미검증 / 배포 차단
- 실기기 iOS Safari/Android, 실제 EXIF 방향·대용량 모바일 메모리 처리 미검증.
- 목표 KB는 브라우저 JPEG 인코더에 따라 품질 차이가 날 수 있음.
- 여권 적합성/제출 승인 판정 기능이 아님.
- GitHub 연결 계정 seokzzang 확인, 현재 연결 도구에는 새 저장소 생성/Pages 설정 기능이 없음. 로컬 GitHub 자격증명도 없음.
- 사용자 지시로 기존 seokzzang/web는 변경하지 않음.
- 새 seokzzang/utility-lab 저장소 준비 후 connector로 커밋 가능. 아직 push/Pages 공개 URL 검증은 안 됨.

## 다음 액션
대니가 utility-lab 공개 저장소를 README 포함 생성하면 최신 main을 읽고 이 결과를 게시한다. Settings → Pages에서 main/(root) 사용. 공개 URL 로드/변환을 확인하고 최종 완료 처리.
