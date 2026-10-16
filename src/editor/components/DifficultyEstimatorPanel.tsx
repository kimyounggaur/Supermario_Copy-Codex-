import type { LevelData } from "../../game/data/LevelData";
import { estimateDifficulty } from "../systems/EditorAdvancedTools";

interface DifficultyEstimatorPanelProps {
  level: LevelData;
}

export function DifficultyEstimatorPanel({
  level,
}: DifficultyEstimatorPanelProps) {
  const estimate = estimateDifficulty(level);

  return (
    <section
      className="difficulty-panel"
      data-testid="editor-panel-content-overview"
      role="region"
      aria-label="섬 난이도 개요"
    >
      <h2>섬의 개요</h2>
      <p className="panel-description">
        배치 수를 바탕으로 한 참고 값이에요. 테스트 플레이로 실제 동선을
        확인하세요.
      </p>
      <strong
        className={`difficulty-badge difficulty-badge--${{ easy: "쉬움", normal: "보통", hard: "어려움", experimental: "도전적" }[estimate.rating]}`}
      >
        {
          {
            easy: "쉬움",
            normal: "보통",
            hard: "어려움",
            experimental: "도전적",
          }[estimate.rating]
        }
      </strong>
      <dl>
        <div>
          <dt>적</dt>
          <dd>{estimate.enemyCount}</dd>
        </div>
        <div>
          <dt>위험</dt>
          <dd>{estimate.hazardCount}</dd>
        </div>
        <div>
          <dt>발판 간격</dt>
          <dd>{estimate.jumpGapEstimate}</dd>
        </div>
        <div>
          <dt>체크포인트 간격</dt>
          <dd>{estimate.checkpointSpacing}칸</dd>
        </div>
        <div>
          <dt>길이</dt>
          <dd>{estimate.levelLengthTiles}칸</dd>
        </div>
      </dl>
    </section>
  );
}
