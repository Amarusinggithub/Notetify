/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./public/index.html",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      zIndex: {
        100: "100",
      },
      lineHeight: {
        "extra-loose": "2.5",
        12: "3.75rem",
      },
      height: {
        70: "4.375rem",
      },
    },
  },
  plugins: [],
};

