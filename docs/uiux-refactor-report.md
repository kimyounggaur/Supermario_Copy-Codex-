# Sky Sprout UI·UX 리팩토링 결과

2026-10-17 KST. 실행 명세는 루트의 `Sky-Sprout_UIUX_리팩토링_바이브코딩_프롬프트.ko.md`다. 실제 코드·아트·브라우저를 대조해 구현했으며, 커밋·푸시·배포·외부 서비스 연결은 수행하지 않았다.

## 구현 결과

- 새싹과 풀섬을 활용한 한국어 홈에서 모험·제작·내 레벨을 구분하고, 조작 안내·크레딧·실제로 동작하는 설정을 제공한다.
- 크림색 DOM HUD, SVG 터치 버튼, 일시정지·실패·클리어 화면을 구현했다. 점수·씨앗·시간은 실제 게임 payload를 표시한다.
- 게임 인스턴스마다 브리지와 초기 snapshot, 구독 해제를 연결했다. HUD가 바뀌어도 Phaser 인스턴스를 다시 생성하지 않는다.
- 실제 레벨과 `testPlay` 실행 문맥을 재시작까지 유지하고, 모든 ‘홈으로’ 버튼을 React 홈에 연결했다.
- 테스트 플레이는 복사본으로 실행하고 에디터를 유지한다. 테스트 중 배경의 에디터는 `inert` 상태로 입력을 중지하며, 복귀하면 도구·선택·카메라·편집 기록이 이어진다.
- 키보드·다중 터치·`pointercancel`/`blur`·IME·모달의 입력 처리 범위를 분리했다.
- 모바일 HUD는 CSS px 크기를 유지한다. 세로 월드 카메라에는 진행 방향 시야와 아래쪽 여유 공간을 확보하되, 월드·물리·낙사선은 유지했다.
- 중간 폭·세로·가로 화면에 대응하는 에디터와 팔레트 검색·아트 썸네일·가로 스크롤 카테고리·속성/레이어/검증 탭을 구현했다.
- 저장 실패 전달·기존 값 복원·미저장 상태 표시, 2초 대기 후/최대 10초 간격의 임시 보관, 복구 선택, 가져오기 오류 처리, 손상된 목록 원본 보존을 구현했다.
- 공통 모달의 포커스 제한·복귀, Esc 닫기와 배경 `inert` 처리, 패널 스크롤, OS/앱 모션 감소·효과음 설정을 연결했다.

## 파일 지도

| 영역 | 주요 파일 |
| --- | --- |
| 앱·게임 UI | `src/App.tsx`, `src/components/GameCanvas.tsx` |
| 홈·설정·공통 UI | `src/ui/screens/*`, `src/ui/components/*` |
| 상태·터치·설정 | `src/ui/state/*` |
| 디자인 | `src/ui/styles/*`, `src/styles/editor.css` |
| 아트 | `src/game/render/*`, `src/game/scenes/PreloadScene.ts`, `public/art/sky-sprout-v1/*` |
| 실제 상태·입력·카메라 | `src/game/scenes/LevelScene.ts`, `HudScene.ts`, `src/game/systems/{InputSystem,CameraSystem,ParticleSystem,AudioManager,SaveSystem}.ts` |
| 엔티티·지형 표시 | `src/game/entities/*`의 제공 아트 적용 대상, `src/game/systems/LevelLoader.ts` |
| 에디터·저장 | `src/editor/EditorRoot.tsx`, `components/*`, `scenes/EditorScene.ts`, persistence/serialization/commands/guard |
| 검증 | `tests/unit/*`, `tests/e2e/*`, `playwright.config.ts`, `eslint.config.js` |
| 문서·메타 | `README.md`, `docs/uiux-refactor-audit.md`, `index.html` |

## 에셋 적용

PNG 19개와 SVG 16개, 총 35개를 원본과 동일한 바이트로 복사했다. Phaser는 개별 캐릭터 이미지 6개와 strip을 중복 로드하지 않고 strip을 사용한다. 홈·결과 화면은 개별 포즈를 사용한다. `sources`·`evidence`·ZIP·프리뷰 앱은 `public`에 넣지 않았다.

| 적용 | 방식 |
| --- | --- |
| Sprout | 발 위치 y=244/256을 기준으로 한 표시 전용 뷰. 달리기 2개 키포즈와 jump/fall/land, 피격 tint/alpha 적용 |
| 씨앗·바람 구슬·성장 아이템·벌레·등불·가시 | 기존 물리 객체와 별도 이미지로 표시. 실제 활성·수집·피격·체크포인트 상태와 연결 |
| 풀섬·구름·블록·룬 | 충돌과 그림을 분리하고 비율 유지. 이동 구름은 실제 settled 바디에 정렬 |
| 하늘·중경 섬 | 유한한 cover/crop과 낮은 대비의 중경. 검증되지 않은 seamless 반복은 사용하지 않음 |
| HUD·조작·효과 | 제공 SVG와 동적 DOM 값, 실제 수집·착지·피격 이벤트 연결 |
| 미제공 범위 | wall/crouch·PuffHopper·WindWisp·Wind Gate·stone·사용 완료 룬은 기존 생성 fallback 유지 |

## 보존 확인

