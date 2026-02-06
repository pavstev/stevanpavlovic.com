/** @type { import('storybook__html').StorybookConfig } */
const config = {
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions"],
  docs: {
    autodocs: "tag",
  },
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  stories: ["../src/**/*.mdx", "../src/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  viteFinal: async (config) => {
    // Ensure CSS is properly configured
    return config;
  },
};

export default config;
