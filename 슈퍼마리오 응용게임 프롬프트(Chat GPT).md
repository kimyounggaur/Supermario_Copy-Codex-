너는 지금부터 최고 수준의 시니어 게임 엔지니어, 프론트엔드 아키텍트, 테크니컬 게임 디자이너, QA 엔지니어, 빌드/배포 엔지니어 역할을 동시에 수행한다.

목표:
웹 브라우저에서 실행되는 오리지널 2D 횡스크롤 플랫폼 게임을 처음부터 끝까지 구현한다. 고전적인 점프 액션 플랫폼 게임의 조작감, 속도감, 레벨 진행감은 참고하되, 닌텐도/슈퍼마리오의 캐릭터, 이름, 음악, 그래픽, 맵 구조, 아이템명, 적 이름, 효과음, 로고, 시각적 상징을 절대 복제하지 않는다. 이 프로젝트는 완전히 독립적인 오리지널 게임이어야 한다.

중요한 법적/창작 제약:
1. “Mario”, “Luigi”, “Peach”, “Bowser”, “Goomba”, “Koopa”, “Mushroom Kingdom”, “Super Mario”, “Nintendo” 등의 이름을 코드, 문서, UI, 에셋, 변수명, 파일명 어디에도 사용하지 마라.
2. 빨간 모자 배관공, 초록 배관공, 물음표 블록, 버섯 파워업, 거북이 적, 굼바형 적, 닌텐도풍 사운드, 기존 스테이지 레이아웃을 만들지 마라.
3. 모든 그래픽은 코드로 생성하는 간단한 오리지널 픽셀/벡터 스타일 placeholder로 시작한다.
4. 모든 사운드는 WebAudio로 직접 생성하는 짧은 오리지널 효과음만 사용한다.
5. 외부 이미지, 외부 음악, 외부 폰트, 외부 게임 에셋을 사용하지 마라.
6. 레벨 디자인도 오리지널로 구성한다.

기술 스택:
- Vite + React + TypeScript
- Phaser 3를 게임 엔진으로 사용
- Vitest로 순수 로직/물리/유틸 테스트
- Playwright로 브라우저 E2E smoke test
- ESLint + Prettier
- localStorage 기반 저장
- 정적 웹앱으로 빌드 가능해야 함
- 서버/DB 없이 동작해야 함

최종 결과물:
1. `npm install` 후 실행 가능한 프로젝트
2. `npm run dev`로 로컬 실행 가능
3. `npm run build` 통과
4. `npm run test` 통과
5. `npm run test:e2e` 통과
6. 브라우저에서 실제 플레이 가능한 1개 완성형 스테이지
7. 시작 메뉴, 게임 화면, HUD, 일시정지, 게임오버, 클리어 화면
8. 키보드 조작과 모바일 터치 조작 지원
9. README.md에 실행법, 조작법, 아키텍처, 확장법, 배포법 문서화
10. 저작권 침해 요소가 없는 오리지널 에셋/명칭/세계관

게임 콘셉트:
제목은 “Sky Sprout Runner”로 한다.
주인공은 작은 새싹 정령 “Sprout”이다.
세계관은 구름섬, 바람동굴, 빛의 씨앗을 중심으로 한 밝고 경쾌한 판타지다.
목표는 첫 번째 스테이지에서 빛의 씨앗 조각을 모으고, 끝 지점의 “Wind Gate”에 도달하는 것이다.

핵심 게임플레이:
- 좌우 이동
- 점프
- 달리기
- 변수 점프 높이
- 점프 버퍼링
- 코요테 타임
- 착지 감각
- 낙사
- 적 밟기
- 피격 시 넉백
- 무적 시간
- 체크포인트
- 수집 아이템
- 파워업
- 움직이는 플랫폼
- 위험 지형
- 스테이지 클리어

조작:
키보드:
- ← / A: 왼쪽 이동
- → / D: 오른쪽 이동
- Space / W / ↑: 점프
- Shift: 달리기
- P / Esc: 일시정지
- R: 현재 체크포인트에서 재시작

모바일:
- 왼쪽 하단: 좌/우 가상 버튼
- 오른쪽 하단: 점프 버튼
- 오른쪽 하단 보조: 달리기 버튼
- 상단: 일시정지 버튼