- Player의 32×44 물리 프레임을 유지했다. 실제 바디 측정값은 기본 22×34, offset(5,8), 웅크림 24×20, offset(4,22), 성장 22×68, 성장 후 웅크림 24×40이다. 동일 지형에서 발바닥 y=612가 모든 상태에서 유지됐다.
- 기존에 스케일된 이동 발판 바디 약 301.04×32.67과 가시 바디는 수정하지 않고 표시를 맞췄다. 기존 물리를 보존한 것이며, 스케일된 바디 자체를 재설계하지 않았다.
- 이동·점프·코요테 타임·점프 버퍼·벽 동작·성장·피격·점수 규칙과 레벨 좌표를 유지했다.
- 기존 저장 키·`schemaVersion`·object type/id·import/export·undo/redo를 유지했다. UI 설정 키만 별도로 추가했다.
- 실제 완료 이벤트가 한 번의 실행에서 1회 발생하는지, custom/testPlay 재시작의 실제 ID가 유지되는지 E2E로 확인했다.
- 시간은 활성 플레이에서만 누적하며, 일시정지 중에는 증가하지 않는다.

바디 측정 방법은 `output/playwright/uiux-physics-qa.json`에 있다. 웅크림은 실제 키 입력으로 확인했고, 성장 상태는 격리된 `Player.grow()` 호출로 측정했다. 이를 아이템 획득 경로를 완주한 증거로 해석하지 않는다.

## 검증 결과

| 검사 | 결과 |
| --- | --- |
| `npm run lint` | 통과. 보관된 독립 아트 프리뷰는 lint 대상에서 제외하고 원본은 유지 |
| `npm run test` | 통과. 16개 파일, 65개 테스트 |
| TypeScript / Vite production build | 통과 |
| `npm run test:e2e` | 통과. Chromium E2E 20개 |
| 브라우저 검수 | 데스크톱·세로·가로의 새 브라우저 context에서 콘솔 오류·pageerror·자산 실패 없음 |
| 터치 실측 | 세로 최소 50×54, 가로 최소 48×48 CSS px, 간격 8px |

E2E에는 기존 4개 흐름, 홈/게임 진입·복귀 5회 반복, 실제 골인·낙사 실패, 같은 커스텀 레벨로 재시작, 완료 기록 1회 저장, 일시정지 중 시간 정지가 포함된다. 설정 손상·저장·포커스, PNG MIME·누락 아트 fallback, 입력창·IME, quota 실패 후 내보내기, 임시 보관→새로고침→복구, 모바일 다중 터치 취소와 최소 편집 순환도 검사했다.

홈·플레이·에디터는 1440×900·1280×720·1024×768·768×1024·390×844·360×740·844×390·740×360에서 검사했다. 모든 크기에서 HUD·터치·저장·테스트·검증 버튼과 가로 넘침을 확인했다. 가장 작은 에디터 캔버스는 740×360 화면에서 480×171px였다. 1440×900·390×844·844×390의 대표 화면과 다른 크기의 플레이·에디터 화면을 캡처했고, 세로·가로 모바일에서 실제 편집→저장→테스트→복귀를 자동화했다. 구체적인 검사 범위는 QA JSON에 기록했다.

200%에 해당하는 재배치는 720×450 CSS px·DPR 2 환경에서 모달 접근과 포커스 복귀를 확인했다. 이는 실제 데스크톱 브라우저의 200% 줌 조작과 구별하며, `uiux-zoom-qa.json`에 방법을 기록했다.

브라우저는 Playwright Chromium과 앱 내 브라우저를 사용했다. 실물 iOS/Safari·노치 기기·저성능 폰으로 검증한 결과는 아니다.

## 시각 증거

`output/playwright/`에 다음 자료를 보관했다.

- `before-home-desktop.png`, `before-play-desktop.png`, `before-pause-desktop.png`, `before-editor-desktop.png`
- `before-home-mobile.png`, `before-play-mobile.png`
- `after-{home,play,pause,editor,properties}-{desktop,mobile-portrait,mobile-landscape}.png`
- `after-first-gap-mobile-portrait.png`: 실제 이동·씨앗 수집 후 다음 구름 발판을 볼 수 있는 세로 시야.
- `after-complete-desktop.png`, `after-gameover-desktop.png`: 실제 작은 커스텀 레벨의 충돌로 도달한 상태.
- `uiux-browser-qa.json`, `uiux-physics-qa.json`, `uiux-zoom-qa.json`
- `after-zoom-200-emulation-{home,modal}.png`: 200%에 해당하는 재배치 에뮬레이션.

## 남은 제한과 품질 판단

1. 달리기는 2개 키포즈로 구성된 연구 자료다. 완성된 6~12프레임 사이클은 아니다.
2. 새 아트가 없는 특수 포즈·적·일부 지형은 기존 생성 fallback을 사용하므로 시각적 차이가 남는다.
3. 정적 지형의 투명 여백 때문에 그림 끝이 충돌 경계보다 몇 % 안쪽에 있을 수 있다. 풀섬 아래의 큰 장식 부분도 충돌체가 아니다.
4. 기존 스키마의 oneWay/falling/gustVent는 기존 런타임 변환의 단순화를 유지한다.
5. 스크린리더·200% 확대·실물 기기의 safe-area/성능에 대한 광범위한 검증은 별도 환경에서 추가 확인이 필요하다.
6. 이번 자동화는 전체 이야기 레벨을 완주한 증거가 아니다. 실제 골인·실패는 작은 커스텀 fixture로 검사했고, 이야기 레벨에서는 대표 이동·수집·첫 틈의 시야를 확인했다.
7. localStorage는 원자적 DB가 아니므로 브라우저가 복원 쓰기까지 거부하면 완전한 롤백을 보장할 수 없다. 실패는 UI에 전달되며, JSON으로 작업을 보관할 수 있다.

명세의 시각 자체 평가: 실루엣 2, 경로 가시성 2, 행동 위계 2, 스타일 일관성 1, 반응형 시야 2, 실제 피드백 2로 총 11/12점이다. 0점 항목은 없다. 제공 아트의 한계와 실기기 미검증 범위를 명시하고, 로컬 구현·회귀 검증 범위에서는 완료로 판단한다.
