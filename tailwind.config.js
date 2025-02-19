// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        // Adding the custom max-width to tailwind config
        layout: "1340px",
      },
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          md: "2rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1340px", // Making sure 2xl is our target width
        },
      },
      colors: {
        brand: {
          primary: "#0284c7",
          hover: "#0369a1",
          light: "#0ea5e9",
          dark: "#0369a1",
        },
      },
    },
  },
  plugins: [],
};

// const theme = {
//   colors: {
//     primary: "#0284c7",
//     primaryGradientStart: "#0ea5e9",
//     primaryGradientEnd: "#0369a1",
//     primaryHover: "#0369a1",
//     secondary: "#f8fafc",
//     secondaryHover: "#f1f5f9",
//     border: "#e2e8f0",
//     borderHover: "#cbd5e1",
//     text: "#1e293b",
//     textLight: "#64748b",
//     background: "#ffffff",
//     error: "#ef4444",
//     success: "#22c55e",
//     shadowLight: "rgba(148, 163, 184, 0.1)",
//     shadowMedium: "rgba(148, 163, 184, 0.2)",
//   },
// };
