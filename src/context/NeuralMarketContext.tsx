"use client";

import React, { createContext, useContext } from "react";

import { useNeuralAssets } from "@/lib/useNeuralAssets";

const NeuralMarketContext = createContext<ReturnType<typeof useNeuralAssets> | null>(null);

export function NeuralMarketProvider({ children }: { children: React.ReactNode }) {
  const assets = useNeuralAssets();

  return (
    <NeuralMarketContext.Provider value={assets}>
      {children}
    </NeuralMarketContext.Provider>
  );
}

export function useNeuralMarket() {
  const ctx = useContext(NeuralMarketContext);
  if (!ctx) throw new Error("useNeuralMarket must be used inside NeuralMarketProvider");
  return ctx;
}
