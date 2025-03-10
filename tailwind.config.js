// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        // Adding the custom max-width to tailwind config
        layout: "1440px",
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