플레이어 컨트롤 요구사항:
- 가속/감속 기반 이동
- 최대 걷기 속도와 최대 달리기 속도 분리
- 공중 제어 가능
- 지면 마찰과 공중 마찰 분리
- 코요테 타임 100~150ms
- 점프 버퍼 100~150ms
- 점프 버튼을 짧게 누르면 낮은 점프, 길게 누르면 높은 점프
- 낙하 시 중력 증가
- 최고 낙하 속도 제한
- 피격 시 뒤로 밀림
- 피격 후 1초 정도 무적
- 적을 위에서 밟으면 적 제거 + 플레이어 바운스
- 옆에서 적과 부딪히면 체력 감소
- 체력 3칸
- 낙사하면 체크포인트에서 재시작

카메라:
- 플레이어를 부드럽게 따라가는 횡스크롤 카메라
- 약간의 dead zone 적용
- 플레이어가 오른쪽으로 진행할수록 자연스럽게 앞쪽 공간을 더 보여줌
- 레벨 경계 밖으로 카메라가 나가지 않음

월드/레벨:
첫 번째 스테이지 `level-1-wind-island`를 만든다.
구성:
1. 튜토리얼 구간: 이동과 점프 학습
2. 수집 구간: 빛의 씨앗 조각 수집
3. 적 등장 구간: 기본 순찰형 적
4. 플랫폼 구간: 움직이는 플랫폼
5. 위험 구간: 가시/낙사 구간
6. 체크포인트
7. 파워업 구간
8. 마지막 점프 챌린지
9. Wind Gate 도착 시 클리어

레벨은 데이터 기반으로 작성한다.
가능하면 `src/game/data/levels/level1.ts` 또는 JSON 유사 구조로 구성한다.
타일맵 에디터 없이도 수정 가능한 형태여야 한다.
예:
- terrain rectangles
- platforms
- moving platforms
- collectibles
- enemies
- hazards
- checkpoint
- finish gate

그래픽:
외부 에셋을 쓰지 말고 Phaser shape, canvas texture, generated texture를 사용한다.
오리지널 픽셀풍/부드러운 벡터풍 중 하나를 선택하되 일관성 있게 만든다.
필수 시각 요소:
- Sprout 플레이어: 초록 새싹 정령. 기존 유명 캐릭터와 닮지 않게 디자인.
- 지형: 구름섬/풀밭/돌
- 수집 아이템: Light Seed Shard
- 파워업: Breeze Orb
- 적 1: Drift Bug. 좌우 순찰형 작은 벌레
- 적 2: Puff Hopper. 주기적으로 점프하는 구름 생물
- 적 3: Wind Wisp. 공중 부유형
- 위험물: Thorn Crystal
- 체크포인트: Glow Lantern
- 종료 지점: Wind Gate
- 파티클: 점프 먼지, 착지 먼지, 수집 반짝임, 적 제거 효과

사운드:
WebAudio API 또는 Phaser sound를 이용해 코드로 생성 가능한 간단한 효과음을 만든다.
외부 음원 사용 금지.
필수 사운드:
- 점프
- 착지
- 수집
- 피격
- 적 제거
- 파워업
- 체크포인트
- 클리어
- 버튼 선택

게임 상태:
- title
- playing
- paused
- gameOver
- levelComplete

HUD:
- 체력
- 수집한 Light Seed Shard 수
- 남은 시간 또는 플레이 시간
- 점수
- 현재 체크포인트 표시
- 모바일에서는 HUD가 버튼과 겹치지 않게 배치

점수:
- 수집 아이템: +100
- 적 제거: +200
- 파워업 획득: +300
- 스테이지 클리어: 남은 시간 또는 빠른 클리어 보너스
- 최고 점수 localStorage 저장

파일 구조를 다음과 비슷하게 설계하라:

