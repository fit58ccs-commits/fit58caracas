import type { Config } from "tailwindcss";
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "fade-up":      "fadeUp 0.5s ease both",
        "ticker":       "ticker 28s linear infinite",
        "heart-pop":    "heartPop 0.35s ease",
        "badge-bounce": "badgeBounce 0.4s cubic-bezier(.22,.68,0,1.5)",
        "toast-in":     "toastIn 0.35s cubic-bezier(.22,.68,0,1.2) both",
        "toast-out":    "toastOut 0.3s ease both",
        "drawer-in":    "drawerIn 0.4s cubic-bezier(.22,.68,0,1.15) both",
        "overlay-in":   "overlayIn 0.3s ease both",
        "cart-pop":     "cartPop 0.35s cubic-bezier(.22,.68,0,1.5)",
        "badge-pulse":  "badgePulse 1.8s ease infinite",
        "hero-text":    "heroIn 0.6s cubic-bezier(.22,.68,0,1.2) both",
        "hero-img":     "imgIn 0.7s cubic-bezier(.22,.68,0,1.2) 0.1s both",
      },
      keyframes: {
        fadeUp:      { from:{ opacity:"0", transform:"translateY(24px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        ticker:      { from:{ transform:"translateX(0)" }, to:{ transform:"translateX(-50%)" } },
        heartPop:    { "0%,100%":{ transform:"scale(1)" }, "50%":{ transform:"scale(1.4)" } },
        badgeBounce: { "0%":{ transform:"scale(1)" }, "40%":{ transform:"scale(1.55)" }, "100%":{ transform:"scale(1)" } },
        toastIn:     { from:{ opacity:"0", transform:"translateY(16px) scale(0.92)" }, to:{ opacity:"1", transform:"translateY(0) scale(1)" } },
        toastOut:    { from:{ opacity:"1" }, to:{ opacity:"0", transform:"translateY(16px) scale(0.92)" } },
        drawerIn:    { from:{ transform:"translateX(100%)" }, to:{ transform:"translateX(0)" } },
        overlayIn:   { from:{ opacity:"0" }, to:{ opacity:"1" } },
        cartPop:     { "0%":{ transform:"scale(1)" }, "40%":{ transform:"scale(1.2)" }, "100%":{ transform:"scale(1)" } },
        badgePulse:  { "0%,100%":{ opacity:"1" }, "50%":{ opacity:"0.65" } },
        heroIn:      { from:{ opacity:"0", transform:"translateY(20px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        imgIn:       { from:{ opacity:"0", transform:"scale(0.92) translateY(14px)" }, to:{ opacity:"1", transform:"scale(1) translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
