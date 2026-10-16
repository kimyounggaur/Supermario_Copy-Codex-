import { useState } from "react";
import { artUrl } from "../../game/render/artCatalog";
import {
  catalogCategories,
  objectCatalog,
  type CatalogCategory,
} from "../data/objectCatalog";
interface PalettePanelProps {
  activeCategory: CatalogCategory;
  activeItemId: string | null;
  onCategoryChange: (category: CatalogCategory) => void;
  onItemChange: (itemId: string) => void;
}
const categoryLabels: Record<CatalogCategory, string> = {
  terrain: "지형",
  platforms: "발판",
  items: "아이템",
  enemies: "적",
  hazards: "위험",
  utilities: "주요 지점",
  decorations: "장식",
};
const thumbnails: Record<string, string> = {
  skyGrassBlock: "tile-meadow",
  softCloudBlock: "platform-cloud",
  oneWayCloudPlatform: "platform-cloud",
  staticFloatingPlatform: "platform-cloud",
  movingBreezePlatform: "platform-cloud",
  fallingCloudPlatform: "platform-cloud",
  lightSeedShard: "light-seed",
  bigLightSeed: "light-seed",
  breezeOrb: "breeze-orb",
  driftBug: "drift-bug",
  thornCrystal: "thorn-pod",
  playerSpawn: "sprout-idle",
  glowLanternCheckpoint: "checkpoint-lantern",
};
export function PalettePanel({
  activeCategory,
  activeItemId,
  onCategoryChange,
  onItemChange,
}: PalettePanelProps) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const items = objectCatalog.filter((item) =>
    trimmed
      ? `${item.label} ${item.id} ${item.description}`
          .toLowerCase()
          .includes(trimmed)
      : item.category === activeCategory,
  );
  return (
    <section
      className="palette-panel"
      data-testid="editor-panel-content-palette"
      aria-label="오브젝트 팔레트"
    >
      <h2>무엇을 놓을까요?</h2>
      <label className="palette-search">
        <span className="sr-only">오브젝트 검색</span>
        <input
          type="search"
          data-testid="palette-search"
          value={query}
          placeholder="이름으로 검색"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <nav className="palette-tabs" aria-label="팔레트 카테고리">
        {catalogCategories.map((category) => (
          <button
            key={category}
            type="button"
            data-testid={`palette-category-${category}`}
            aria-pressed={!trimmed && category === activeCategory}
            className={
              !trimmed && category === activeCategory ? "is-active" : ""
            }
            onClick={() => {
              setQuery("");
              onCategoryChange(category);
            }}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </nav>
      <div className="palette-items">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`palette-item-${item.id}`}
            aria-pressed={item.id === activeItemId}
            className={item.id === activeItemId ? "is-selected" : ""}
            title={item.description}
            onClick={() => onItemChange(item.id)}
          >
            <span
              className={`palette-swatch palette-swatch--${item.category}`}
              aria-hidden="true"
            >
              {thumbnails[item.id] ? (
                <img
                  src={artUrl(`raster/${thumbnails[item.id]}.png`)}
                  alt=""
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.hidden = true;
                  }}
                />
              ) : (
                <span>◇</span>
              )}
            </span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
          </button>
        ))}
      </div>
      {!items.length && (
        <p className="empty-panel">
          찾는 오브젝트가 없어요. 다른 이름으로 검색하세요.
        </p>
      )}
    </section>
  );
}
