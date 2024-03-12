import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        montserrat: ["Montserrat-Arabic", "sans-serif"],
      },
      fontSize: {
        h1: "28px",
        xsmall: "11px",
        small: "12px",
        medium: "14px",
        large: "16px",
        h2: "25px",
        h3: "22px",
        h4: "20px",
        h5: "18px",
      },
      lineHeight: {
        tight: "120%",
      },
      fontWeight: {
        reg: "400",
        med: "500",
        bold: "600",
      },
      colors: {
        primary: {
          P50: "#e9fdf7",
          P75: "#a3f7df",
          P100: "#7df3d1",
          P200: "#44eebd",
          P300: "#32CD32",
          P400: "#15a57b",
          P500: "#128f6b",
        },
        secondary: {
          S50: "#e7f4fe",
          S75: "#9ed2fa",
          S100: "#76c0f8",
          S200: "#3ba5f5",
          S300: "#1392f3",
          S400: "#0d66aa",
          S500: "#0c5994",
        },
        white: {
          W50: "#fffffe",
          W75: "#fffffc",
          W100: "#fffffb",
          W200: "#fffff9",
          W300: "#fffff8",
        },
        warning: {
          W50: "#fefaed",
          W75: "#fbebb4",
          W100: "#f9e294",
          W200: "#f7d666",
          W300: "#f5cd47",
          W400: "#ac9032",
          W500: "#957d2b",
        },
        danger: {
          D50: "#f8e9e9",
          D75: "#e4a5a6",
          D100: "#d98081",
          D200: "#c8494b",
          D300: "#bd2426",
          D400: "#84191b",
          D500: "#731617",
        },
        black: {
          B50: "#e8e8e9",
          B75: "#a2a2a3",
          B100: "#7b7b7d",
          B200: "#424244",
          B300: "#1b1b1e",
          B400: "#131315",
          B500: "#101012",
        },
      },
    },
  },
  plugins: [],
};

export default config;
