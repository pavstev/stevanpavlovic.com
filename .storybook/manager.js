import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming";

const theme = create({
  base: "dark",
  appBg: "hsl(240 30% 2%)",
  appContentBg: "hsl(240 30% 3%)",
  barBg: "hsl(240 30% 3%)",
  barTextColor: "hsl(0 0% 98%)",
  barSelectedColor: "hsl(210 100% 45%)",
  colorPrimary: "hsl(210 100% 45%)",
  colorSecondary: "hsl(30 100% 50%)",
  textColor: "hsl(0 0% 98%)",
  textMutedColor: "hsl(240 5% 65%)",
  fontBase: '"Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif',
  fontCode: '"JetBrains Mono Variable", "JetBrains Mono", ui-monospace, monospace',
  brandTitle: "SPCOM Design System",
  brandUrl: "/",
  brandImage: "",
  brandTarget: "_self",
});

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
    collapsedRoots: ["other"],
  },
});
