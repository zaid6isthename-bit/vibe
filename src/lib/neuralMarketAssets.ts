// ============================================================
// FLOWIQ — NEURAL MARKET ASSET DEFINITIONS
// ============================================================
// This file is the single source of truth for all purchasable
// assets in the Neural Market. Every asset has:
//   - id: unique key used everywhere in the app
//   - category: theme | background | font | pomodoroBackground | pomodoroButton
//   - cost: in FlowCoins
//   - preview: CSS/class data used to render the preview card
//   - apply: the actual CSS variables / class names injected on purchase
// ============================================================

export type AssetCategory =
  | "theme"
  | "background"
  | "font"
  | "pomodoroBackground"
  | "pomodoroButton";

export interface NeuralAsset {
  id: string;
  name: string;
  description: string;
  category: AssetCategory;
  cost: number;          // FlowCoins
  rarity: "common" | "rare" | "epic" | "legendary";
  preview: AssetPreview;
  cssVars?: Record<string, string>;   // injected on :root
  bodyClass?: string;                  // added to <body>
  fontUrl?: string;                    // Google Fonts URL to inject
}

export interface AssetPreview {
  bg: string;           // CSS background for the card preview
  accent: string;       // hex accent color shown in preview
  textColor: string;    // text color for preview card
}

// ─────────────────────────────────────────────────────────────
// 1. THEMES  (full UI color overhaul)
// ─────────────────────────────────────────────────────────────
export const THEME_ASSETS: NeuralAsset[] = [
  {
    id: "theme_aurora",
    name: "Aurora",
    description: "Arctic greens and electric teal dancing across a deep navy canvas.",
    category: "theme",
    cost: 120,
    rarity: "epic",
    preview: { bg: "linear-gradient(135deg,#0d1b2a,#1a4a3a)", accent: "#00f5c4", textColor: "#e0fff8" },
    cssVars: {
      "--color-bg-primary": "#0d1b2a",
      "--color-bg-secondary": "#111f2e",
      "--color-bg-card": "#162638",
      "--color-accent": "#00f5c4",
      "--color-accent-hover": "#00c9a7",
      "--color-accent-soft": "rgba(0,245,196,0.12)",
      "--color-text-primary": "#e0fff8",
      "--color-text-secondary": "#7ab8ac",
      "--color-border": "rgba(0,245,196,0.15)",
      "--color-shadow": "0 4px 32px rgba(0,245,196,0.08)",
      "--color-sidebar": "#0b1520",
    },
    bodyClass: "theme-aurora",
  },
  {
    id: "theme_crimson_noir",
    name: "Crimson Noir",
    description: "Deep blacks with bleeding crimson — focus mode for the obsessed.",
    category: "theme",
    cost: 150,
    rarity: "legendary",
    preview: { bg: "linear-gradient(135deg,#0e0a0a,#2a0a0a)", accent: "#e63946", textColor: "#ffeaea" },
    cssVars: {
      "--color-bg-primary": "#0e0a0a",
      "--color-bg-secondary": "#140c0c",
      "--color-bg-card": "#1c1010",
      "--color-accent": "#e63946",
      "--color-accent-hover": "#c1121f",
      "--color-accent-soft": "rgba(230,57,70,0.12)",
      "--color-text-primary": "#ffeaea",
      "--color-text-secondary": "#a07070",
      "--color-border": "rgba(230,57,70,0.2)",
      "--color-shadow": "0 4px 32px rgba(230,57,70,0.1)",
      "--color-sidebar": "#0a0808",
    },
    bodyClass: "theme-crimson-noir",
  },
  {
    id: "theme_solar_flare",
    name: "Solar Flare",
    description: "Warm ambers and gold — like studying at golden hour, forever.",
    category: "theme",
    cost: 100,
    rarity: "rare",
    preview: { bg: "linear-gradient(135deg,#1a1200,#2a1f00)", accent: "#f4a100", textColor: "#fff8e1" },
    cssVars: {
      "--color-bg-primary": "#1a1200",
      "--color-bg-secondary": "#201800",
      "--color-bg-card": "#2a2000",
      "--color-accent": "#f4a100",
      "--color-accent-hover": "#d48800",
      "--color-accent-soft": "rgba(244,161,0,0.12)",
      "--color-text-primary": "#fff8e1",
      "--color-text-secondary": "#9a7f40",
      "--color-border": "rgba(244,161,0,0.2)",
      "--color-shadow": "0 4px 32px rgba(244,161,0,0.08)",
      "--color-sidebar": "#130d00",
    },
    bodyClass: "theme-solar-flare",
  },
  {
    id: "theme_void_purple",
    name: "Void Purple",
    description: "Deep space vibes. Ultraviolet haze over an infinite dark void.",
    category: "theme",
    cost: 80,
    rarity: "rare",
    preview: { bg: "linear-gradient(135deg,#0e0818,#1a0d2e)", accent: "#9b5de5", textColor: "#ede0ff" },
    cssVars: {
      "--color-bg-primary": "#0e0818",
      "--color-bg-secondary": "#130c22",
      "--color-bg-card": "#1a1030",
      "--color-accent": "#9b5de5",
      "--color-accent-hover": "#7b3fc5",
      "--color-accent-soft": "rgba(155,93,229,0.12)",
      "--color-text-primary": "#ede0ff",
      "--color-text-secondary": "#7a62a0",
      "--color-border": "rgba(155,93,229,0.2)",
      "--color-shadow": "0 4px 32px rgba(155,93,229,0.1)",
      "--color-sidebar": "#0a0614",
    },
    bodyClass: "theme-void-purple",
  },
  {
    id: "theme_paper_white",
    name: "Paper White",
    description: "Clean cream and ink. For thinkers who write before they type.",
    category: "theme",
    cost: 60,
    rarity: "common",
    preview: { bg: "linear-gradient(135deg,#faf6f0,#f0ebe0)", accent: "#2d2d2d", textColor: "#1a1a1a" },
    cssVars: {
      "--color-bg-primary": "#faf6f0",
      "--color-bg-secondary": "#f4efe5",
      "--color-bg-card": "#ffffff",
      "--color-accent": "#2d2d2d",
      "--color-accent-hover": "#555555",
      "--color-accent-soft": "rgba(45,45,45,0.08)",
      "--color-text-primary": "#1a1a1a",
      "--color-text-secondary": "#888880",
      "--color-border": "rgba(0,0,0,0.1)",
      "--color-shadow": "0 2px 16px rgba(0,0,0,0.06)",
      "--color-sidebar": "#ece8e0",
    },
    bodyClass: "theme-paper-white",
  },
  {
    id: "theme_tidal_ink",
    name: "Tidal Ink",
    description: "Inky ocean blues with a sharp cyan edge for crisp late-night focus.",
    category: "theme",
    cost: 135,
    rarity: "epic",
    preview: { bg: "linear-gradient(135deg,#07111f,#0d2742)", accent: "#67e8f9", textColor: "#e6fbff" },
    cssVars: {
      "--color-bg-primary": "#07111f",
      "--color-bg-secondary": "#0c1829",
      "--color-bg-card": "#11233a",
      "--color-accent": "#67e8f9",
      "--color-accent-hover": "#22d3ee",
      "--color-accent-soft": "rgba(103,232,249,0.14)",
      "--color-text-primary": "#e6fbff",
      "--color-text-secondary": "#8ab6c7",
      "--color-border": "rgba(103,232,249,0.18)",
      "--color-shadow": "0 8px 36px rgba(34,211,238,0.12)",
      "--color-sidebar": "#050d18",
    },
    bodyClass: "theme-tidal-ink",
  },
  {
    id: "theme_rose_circuit",
    name: "Rose Circuit",
    description: "Warm rose neon layered over graphite for a stylish but high-contrast workspace.",
    category: "theme",
    cost: 145,
    rarity: "epic",
    preview: { bg: "linear-gradient(135deg,#161016,#2e1125)", accent: "#fb7185", textColor: "#fff1f4" },
    cssVars: {
      "--color-bg-primary": "#161016",
      "--color-bg-secondary": "#1f1520",
      "--color-bg-card": "#2b1b2e",
      "--color-accent": "#fb7185",
      "--color-accent-hover": "#f43f5e",
      "--color-accent-soft": "rgba(251,113,133,0.14)",
      "--color-text-primary": "#fff1f4",
      "--color-text-secondary": "#c79cab",
      "--color-border": "rgba(251,113,133,0.2)",
      "--color-shadow": "0 8px 34px rgba(244,63,94,0.14)",
      "--color-sidebar": "#120b13",
    },
    bodyClass: "theme-rose-circuit",
  },
];

