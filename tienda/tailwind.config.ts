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
        dorado: {
          100: "#FBF4E2",
          200: "#F5E6BD",
          300: "#EBCF8A",
          400: "#DEB858",
          500: "#C59B34",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        boutique: "0 10px 30px -10px rgba(77, 40, 27, 0.08)",
        book: "0 15px 35px -5px rgba(51, 25, 16, 0.12), 0 5px 15px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
