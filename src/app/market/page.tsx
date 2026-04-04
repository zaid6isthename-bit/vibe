"use client";

import { useState } from "react";

import { useNeuralMarket } from "@/context/NeuralMarketContext";
import {
  ALL_ASSETS,
  CATEGORY_LABELS,
  RARITY_COLORS,
  type AssetCategory,
} from "@/lib/neuralMarketAssets";

const CATEGORIES: AssetCategory[] = [
  "theme",
  "background",
  "font",
  "pomodoroBackground",
  "pomodoroButton",
];

export default function NeuralMarketPage() {
  const {
    flowCoins,
    purchaseAsset,
    equipAsset,
    unequipAsset,
    isOwned,
    isEquipped,
  } = useNeuralMarket();

  const [activeCategory, setActiveCategory] = useState<AssetCategory>("theme");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const filtered = ALL_ASSETS.filter((asset) => asset.category === activeCategory);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        fontFamily: "var(--font-primary)",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Neural Market
          </h1>
          <p style={{ color: "var(--color-text-secondary)", margin: "0.25rem 0 0" }}>
            Spend your FlowCoins. Upgrade your focus environment.
          </p>
        </div>
        <div
          style={{
            background: "var(--color-accent-soft)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "0.75rem 1.25rem",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-accent)",
          }}
        >
          {flowCoins} FlowCoins
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid",
              borderColor:
                activeCategory === category ? "var(--color-accent)" : "var(--color-border)",
              background:
                activeCategory === category ? "var(--color-accent-soft)" : "transparent",
              color:
                activeCategory === category
                  ? "var(--color-accent)"
                  : "var(--color-text-secondary)",
              cursor: "pointer",
              fontFamily: "var(--font-primary)",
              fontSize: "0.85rem",
              fontWeight: activeCategory === category ? 600 : 400,
              transition: "all 0.2s ease",
            }}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {filtered.map((asset) => {
          const owned = isOwned(asset.id);
          const equipped = isEquipped(asset.id);
          const rarity = RARITY_COLORS[asset.rarity];

          return (
            <div
              key={asset.id}
              style={{
                background: "var(--color-bg-card)",
                border: `1px solid ${equipped ? "var(--color-accent)" : "var(--color-border)"}`,
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: equipped ? "var(--color-shadow)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  height: "100px",
                  background: asset.preview.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontSize: "1.4rem",
                    fontFamily: "var(--font-display)",
                    color: asset.preview.textColor,
                    fontWeight: 700,
                    textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                  }}
                >
                  {asset.name}
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    color: rarity.text,
                    textShadow: `0 0 8px ${rarity.glow}`,
                  }}
                >
                  {rarity.label.toUpperCase()}
                </span>
                {equipped && (
                  <span
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: "var(--color-accent)",
                      background: "var(--color-accent-soft)",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--color-accent)",
                    }}
                  >
                    EQUIPPED
                  </span>
                )}
              </div>

              <div style={{ padding: "1rem" }}>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-secondary)",
                    margin: "0 0 1rem",
                    lineHeight: 1.5,
                  }}
                >
                  {asset.description}
                </p>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {!owned ? (
                    <button
                      onClick={() => showToast(purchaseAsset(asset.id).message)}
                      disabled={flowCoins < asset.cost}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: "none",
                        background:
                          flowCoins >= asset.cost
                            ? "var(--color-accent)"
                            : "var(--color-bg-secondary)",
                        color:
                          flowCoins >= asset.cost ? "#000000" : "var(--color-text-secondary)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        cursor: flowCoins >= asset.cost ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-primary)",
                        transition: "all 0.2s",
                      }}
                    >
                      {asset.cost} FlowCoins
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (equipped) {
                          unequipAsset(asset.id);
                          showToast("Unequipped.");
                          return;
                        }
                        showToast(equipAsset(asset.id).message);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.6rem",
                        borderRadius: "8px",
                        border: `1px solid ${
                          equipped ? "var(--color-accent)" : "var(--color-border)"
                        }`,
                        background: equipped ? "var(--color-accent-soft)" : "transparent",
                        color:
                          equipped ? "var(--color-accent)" : "var(--color-text-secondary)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        fontFamily: "var(--font-primary)",
                        transition: "all 0.2s",
                      }}
                    >
                      {equipped ? "Unequip" : "Equip"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-accent)",
            borderRadius: "10px",
            padding: "0.75rem 1.5rem",
            color: "var(--color-accent)",
            fontWeight: 600,
            boxShadow: "var(--color-shadow)",
            zIndex: 9999,
            animation: "fadeInUp 0.3s ease",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
