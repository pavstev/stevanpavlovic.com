/** @type { import('@storybook/html').Preview } */
const preview = {
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || "dark";
      return `
        <div class="min-h-[200px] flex items-center justify-center p-6 transition-colors duration-300 ${theme === "dark" ? "bg-[hsl(240_30%_2%)]" : "bg-white"}">
          <div class="w-full max-w-xl">
            ${Story()}
          </div>
        </div>
      `;
    },
  ],
  globalTypes: {
    theme: {
      defaultValue: "dark",
      description: "Global theme for components",
      toolbar: {
        dynamicTitle: true,
        icon: "circlehollow",
        items: ["dark", "light"],
        title: "Theme",
      },
    },
  },
  parameters: {
    backgrounds: {
      default: "dark",
      values: [
        { name: "dark", value: "hsl(240 30% 2%)" },
        { name: "light", value: "#ffffff" },
        { name: "card", value: "hsl(240 30% 3%)" },
        { name: "muted", value: "hsl(240 10% 8%)" },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      description: {
        component: "Atom components for the SPCOM design system",
      },
    },
    layout: "centered",
    options: {
      storySort: {
        order: [
          "Atoms",
          "Avatar",
          "Badge",
          "Button",
          "CardSpotlight",
          "Container",
          "Heading",
          "Icon",
          "Meteors",
          "Separator",
          "Stack",
          "Text",
        ],
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
