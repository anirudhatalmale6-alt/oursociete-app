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
        primary: "#AA6DC7",
        accent: "#FEB8FF",
        cyan: "#84DCF0",
        darkpurple: "#412F73",
        teal: "#149183",
        bluepurple: "#6767C2",
      },
      fontFamily: {
        heading: ['"Sulphur Point"', 'sans-serif'],
        body: ['"Source Sans 3"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
