import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/**/*.html"],
  darkMode: "media",
  theme: {
    extend: {},
  },
  plugins: [typography()],
};
