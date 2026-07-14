import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6f4f2",
          100: "#b3d9d3",
          200: "#80bfb4",
          300: "#4da494",
          400: "#268a7e",
          500: "#028090",
          600: "#026c78",
          700: "#025860",
          800: "#014448",
          900: "#0B2E2C",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