src/
  App.tsx
  main.tsx
  styles/
    global.css
  game/
    GameRoot.ts
    config/
      gameConfig.ts
      physicsConfig.ts
      constants.ts
    scenes/
      BootScene.ts
      PreloadScene.ts
      MenuScene.ts
      LevelScene.ts
      HudScene.ts
      PauseScene.ts
      GameOverScene.ts
      LevelCompleteScene.ts
    entities/
      Player.ts
      BaseEnemy.ts
      DriftBug.ts
      PuffHopper.ts
      WindWisp.ts
      Collectible.ts
      PowerUp.ts
      MovingPlatform.ts
      Hazard.ts
      Checkpoint.ts
      FinishGate.ts
    systems/
      InputSystem.ts
      TouchControls.ts
      AudioManager.ts
      ScoreSystem.ts
      SaveSystem.ts
      CameraSystem.ts
      CollisionSystem.ts
      ParticleSystem.ts
      LevelLoader.ts
    data/
      levels/
        level1.ts
    utils/
      math.ts
      timers.ts
      assertions.ts
  components/
    GameCanvas.tsx
    LandingPanel.tsx
    ControlsHelp.tsx
tests/
  unit/
    playerPhysics.test.ts
    scoreSystem.test.ts
    levelValidation.test.ts
  e2e/
    game-smoke.spec.ts
public/
  favicon.svg
README.md

구현 방식:
- 먼저 현재 레포 상태를 검사하라.
- 빈 레포라면 새 Vite React TypeScript 프로젝트를 생성하라.
- 이미 프로젝트가 있으면 기존 구조를 최대한 보존하면서 통합하라.
- 작업 전 간단한 구현 계획을 작성하라.
- 그 다음 실제 파일을 생성/수정하라.
- 각 단계 후 `npm run build`, `npm run test`를 실행하고 실패하면 직접 수정하라.
- E2E 테스트는 게임 캔버스가 로드되고 메뉴에서 시작 버튼을 누르면 플레이 상태가 되는지 확인한다.
- 브라우저 콘솔 오류가 없도록 처리하라.
- TypeScript strict 기준으로 최대한 타입 안전하게 작성하라.
- any 사용을 피하라.
- 복잡한 부분에는 짧고 유용한 주석을 남겨라.
- 단순히 TODO만 남기고 끝내지 말고, 플레이 가능한 수준까지 구현하라.

구현 단계:

Phase 0. 프로젝트 셋업
1. package.json 스크립트 구성:
   - dev
   - build
   - preview
   - test
   - test:watch
   - test:e2e
   - lint
   - format
2. 필요한 의존성 설치:
   - react
   - react-dom
   - vite
   - typescript
   - phaser
   - vitest
   - @vitejs/plugin-react
   - eslint 관련 패키지
   - prettier
   - @playwright/test
3. tsconfig strict 설정
4. 기본 CSS reset과 full-screen canvas 레이아웃 구성

Phase 1. React + Phaser 통합
1. React App에서 Phaser 게임 인스턴스를 mount/unmount하는 GameCanvas 컴포넌트를 만든다.
2. 중복 mount 방지 로직을 넣는다.
3. window resize 대응을 한다.
4. Phaser scene 전환 구조를 만든다.
5. MenuScene에서 Start 버튼을 누르면 LevelScene으로 이동한다.

Phase 2. 플레이어 컨트롤러
1. Player 클래스를 만든다.
2. 이동, 점프, 달리기, 중력, 마찰, 코요테 타임, 점프 버퍼를 구현한다.
3. 입력은 InputSystem에서 추상화한다.
4. 키보드와 터치 입력이 같은 PlayerInput 형태를 반환하게 한다.
5. 디버깅용으로 player state를 콘솔에 과도하게 찍지 말고, 필요 시 개발 모드에서만 표시한다.

Phase 3. 레벨 로더와 충돌
1. level1 데이터 구조를 정의한다.
2. LevelLoader가 terrain/platform/collectible/enemy/hazard/checkpoint/finish를 생성하게 한다.
3. 지형 충돌을 구현한다.
4. 낙사 경계를 구현한다.
5. 체크포인트 리스폰을 구현한다.
6. 움직이는 플랫폼 위에서 플레이어가 자연스럽게 따라가도록 처리한다.

Phase 4. 게임 오브젝트
1. Light Seed Shard 수집 구현
2. Breeze Orb 파워업 구현
   - 일정 시간 동안 점프력 또는 공중 제어 향상
   - HUD에 활성 상태 표시
