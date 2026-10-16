import type { ValidationResult } from "../schemas/levelDefaults";
interface ValidationPanelProps {
  results: ValidationResult[];
  onFocusResult: (result: ValidationResult) => void;
}
export function ValidationPanel({
  results,
  onFocusResult,
}: ValidationPanelProps) {
  return (
    <section
      className="validation-panel"
      data-testid="editor-panel-content-validation"
      aria-label="검증 패널"
    >
      <h2>출발 전 확인</h2>
      <p className="panel-description">
        오브젝트가 연결된 항목을 누르면 해당 위치로 이동해요.
      </p>
      <div className="validation-list">
        {!results.length ? (
          <p>검증 버튼으로 시작점과 동선을 확인하세요.</p>
        ) : (
          results.map((result) => {
            const content = (
              <>
                <span>
                  {result.severity === "error"
                    ? "수정 필요"
                    : result.severity === "warning"
                      ? "확인 권장"
                      : "참고"}
                </span>
                <strong>{friendlyMessage(result.message)}</strong>
              </>
            );
            return result.objectId ? (
              <button
                key={result.id}
                type="button"
                className={`validation-item validation-item--${result.severity}`}
                onClick={() => onFocusResult(result)}
              >
                {content}
                <small>위치로 이동 →</small>
              </button>
            ) : (
              <div
                key={result.id}
                className={`validation-item validation-item--${result.severity}`}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
// Keep validation's stable internal messages for existing importers and tests; localize presentation.
function friendlyMessage(message: string): string {
  const messages: Record<string, string> = {
    "Place exactly one Player Spawn.":
      "시작점을 하나 놓아 주세요. 주요 지점 팔레트에서 찾을 수 있어요.",
    "Place exactly one Wind Gate Finish.": "도착할 바람문을 하나 놓아 주세요.",
    "Level width and height must stay within supported editor bounds.":
      "섬 크기는 가로 20~300칸, 세로 12~80칸으로 설정해 주세요.",
    "Wind Gate Finish is buried inside solid terrain.":
      "바람문이 지형 안에 묻혀 있어요. 위로 옮겨 주세요.",
    "Player Spawn is inside solid terrain.":
      "시작점이 지형 안에 있어요. 안전한 발판 위로 옮겨 주세요.",
    "Add at least one Glow Lantern Checkpoint for longer routes.":
      "긴 길이라면 다시 시작할 등불 체크포인트를 놓아 주세요.",
    "Add at least one Light Seed Shard to reward exploration.":
      "탐험의 보상으로 빛의 씨앗을 놓아 보세요.",
    "No enemies are placed yet.":
      "배치한 적이 없어요. 평화로운 섬으로 만들 수 있어요.",
    "A hazard is very close to the Player Spawn.":
      "시작점 가까이에 위험이 있어요. 안전하게 출발할 수 있는지 확인하세요.",
    "Very wide levels can be slower on mobile devices.":
      "아주 긴 섬은 모바일에서 느려질 수 있어요.",
    "The route to the Wind Gate is not clear. Add more platforms or test play it.":
      "바람문까지 갈 수 있는지 테스트하거나 발판을 더 놓아 주세요.",
    "The Wind Gate may be too high to reach without intermediate platforms.":
      "바람문이 높이 있어요. 중간 발판을 확인하세요.",
  };
  if (messages[message]) return messages[message];
  return message
    .replace(/^Duplicate object id "(.+)"\.$/, "오브젝트 ID “$1”가 중복돼요.")
    .replace(
      /^Object "(.+)" is outside the level bounds\.$/,
      "오브젝트 “$1”가 섬 밖에 있어요.",
    )
    .replace(
      /^Terrain "(.+)" must have positive width and height\.$/,
      "지형 “$1”의 너비와 높이를 1 이상으로 설정하세요.",
    )
    .replace(
      /^Moving platform "(.+)" needs at least two waypoints\.$/,
      "이동 발판 “$1”에 경유점이 2개 이상 필요해요.",
    )
    .replace(/^Estimated shards: (\d+)\.$/, "빛의 씨앗 $1개")
    .replace(/^Enemies: (\d+)\.$/, "적 $1개")
    .replace(/^Hazards: (\d+)\.$/, "위험 $1개");
}
