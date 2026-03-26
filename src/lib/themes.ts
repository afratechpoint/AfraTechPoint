export const THEMES = {
  midnight: {
    id: "midnight",
    name: "Midnight Pro",
    primary: "#000000",
    text: "#ffffff",
    hover: "#1f2937",
    accent: "#374151",
  },
  ocean: {
    id: "ocean",
    name: "Ocean Breeze",
    primary: "#0ea5e9",
    text: "#ffffff",
    hover: "#0284c7",
    accent: "#7dd3fc",
  },
  berry: {
    id: "berry",
    name: "Berry Royal",
    primary: "#8b5cf6",
    text: "#ffffff",
    hover: "#7c3aed",
    accent: "#c4b5fd",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Luxe",
    primary: "#10b981",
    text: "#ffffff",
    hover: "#059669",
    accent: "#6ee7b7",
  },
  sunset: {
    id: "sunset",
    name: "Sunset Glow",
    primary: "#f43f5e",
    text: "#ffffff",
    hover: "#e11d48",
    accent: "#fda4af",
  },
} as const;

export type ThemeId = keyof typeof THEMES;
