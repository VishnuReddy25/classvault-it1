/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        serif: ["'Fraunces'", "serif"],
      },
      colors: {
        vault: {
          50:  "#ede9fe",
          100: "#ddd6fe",
          200: "#c4b5fd",
          400: "#a78bfa",
          600: "#7c3aed",
          700: "#6c47ff",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      animation: {
        "fade-up":    "fadeUp 0.5s cubic-bezier(.22,1,.36,1) both",
        "scale-in":   "scaleIn 0.3s cubic-bezier(.34,1.56,.64,1) both",
        "slide-down": "slideDown 0.45s cubic-bezier(.22,1,.36,1) both",
        pulse2:       "pulse2 2.5s ease-in-out infinite",
        "lock-pulse": "lockPulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp:    { from:{opacity:0,transform:"translateY(18px)"}, to:{opacity:1,transform:"translateY(0)"} },
        scaleIn:   { from:{opacity:0,transform:"scale(0.92)"},       to:{opacity:1,transform:"scale(1)"} },
        slideDown: { from:{opacity:0,transform:"translateY(-16px)"}, to:{opacity:1,transform:"translateY(0)"} },
        pulse2:    { "0%,100%":{transform:"scale(1)",opacity:"1"},   "50%":{transform:"scale(1.35)",opacity:"0.7"} },
        lockPulse: { "0%,100%":{boxShadow:"0 0 0 0 rgba(245,158,11,0.25)"}, "50%":{boxShadow:"0 0 0 16px rgba(245,158,11,0)"} },
      },
    },
  },
  plugins: [],
};

