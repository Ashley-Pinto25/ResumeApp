/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        careerlift: {
          "primary": "#4f46e5", // Deeper indigo for professional look
          "primary-focus": "#4338ca",
          "primary-content": "#ffffff",
          "secondary": "#7c3aed", // Rich purple
          "secondary-focus": "#6d28d9",
          "secondary-content": "#ffffff",
          "accent": "#0ea5e9", // Vibrant sky blue
          "accent-focus": "#0284c7",
          "accent-content": "#ffffff",
          "neutral": "#1e293b", // Dark slate
          "neutral-focus": "#0f172a",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#f1f5f9",
          "base-content": "#1e293b",
          "info": "#0ea5e9",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
          "--rounded-box": "0.5rem", // Border radius for cards
          "--rounded-btn": "0.3rem", // Border radius for buttons
          "--animation-btn": "0.2s", // Button click animation duration
          "--btn-focus-scale": "0.98", // Button click scale
          "--border-btn": "1px", // Button border width
          "--tab-radius": "0.5rem", // Tab border radius
        },
      },
      "light",
      "corporate",
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
