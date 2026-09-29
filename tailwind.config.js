/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090D",
        secondaryBg: "#0D1017",
        cardBg: "#11141B",
        elevatedCard: "#151923",
        border: "#242936",
        primary: "#8B5CF6",
        secondary: "#6366F1",
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        textMuted: "#64748B",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#38BDF8",
      },
    },
  },
  plugins: [],
}
