// ============================================================
// FLOWIQ — NEURAL MARKET ASSET ENGINE
// useNeuralAssets.ts
// ============================================================
// Drop this hook anywhere in FlowIQ. It handles:
//   - Injecting CSS variables to :root
//   - Adding/removing body classes
//   - Injecting Google Font <link> tags
//   - Persisting equipped assets to localStorage
//   - Deactivating conflicting assets in the same category
// ============================================================

import { useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage"; // see below
import {
  NeuralAsset,
  AssetCategory,
  ALL_ASSETS,
} from "./neuralMarketAssets";

const STORAGE_KEY_EQUIPPED  = "flowiq_equipped_assets";
const STORAGE_KEY_OWNED     = "flowiq_owned_assets";
const STORAGE_KEY_COINS     = "flowiq_flow_coins";

// One asset per category can be equipped at once
const SINGLE_SLOT_CATEGORIES: AssetCategory[] = [
  "theme",
  "background",
  "font",
  "pomodoroBackground",
  "pomodoroButton",
];

// ─────────────────────────────────────────────────────────────
export function useNeuralAssets() {
  const [equippedIds, setEquippedIds] = useLocalStorage<string[]>(
    STORAGE_KEY_EQUIPPED,
    []
  );
  const [ownedIds, setOwnedIds] = useLocalStorage<string[]>(
    STORAGE_KEY_OWNED,
    []
  );
  const [flowCoins, setFlowCoins] = useLocalStorage<number>(
    STORAGE_KEY_COINS,
    0
  );

  // ── Helpers ──────────────────────────────────────────────
  const getAsset = (id: string) => ALL_ASSETS.find((a) => a.id === id);
  const isOwned    = (id: string) => ownedIds.includes(id);
  const isEquipped = (id: string) => equippedIds.includes(id);

  // ── Apply CSS vars & body classes for an asset ───────────
  const applyAsset = useCallback((asset: NeuralAsset) => {
    const root = document.documentElement;

    // Inject CSS variables
    if (asset.cssVars) {
      Object.entries(asset.cssVars).forEach(([key, val]) => {
        root.style.setProperty(key, val);
      });
    }

    // Add body class
    if (asset.bodyClass) {
      document.body.classList.add(asset.bodyClass);
    }

    // Inject font link if not already present
    if (asset.fontUrl) {
      const existingLink = document.querySelector(
        `link[data-flowiq-font="${asset.id}"]`
      );
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = asset.fontUrl;
        link.setAttribute("data-flowiq-font", asset.id);
        document.head.appendChild(link);
      }
    }
  }, []);

  // ── Remove an asset's styles ─────────────────────────────
  const removeAsset = useCallback((asset: NeuralAsset) => {
    if (asset.bodyClass) {
      document.body.classList.remove(asset.bodyClass);
    }
    // CSS vars are overwritten on next apply — no need to remove
  }, []);

  // ── On mount: reapply all equipped assets ────────────────
  useEffect(() => {
    equippedIds.forEach((id) => {
      const asset = getAsset(id);
      if (asset) applyAsset(asset);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Purchase an asset ────────────────────────────────────
  const purchaseAsset = useCallback(
    (id: string): { success: boolean; message: string } => {
      const asset = getAsset(id);
      if (!asset) return { success: false, message: "Asset not found." };
      if (isOwned(id)) return { success: false, message: "Already owned." };
      if (flowCoins < asset.cost)
        return {
          success: false,
          message: `Need ${asset.cost - flowCoins} more FlowCoins.`,
        };

      setFlowCoins((c) => c - asset.cost);
      setOwnedIds((prev) => [...prev, id]);
      return { success: true, message: `${asset.name} unlocked!` };
    },
    [flowCoins, ownedIds] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const unlockAsset = useCallback(
    (id: string): { success: boolean; message: string } => {
      const asset = getAsset(id);
      if (!asset) return { success: false, message: "Asset not found." };
      if (isOwned(id)) return { success: false, message: "Already owned." };

      setOwnedIds((prev) => [...prev, id]);
      return { success: true, message: `${asset.name} unlocked!` };
    },
    [ownedIds], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const unlockAndEquipAsset = useCallback(
    (id: string): { success: boolean; message: string } => {
      const asset = getAsset(id);
      if (!asset) return { success: false, message: "Asset not found." };

      if (!isOwned(id)) {
        setOwnedIds((prev) => [...prev, id]);
      }

      const sameCategory = equippedIds
        .map(getAsset)
        .filter((a) => a?.category === asset.category);

      sameCategory.forEach((prev) => {
        if (prev) {
          removeAsset(prev);
        }
      });

      applyAsset(asset);
      setEquippedIds((prev) => [...prev.filter((itemId) => getAsset(itemId)?.category !== asset.category), id]);

      return { success: true, message: `${asset.name} unlocked and equipped!` };
    },
    [equippedIds, ownedIds, applyAsset, removeAsset], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Equip an asset ────────────────────────────────────────
  const equipAsset = useCallback(
    (id: string): { success: boolean; message: string } => {
      const asset = getAsset(id);
      if (!asset) return { success: false, message: "Asset not found." };
      if (!isOwned(id)) return { success: false, message: "Purchase first." };
      if (isEquipped(id)) return { success: false, message: "Already equipped." };

      // Unequip any other asset in same category
      const sameCategory = equippedIds
        .map(getAsset)
        .filter((a) => a?.category === asset.category);

      sameCategory.forEach((prev) => {
        if (prev) {
          removeAsset(prev);
          setEquippedIds((ids) => ids.filter((i) => i !== prev.id));
        }
      });

      applyAsset(asset);
      setEquippedIds((prev) => [...prev, id]);
      return { success: true, message: `${asset.name} equipped!` };
    },
    [equippedIds, ownedIds, applyAsset, removeAsset] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Unequip an asset ─────────────────────────────────────
  const unequipAsset = useCallback(
    (id: string) => {
      const asset = getAsset(id);
      if (!asset) return;
      removeAsset(asset);
      setEquippedIds((prev) => prev.filter((i) => i !== id));
    },
    [removeAsset] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Get currently equipped asset per category ────────────
  const getEquippedForCategory = useCallback(
    (category: AssetCategory): NeuralAsset | null => {
      const id = equippedIds.find(
        (i) => getAsset(i)?.category === category
      );
      return id ? getAsset(id) ?? null : null;
    },
    [equippedIds]
  );

  return {
    // State
    flowCoins,
    ownedIds,
    equippedIds,
    allAssets: ALL_ASSETS,
    // Actions
    purchaseAsset,
    unlockAsset,
    unlockAndEquipAsset,
    equipAsset,
    unequipAsset,
    // Helpers
    isOwned,
    isEquipped,
    getEquippedForCategory,
    // Coins management (call this from your existing FlowCoins system)
    addFlowCoins: (amount: number) => setFlowCoins((c) => c + amount),
  };
}