// ─────────────────────────────────────────────────────────────
// 2. BACKGROUNDS  (main app background effects)
// ─────────────────────────────────────────────────────────────
export const BACKGROUND_ASSETS: NeuralAsset[] = [
  {
    id: "bg_neural_grid",
    name: "Neural Grid",
    description: "Animated synaptic grid that pulses with your attention score.",
    category: "background",
    cost: 90,
    rarity: "epic",
    preview: { bg: "radial-gradient(ellipse at center,#0d1f3c 0%,#060e1f 100%)", accent: "#00aaff", textColor: "#aaddff" },
    bodyClass: "bg-neural-grid",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_matrix_rain",
    name: "Matrix Rain",
    description: "Classic digital rain in FlowIQ green. The code is real.",
    category: "background",
    cost: 110,
    rarity: "epic",
    preview: { bg: "linear-gradient(180deg,#000 0%,#001a00 100%)", accent: "#00ff41", textColor: "#00ff41" },
    bodyClass: "bg-matrix-rain",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_cosmos",
    name: "Deep Cosmos",
    description: "Slowly drifting star field. Study among the stars.",
    category: "background",
    cost: 75,
    rarity: "rare",
    preview: { bg: "radial-gradient(ellipse at 20% 50%,#1a0833 0%,#020108 100%)", accent: "#ffffff", textColor: "#ddd" },
    bodyClass: "bg-cosmos",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_lofi_room",
    name: "Lo-Fi Room",
    description: "Warm pixels, rain on the window, a cup of something hot.",
    category: "background",
    cost: 85,
    rarity: "rare",
    preview: { bg: "linear-gradient(135deg,#2c1810 0%,#1a2030 100%)", accent: "#ffcc66", textColor: "#ffeecc" },
    bodyClass: "bg-lofi-room",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_aurora_borealis",
    name: "Aurora Borealis",
    description: "Sweeping Northern Lights animated behind your workflow.",
    category: "background",
    cost: 130,
    rarity: "legendary",
    preview: { bg: "linear-gradient(160deg,#001a10 0%,#002830 50%,#001020 100%)", accent: "#00ffaa", textColor: "#b0fff0" },
    bodyClass: "bg-aurora-borealis",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_geometric_dark",
    name: "Geometric Dark",
    description: "Sharp low-poly geometry. Structured mind, structured space.",
    category: "background",
    cost: 50,
    rarity: "common",
    preview: { bg: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", accent: "#e94560", textColor: "#eee" },
    bodyClass: "bg-geometric-dark",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_data_stream",
    name: "Data Stream",
    description: "Soft falling data columns that give the workspace a moving analytical pulse.",
    category: "background",
    cost: 95,
    rarity: "rare",
    preview: { bg: "linear-gradient(180deg,#041017 0%,#071f2d 100%)", accent: "#38bdf8", textColor: "#dff7ff" },
    bodyClass: "bg-data-stream",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
  {
    id: "bg_sunset_haze",
    name: "Sunset Haze",
    description: "Layered dusk gradients with a slow drifting glow behind your study flow.",
    category: "background",
    cost: 105,
    rarity: "rare",
    preview: { bg: "linear-gradient(145deg,#1f1224 0%,#4b1d2f 45%,#71302f 100%)", accent: "#f59e0b", textColor: "#fff1d6" },
    bodyClass: "bg-sunset-haze",
    cssVars: { "--bg-overlay-opacity": "1" },
  },
];

// ─────────────────────────────────────────────────────────────
// 3. FONTS
// ─────────────────────────────────────────────────────────────
export const FONT_ASSETS: NeuralAsset[] = [
  {
    id: "font_space_mono",
    name: "Space Mono",
    description: "Monospaced retro-futurism. Every character is intentional.",
    category: "font",
    cost: 40,
    rarity: "common",
    preview: { bg: "#0d0d0d", accent: "#ffffff", textColor: "#ffffff" },
    fontUrl: "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap",
    cssVars: {
      "--font-primary": "'Space Mono', monospace",
      "--font-display": "'Space Mono', monospace",
    },
  },
  {
    id: "font_clash_display",
    name: "Clash Display",
    description: "Bold editorial contrast. Headers that command attention.",
    category: "font",
    cost: 70,
    rarity: "rare",
    preview: { bg: "#f5f0e8", accent: "#1a1a1a", textColor: "#1a1a1a" },
    fontUrl: "https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap",
    cssVars: {
      "--font-primary": "'Clash Display', sans-serif",
      "--font-display": "'Clash Display', sans-serif",
    },
  },
  {
    id: "font_syne",
    name: "Syne",
    description: "Variable weight geometric grotesque with expressive personality.",
    category: "font",
    cost: 55,
    rarity: "rare",
    preview: { bg: "#1c1c2e", accent: "#a78bfa", textColor: "#e0e0ff" },
    fontUrl: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap",
    cssVars: {
      "--font-primary": "'Syne', sans-serif",
      "--font-display": "'Syne', sans-serif",
    },
  },
  {
    id: "font_instrument_serif",
    name: "Instrument Serif",
    description: "Elegant editorial serif for a scholarly, focused aesthetic.",
    category: "font",
    cost: 60,
    rarity: "rare",
    preview: { bg: "#faf6f0", accent: "#2d2d2d", textColor: "#1a1a1a" },
    fontUrl: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap",
    cssVars: {
      "--font-primary": "'Instrument Serif', serif",
      "--font-display": "'Instrument Serif', serif",
    },
  },
  {
    id: "font_oxanium",
    name: "Oxanium",
    description: "Futuristic rounded display font. Built for the neural age.",
    category: "font",
    cost: 80,
    rarity: "epic",
    preview: { bg: "#050a1a", accent: "#00f5c4", textColor: "#00f5c4" },
    fontUrl: "https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;600;700;800&display=swap",
    cssVars: {
      "--font-primary": "'Oxanium', sans-serif",
      "--font-display": "'Oxanium', sans-serif",
    },
  },
  {
    id: "font_manrope",
    name: "Manrope",
    description: "Clean geometric sans with excellent readability for dense revision sessions.",
    category: "font",
    cost: 50,
    rarity: "common",
    preview: { bg: "#0c1119", accent: "#e2e8f0", textColor: "#f8fafc" },
    fontUrl: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
    cssVars: {
      "--font-primary": "'Manrope', sans-serif",
      "--font-display": "'Manrope', sans-serif",
    },
  },
  {
    id: "font_cormorant",
    name: "Cormorant",
    description: "A refined serif for students who want an elegant editorial feel.",
    category: "font",
    cost: 75,
    rarity: "rare",
    preview: { bg: "#18140f", accent: "#f8d38b", textColor: "#fff7e7" },
    fontUrl: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap",
    cssVars: {
      "--font-primary": "'Cormorant Garamond', serif",
      "--font-display": "'Cormorant Garamond', serif",
    },
  },
];

// ─────────────────────────────────────────────────────────────
// 4. POMODORO BACKGROUNDS
// ─────────────────────────────────────────────────────────────
export const POMODORO_BACKGROUND_ASSETS: NeuralAsset[] = [
  {
    id: "pom_bg_ember",
    name: "Ember Focus",
    description: "Deep red glow — your timer burns like a focused flame.",
    category: "pomodoroBackground",
    cost: 65,
    rarity: "rare",
    preview: { bg: "radial-gradient(ellipse at center,#3d0000 0%,#0a0000 100%)", accent: "#ff4400", textColor: "#ffccaa" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #3d0000 0%, #0a0000 100%)",
      "--pom-glow": "rgba(255,68,0,0.3)",
      "--pom-text": "#ffccaa",
      "--pom-accent": "#ff4400",
    },
  },
  {
    id: "pom_bg_ocean",
    name: "Deep Ocean",
    description: "Breathe in. The tide goes with your timer.",
    category: "pomodoroBackground",
    cost: 65,
    rarity: "rare",
    preview: { bg: "radial-gradient(ellipse at center,#002244 0%,#000a1a 100%)", accent: "#0088ff", textColor: "#aaccff" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #002244 0%, #000a1a 100%)",
      "--pom-glow": "rgba(0,136,255,0.25)",
      "--pom-text": "#aaccff",
      "--pom-accent": "#0088ff",
    },
  },
  {
    id: "pom_bg_forest_mist",
    name: "Forest Mist",
    description: "Soft green haze. Study like you're in a misty grove.",
    category: "pomodoroBackground",
    cost: 55,
    rarity: "common",
    preview: { bg: "radial-gradient(ellipse at center,#0a2010 0%,#020a04 100%)", accent: "#44cc88", textColor: "#aaffcc" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #0a2010 0%, #020a04 100%)",
      "--pom-glow": "rgba(68,204,136,0.2)",
      "--pom-text": "#aaffcc",
      "--pom-accent": "#44cc88",
    },
  },
  {
    id: "pom_bg_cosmic_void",
    name: "Cosmic Void",
    description: "Infinite dark with violet nebula. Time is irrelevant here.",
    category: "pomodoroBackground",
    cost: 100,
    rarity: "epic",
    preview: { bg: "radial-gradient(ellipse at 30% 40%,#200040 0%,#050010 100%)", accent: "#aa44ff", textColor: "#ddbbff" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at 30% 40%, #200040 0%, #050010 100%)",
      "--pom-glow": "rgba(170,68,255,0.25)",
      "--pom-text": "#ddbbff",
      "--pom-accent": "#aa44ff",
    },
  },
  {
    id: "pom_bg_golden_hour",
    name: "Golden Hour",
    description: "Warm amber at dusk. Do your best work as the sun sets.",
    category: "pomodoroBackground",
    cost: 75,
    rarity: "rare",
    preview: { bg: "radial-gradient(ellipse at center,#3a2000 0%,#0e0800 100%)", accent: "#ffaa00", textColor: "#ffe8aa" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #3a2000 0%, #0e0800 100%)",
      "--pom-glow": "rgba(255,170,0,0.25)",
      "--pom-text": "#ffe8aa",
      "--pom-accent": "#ffaa00",
    },
  },
  {
    id: "pom_bg_neural_pulse",
    name: "Neural Pulse",
    description: "Animated cyan grid that pulses with each timer tick.",
    category: "pomodoroBackground",
    cost: 140,
    rarity: "legendary",
    preview: { bg: "radial-gradient(ellipse at center,#001a2e 0%,#000810 100%)", accent: "#00f5c4", textColor: "#b0fff0" },
    bodyClass: "pom-bg-neural-pulse",
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #001a2e 0%, #000810 100%)",
      "--pom-glow": "rgba(0,245,196,0.3)",
      "--pom-text": "#b0fff0",
      "--pom-accent": "#00f5c4",
    },
  },
  {
    id: "pom_bg_arctic_dawn",
    name: "Arctic Dawn",
    description: "Cold blue gradients with a pale horizon glow for calm, precise focus.",
    category: "pomodoroBackground",
    cost: 85,
    rarity: "rare",
    preview: { bg: "radial-gradient(ellipse at center,#17324f 0%,#07111c 100%)", accent: "#7dd3fc", textColor: "#e0f7ff" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #17324f 0%, #07111c 100%)",
      "--pom-glow": "rgba(125,211,252,0.24)",
      "--pom-text": "#e0f7ff",
      "--pom-accent": "#7dd3fc",
    },
  },
  {
    id: "pom_bg_midnight_lab",
    name: "Midnight Lab",
    description: "Dark lab glass tones with a violet glow for long, technical sessions.",
    category: "pomodoroBackground",
    cost: 115,
    rarity: "epic",
    preview: { bg: "radial-gradient(ellipse at center,#140f28 0%,#05040d 100%)", accent: "#c084fc", textColor: "#f3e8ff" },
    cssVars: {
      "--pom-bg": "radial-gradient(ellipse at center, #140f28 0%, #05040d 100%)",
      "--pom-glow": "rgba(192,132,252,0.24)",
      "--pom-text": "#f3e8ff",
      "--pom-accent": "#c084fc",
    },
  },
];

// ─────────────────────────────────────────────────────────────
// 5. POMODORO BUTTONS
// ─────────────────────────────────────────────────────────────
export const POMODORO_BUTTON_ASSETS: NeuralAsset[] = [
  {
    id: "pom_btn_neon_ring",
    name: "Neon Ring",
    description: "Glowing circular button with animated ring pulse on hover.",
    category: "pomodoroButton",
    cost: 50,
    rarity: "rare",
    preview: { bg: "#050a1a", accent: "#00f5c4", textColor: "#00f5c4" },
    cssVars: {
      "--pom-btn-bg": "transparent",
      "--pom-btn-border": "2px solid #00f5c4",
      "--pom-btn-radius": "50%",
      "--pom-btn-shadow": "0 0 20px rgba(0,245,196,0.5), inset 0 0 20px rgba(0,245,196,0.05)",
      "--pom-btn-hover-shadow": "0 0 40px rgba(0,245,196,0.8), inset 0 0 30px rgba(0,245,196,0.1)",
      "--pom-btn-text": "#00f5c4",
      "--pom-btn-width": "140px",
      "--pom-btn-height": "140px",
    },
    bodyClass: "pom-btn-neon-ring",
  },
  {
    id: "pom_btn_brutal",
    name: "Brutalist Block",
    description: "Hard edge, hard shadow. No gradients. Just intention.",
    category: "pomodoroButton",
    cost: 40,
    rarity: "common",
    preview: { bg: "#f5f0e0", accent: "#ff2200", textColor: "#000000" },
    cssVars: {
      "--pom-btn-bg": "#ffffff",
      "--pom-btn-border": "3px solid #000000",
      "--pom-btn-radius": "0px",
      "--pom-btn-shadow": "6px 6px 0px #000000",
      "--pom-btn-hover-shadow": "3px 3px 0px #000000",
      "--pom-btn-text": "#000000",
      "--pom-btn-width": "140px",
      "--pom-btn-height": "56px",
    },
    bodyClass: "pom-btn-brutal",
  },
  {
    id: "pom_btn_liquid_fire",
    name: "Liquid Fire",
    description: "Morphing blob button with molten gradient animation.",
    category: "pomodoroButton",
    cost: 90,
    rarity: "epic",
    preview: { bg: "#0a0000", accent: "#ff4400", textColor: "#fff" },
    cssVars: {
      "--pom-btn-bg": "linear-gradient(135deg,#ff4400,#ff0066)",
      "--pom-btn-border": "none",
      "--pom-btn-radius": "60% 40% 30% 70% / 60% 30% 70% 40%",
      "--pom-btn-shadow": "0 8px 32px rgba(255,68,0,0.4)",
      "--pom-btn-hover-shadow": "0 12px 48px rgba(255,68,0,0.7)",
      "--pom-btn-text": "#ffffff",
      "--pom-btn-width": "140px",
      "--pom-btn-height": "140px",
    },
    bodyClass: "pom-btn-liquid-fire",
  },
  {
    id: "pom_btn_glass",
    name: "Glass Orb",
    description: "Frosted glass circle. Minimalist. Elegant. Premium.",
    category: "pomodoroButton",
    cost: 70,
    rarity: "rare",
    preview: { bg: "linear-gradient(135deg,#1a1a2e,#16213e)", accent: "#ffffff", textColor: "#fff" },
    cssVars: {
      "--pom-btn-bg": "rgba(255,255,255,0.08)",
      "--pom-btn-border": "1px solid rgba(255,255,255,0.2)",
      "--pom-btn-radius": "50%",
      "--pom-btn-shadow": "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
      "--pom-btn-hover-shadow": "0 12px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
      "--pom-btn-text": "#ffffff",
      "--pom-btn-width": "140px",
      "--pom-btn-height": "140px",
    },
    bodyClass: "pom-btn-glass",
  },
  {
    id: "pom_btn_pixel",
    name: "Pixel Press",
    description: "8-bit inspired button that physically depresses on click.",
    category: "pomodoroButton",
    cost: 55,
    rarity: "common",
    preview: { bg: "#1a0a2e", accent: "#ff00ff", textColor: "#fff" },
    cssVars: {
      "--pom-btn-bg": "#220044",
      "--pom-btn-border": "2px solid #ff00ff",
      "--pom-btn-radius": "4px",
      "--pom-btn-shadow": "4px 4px 0 #ff00ff, 8px 8px 0 rgba(255,0,255,0.3)",
      "--pom-btn-hover-shadow": "2px 2px 0 #ff00ff",
      "--pom-btn-text": "#ff00ff",
      "--pom-btn-width": "140px",
      "--pom-btn-height": "56px",
    },
    bodyClass: "pom-btn-pixel",
  },
  {
    id: "pom_btn_aurora_pulse",
    name: "Aurora Pulse",
    description: "Legendary animated aurora shimmer button. One of a kind.",
    category: "pomodoroButton",
    cost: 160,
    rarity: "legendary",
    preview: { bg: "#0a1a10", accent: "#00ff88", textColor: "#00ff88" },
    cssVars: {
      "--pom-btn-bg": "linear-gradient(135deg,#00f5c4,#0088ff,#aa44ff)",
      "--pom-btn-border": "none",
      "--pom-btn-radius": "50%",
      "--pom-btn-shadow": "0 0 40px rgba(0,245,196,0.5)",
      "--pom-btn-hover-shadow": "0 0 80px rgba(0,245,196,0.8)",
      "--pom-btn-text": "#ffffff",
      "--pom-btn-width": "140px",
      "--pom-btn-height": "140px",
    },
    bodyClass: "pom-btn-aurora-pulse",
  },
  {
    id: "pom_btn_holo_flip",
    name: "Holo Flip",
    description: "A holographic slab button with cool neon edges and a glassy glow.",
    category: "pomodoroButton",
    cost: 95,
    rarity: "epic",
    preview: { bg: "linear-gradient(135deg,#07121f,#123152)", accent: "#7dd3fc", textColor: "#f8fdff" },
    cssVars: {
      "--pom-btn-bg": "linear-gradient(135deg, rgba(125,211,252,0.2), rgba(59,130,246,0.18))",
      "--pom-btn-border": "1px solid rgba(125,211,252,0.55)",
      "--pom-btn-radius": "1.25rem",
      "--pom-btn-shadow": "0 12px 30px rgba(59,130,246,0.22)",
      "--pom-btn-hover-shadow": "0 16px 42px rgba(125,211,252,0.3)",
      "--pom-btn-text": "#f8fdff",
      "--pom-btn-width": "auto",
      "--pom-btn-height": "auto",
    },
  },
  {
    id: "pom_btn_sunflare",
    name: "Sunflare",
    description: "A bright amber control button that feels energetic without overwhelming the timer.",
    category: "pomodoroButton",
    cost: 80,
    rarity: "rare",
    preview: { bg: "linear-gradient(135deg,#3d2400,#b45309)", accent: "#fbbf24", textColor: "#fff8e1" },
    cssVars: {
      "--pom-btn-bg": "linear-gradient(135deg, #f59e0b, #f97316)",
      "--pom-btn-border": "none",
      "--pom-btn-radius": "1rem",
      "--pom-btn-shadow": "0 12px 28px rgba(245,158,11,0.28)",
      "--pom-btn-hover-shadow": "0 16px 40px rgba(249,115,22,0.34)",
      "--pom-btn-text": "#fff8e1",
      "--pom-btn-width": "auto",
      "--pom-btn-height": "auto",
    },
  },
];

// ─────────────────────────────────────────────────────────────
// MASTER CATALOG
// ─────────────────────────────────────────────────────────────
function withThemeAliases(asset: NeuralAsset): NeuralAsset {
  if (asset.category !== "theme" || !asset.cssVars) return asset;

  const accent = asset.cssVars["--color-accent"] ?? "#58a6ff";
  const background = asset.cssVars["--color-bg-primary"] ?? "#0f1117";
  const foreground = asset.cssVars["--color-text-primary"] ?? "#e6edf3";
  const card = asset.cssVars["--color-bg-card"] ?? "#1c2333";
  const border = asset.cssVars["--color-border"] ?? "rgba(88, 166, 255, 0.15)";
  const sidebar = asset.cssVars["--color-sidebar"] ?? "#0d1117";

  return {
    ...asset,
    cssVars: {
      ...asset.cssVars,
      "--background": background,
      "--foreground": foreground,
      "--accent-blue": accent,
      "--accent-purple": accent,
      "--accent-teal": accent,
      "--accent-amber": accent,
      "--card-bg": card,
      "--card-border": border,
      "--sidebar-bg": sidebar,
    },
  };
}

function withFontAliases(asset: NeuralAsset): NeuralAsset {
  if (asset.category !== "font" || !asset.cssVars) return asset;

  return {
    ...asset,
    cssVars: {
      ...asset.cssVars,
      "--font-active": asset.cssVars["--font-primary"] ?? "system-ui, sans-serif",
    },
  };
}

export const ALL_ASSETS: NeuralAsset[] = [
  ...THEME_ASSETS.map(withThemeAliases),
  ...BACKGROUND_ASSETS,
  ...FONT_ASSETS.map(withFontAliases),
  ...POMODORO_BACKGROUND_ASSETS,
  ...POMODORO_BUTTON_ASSETS,
];

export const RARITY_COLORS = {
  common:    { text: "#9ca3af", glow: "rgba(156,163,175,0.3)",  label: "Common"    },
  rare:      { text: "#60a5fa", glow: "rgba(96,165,250,0.35)",  label: "Rare"      },
  epic:      { text: "#a78bfa", glow: "rgba(167,139,250,0.4)",  label: "Epic"      },
  legendary: { text: "#f59e0b", glow: "rgba(245,158,11,0.5)",   label: "Legendary" },
};

export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  theme:               "🎨 Themes",
  background:          "🌌 Backgrounds",
  font:                "✍️ Fonts",
  pomodoroBackground:  "⏱ Pomodoro Scenes",
  pomodoroButton:      "🔘 Pomodoro Buttons",
};
