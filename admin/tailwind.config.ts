import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crema: {
          50: "#FFFEFC",
          100: "#FDFBF7",
          200: "#F7F3E9",
          300: "#EFE7D8",
          400: "#DFD3BD",
          500: "#C9BA9F",
        },
        terracota: {
          50: "#FBF5F2",
          100: "#F5E8E2",
          200: "#ECCFC4",
          300: "#DFB09E",
          400: "#C88569",
          500: "#A8654C",
          600: "#8C4F37",
          700: "#703D2A",
          800: "#4D281B",
          900: "#331910",
        },
        oliva: {
          50: "#F4F6F2",
          100: "#E6ECE1",
          200: "#CDD9C3",
          300: "#ADC19F",
          400: "#8B9F7B",
          500: "#6B805B",
          600: "#556747",
          700: "#415036",
          800: "#303C27",
          900: "#212A1B",
        },
      },
    },
  },
  plugins: [],
};

export default config;