3. Drift Bug 구현
   - 좌우 순찰
   - 벽/낭떠러지에서 방향 전환
4. Puff Hopper 구현
   - 일정 주기로 점프
5. Wind Wisp 구현
   - 사인파 형태로 부유
6. Thorn Crystal 위험물 구현
7. 적 밟기 판정과 피격 판정 분리

Phase 5. UI/HUD/상태 관리
1. HUD Scene 또는 Phaser UI로 체력, 점수, 수집량 표시
2. PauseScene 구현
3. GameOverScene 구현
4. LevelCompleteScene 구현
5. localStorage 최고 점수 저장
6. 접근성을 위해 React 영역에 조작법 텍스트 제공
7. 모바일 버튼은 화면 크기에 맞게 표시

Phase 6. 폴리시와 완성도
1. 모든 이름과 그래픽이 오리지널인지 재검토
2. 닌텐도/마리오 유사 명칭 또는 시각 요소 제거
3. README에 “original game, no external copyrighted assets” 명시
4. 게임 조작감 튜닝
5. 카메라 부드러움 튜닝
6. 충돌 버그 수정
7. 플레이어가 처음부터 끝까지 클리어 가능한지 직접 검증

Phase 7. 테스트
1. playerPhysics.test.ts:
   - 코요테 타임 내 점프 가능
   - 점프 버퍼 후 착지 시 점프 발생
   - 최대 속도 제한
   - 피격 시 체력 감소
2. scoreSystem.test.ts:
   - 수집/적 제거/클리어 점수 계산
   - 최고 점수 저장
3. levelValidation.test.ts:
   - level1에 시작점/체크포인트/종료점 존재
   - 모든 엔티티 id 유효
   - 클리어 경로가 논리적으로 존재하도록 최소 검증
4. game-smoke.spec.ts:
   - 앱 로드
   - Start 버튼 클릭
   - canvas 표시
   - HUD 표시
   - 일시정지 버튼 동작

Phase 8. 성능과 품질
1. 데스크톱에서 60fps를 목표로 한다.
2. 모바일에서도 30fps 이상을 목표로 한다.
3. 불필요한 객체 생성을 매 프레임 반복하지 마라.
4. 파티클 수를 제한하라.
5. 충돌 계산은 단순하고 안정적으로 유지하라.
6. 메모리 누수를 방지하기 위해 scene destroy 시 이벤트 리스너를 정리하라.

Phase 9. 문서화
README.md에 다음을 포함한다:
1. 프로젝트 소개
2. 법적/창작 원칙: 오리지널 게임이며 외부 저작권 에셋 미사용
3. 설치 방법
4. 실행 방법
5. 테스트 방법
6. 조작법
7. 파일 구조
8. 게임 시스템 설명
9. 레벨 데이터 수정 방법
10. 배포 방법
11. 향후 개선 아이디어

수용 기준:
다음 조건을 모두 만족해야 완료로 간주한다.
1. `npm run build` 성공
2. `npm run test` 성공
3. `npm run test:e2e` 성공 또는 E2E 실행 환경 문제일 경우 원인과 해결 방법 명확히 문서화
4. 브라우저에서 게임 시작 가능
5. 플레이어 이동/점프/달리기 가능
6. 수집 아이템 획득 가능
7. 적과 상호작용 가능
8. 피격/체력/리스폰 가능
9. 체크포인트 동작
10. 스테이지 클리어 가능
11. 모바일 터치 조작 표시
12. localStorage 최고 점수 저장
13. README 완성
14. 저작권 침해 요소 없음

작업 방식:
- 내게 매번 사소한 선택을 묻지 말고, 합리적인 기본값을 정해서 진행하라.
- 막히면 우회 구현을 선택하되, 결과가 플레이 가능해야 한다.
- 구현 중 발견한 문제는 즉시 수정하라.
- 마지막에는 변경된 파일 목록, 실행 명령어, 테스트 결과, 남은 개선점을 요약하라.
- 단순 샘플이 아니라 실제로 플레이 가능한 MVP를 완성하라.

이제 위 요구사항을 바탕으로 프로젝트를 구현하라.
먼저 레포 상태를 확인하고, 구현 계획을 짧게 제시한 다음, 실제 코드 작성과 테스트를 진행하라.