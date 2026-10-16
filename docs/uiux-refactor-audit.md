# Sky Sprout UI·UX 리팩토링 감사 기록

## Phase 0 — 시작 기준선 (2026-10-17 KST)

기존 구현을 빌드한 직후, 새 UI 구현이 들어오기 전 `dist`를 대상으로 검증했다. 병렬 작업이 시작된 시점이므로 아래 결과는 이번 리팩토링의 최종 결과와 구별한다.

| 검사                       | 기준선 결과                                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run lint`             | 실패. `Sky-Sprout` 아래 두 원본 `preview.js`가 production ESLint 대상에 포함되어 68개 오류. browser 전역 미정의와 기존 미사용 변수이며 런타임 소스 오류는 보고되지 않음. |
| `npm run test`             | 통과. 12개 파일, 44개 테스트.                                                                                                                                            |
| `npm run build`            | 통과. TypeScript와 Vite production build.                                                                                                                                |
| `npm exec playwright test` | 통과. 기존 Chromium 4개 E2E. 위에서 만든 같은 기준선 build 사용.                                                                                                         |

검증한 기존 E2E 의미: story 진입·실제 health HUD·pause/resume, editor 핵심 패널·검증, 객체 배치·저장·목록 재열기, 테스트 플레이·에디터 복귀.

### 시작 시각 증거

- `output/playwright/before-home-desktop.png` — 1440×900, 홈
- `output/playwright/before-play-desktop.png` — 1440×900, 실제 플레이
- `output/playwright/before-pause-desktop.png` — 1440×900, pause
- `output/playwright/before-editor-desktop.png` — 1440×900, 에디터
- `output/playwright/before-home-mobile.png` — 390×844, 홈
- `output/playwright/before-play-mobile.png` — 390×844, 실제 플레이

이미지는 Playwright Chromium의 viewport 검증이다. 실물 iOS Safari 검사로 취급하지 않는다.

### 회귀 보강 계획

1. 번역 후 기존 E2E의 의미는 유지하고 안정적인 testid·한국어 accessible name으로 selector를 갱신한다.
2. DOM pause/resume/home, 다섯 번 진입·복귀, 실행 레벨 보존, 테스트 후 에디터 작업 보존을 검사한다.
3. input/IME 단축키 충돌, quota 저장 실패, 손상 설정, focus 복귀와 모달 trap을 검사한다.
4. 모바일 세로/가로에서 CSS px 터치 목표·다중 포인터·취소·blur와 최소 편집 흐름을 검사한다.
5. test static server의 PNG/WebP MIME 및 누락 자산 응답을 수정하고 새 아트 로딩을 검사한다.

## 구현 단계 기록

이하에는 각 구현 담당자가 실제 적용 범위·검증·제한을 이어서 기록한다.

## Phase 1~10 — 적용 결과

- 기준 아트: `Sky-Sprout-Art-Pack-v1`의 런타임 에셋 35개만 `public`에 복사했다. 원본 팩·생성 원본·비교 자료·기존 프롬프트는 보존했다.
- 공통 토큰·버튼·portal 모달·한국어 홈·설정·레벨 목록을 구현했다.
- 게임 인스턴스마다 `GameUiBridge`를 두고 실제 HUD payload, 명령, 초기 snapshot과 구독 해제를 연결했다.
- 기존 물리 Player 위에 SproutView를 적용하고 엔티티·지형·배경의 표시 계층을 추가했다. 아트가 제공되지 않은 상태는 기존 생성 fallback을 유지한다.
- DOM HUD·터치·결과 화면에서 실행 레벨의 문맥을 유지하고 React 홈으로 복귀하도록 연결했다. 테스트 플레이는 snapshot을 사용하고 에디터의 입력을 중지한다.
- 데스크톱 16:9 구도와 세로 카메라를 분리했다. 세로 화면의 아래쪽 여유 bounds는 카메라에만 적용하며, physics bounds/fallY는 유지한다.
- 구름 발판의 기존 스케일 바디가 그림보다 큰 점을 측정해 그림을 바디에 맞췄다. 기존 물리 바디는 재조정하지 않았다.
- 반응형 에디터, 속성·레이어 탭, 압축 팔레트·검색·검증, 실제 저장 실패 처리와 임시 작업 복구를 구현했다.
- StrictMode에서 state updater 안의 command가 중복 실행될 수 있던 구조를 수정했다. 하나만 존재하는 시작점·도착점 객체를 교체·복제한 뒤 undo할 때 원본이 사라지던 문제도 수정했다.
- 입력창·IME·모달의 단축키 guard, 다중 터치 해제, 잘못된 import 처리·손상된 index 원본 보존, 저장 롤백을 추가했다.
- 효과음 설정, CSS/Phaser 모션 감소, 포커스·스크롤 처리를 연결했다. README의 실제 아트 사용·정적 E2E 서버 설명을 갱신했다.

### 검증 요약

최종 lint와 Vitest가 통과했다. 단위 테스트는 16개 파일, 65개 테스트다. Production build와 Chromium E2E 20개도 통과했다. 전체 검수의 증거와 제한은 `docs/uiux-refactor-report.md`와 `output/playwright/`에 정리했다.

실제 충돌을 통해 작은 커스텀 레벨의 골인·낙사 실패를 확인했다. 전체 이야기 레벨을 처음부터 끝까지 완주한 결과는 아니다. 바디 측정의 성장 상태는 `Player.grow()`를 직접 호출한 격리 검사이며, 아이템 획득 경로를 완주한 증거와 구별한다.
