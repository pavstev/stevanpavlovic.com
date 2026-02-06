/** @type { import('storybook__html').StorybookConfig } */
const config = {
  stories: ["../src/**/*.mdx", "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    // Ensure CSS is properly configured
    return config;
  },
};

export default config;
