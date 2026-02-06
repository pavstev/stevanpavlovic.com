import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming";

const theme = create({
  appBg: "hsl(240 30% 2%)",
  appContentBg: "hsl(240 30% 3%)",
  barBg: "hsl(240 30% 3%)",
  barSelectedColor: "hsl(210 100% 45%)",
  barTextColor: "hsl(0 0% 98%)",
  base: "dark",
  brandImage: "",
  brandTarget: "_self",
  brandTitle: "SPCOM Design System",
  brandUrl: "/",
  colorPrimary: "hsl(210 100% 45%)",
  colorSecondary: "hsl(30 100% 50%)",
  fontBase: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace',
  textColor: "hsl(0 0% 98%)",
  textMutedColor: "hsl(240 5% 65%)",
});

addons.setConfig({
  sidebar: {
    collapsedRoots: ["other"],
    showRoots: true,
  },
  theme,
});
