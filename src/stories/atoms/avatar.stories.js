/**
 * Avatar Component Stories
 * Displays user profile images or fallback initials with various sizes and variants.
 */

export default {
  title: "Atoms/Avatar",
  component: "avatar",
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "The size of the avatar",
    },
    variant: {
      control: "select",
      options: ["default", "glass", "primary"],
      description: "The visual style variant",
    },
    fallback: {
      control: "text",
      description: "Fallback initials when no image is provided",
    },
    src: {
      control: "text",
      description: "Image source URL",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A responsive avatar component that displays user profile images or fallback initials with glowing effects.",
      },
    },
  },
  decorators: [
    (Story) => `
      <div class="flex items-center gap-4 p-6 bg-card rounded-xl border border-border">
        ${Story()}
      </div>
    `,
  ],
};

/**
 * Default Avatar with fallback
 */
export const Default = {
  args: {
    size: "md",
    variant: "default",
    fallback: "JD",
  },
  render: (args) => `
    <div class="relative flex shrink-0 overflow-hidden rounded-full transition-all duration-300 ${args.size === "xs" ? "size-6" : args.size === "sm" ? "size-8" : args.size === "md" ? "size-10" : args.size === "lg" ? "size-12" : "size-16"} ${args.variant === "default" ? "border border-border/50 bg-muted/20" : args.variant === "glass" ? "glass border-white/10 bg-white/5" : "shadow-glow-primary border border-primary/30 bg-primary/10"}">
      <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
        <span class="select-none ${args.size === "xs" ? "text-[10px]" : args.size === "sm" ? "text-xs" : args.size === "md" ? "text-sm" : args.size === "lg" ? "text-base" : "text-xl"}">${args.fallback}</span>
      </div>
    </div>
  `,
};

/**
 * Avatar with image
 */
export const WithImage = {
  args: {
    size: "lg",
    variant: "default",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    fallback: "JD",
  },
  render: (args) => `
    <div class="relative flex shrink-0 overflow-hidden rounded-full transition-all duration-300 ${args.size === "xs" ? "size-6" : args.size === "sm" ? "size-8" : args.size === "md" ? "size-10" : args.size === "lg" ? "size-12" : "size-16"} ${args.variant === "default" ? "border border-border/50 bg-muted/20" : args.variant === "glass" ? "glass border-white/10 bg-white/5" : "shadow-glow-primary border border-primary/30 bg-primary/10"}">
      <img alt="${args.fallback}" class="aspect-square size-full object-cover" src="${args.src}" />
    </div>
  `,
};

/**
 * Avatar Sizes
 */
export const Sizes = {
  render: () => `
    <div class="flex items-end gap-4">
      <div class="relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-all duration-300 size-6">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-[10px]">XS</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-all duration-300 size-8">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-xs">SM</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-all duration-300 size-10">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-sm">MD</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-all duration-300 size-12">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-base">LG</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-all duration-300 size-16">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-xl">XL</span>
        </div>
      </div>
    </div>
  `,
};

/**
 * Avatar Variants
 */
export const Variants = {
  render: () => `
    <div class="flex items-center gap-6">
      <div class="relative flex shrink-0 overflow-hidden rounded-full border border-border/50 bg-muted/20 transition-all duration-300 size-12">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-base">DF</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full glass border-white/10 bg-white/5 transition-all duration-300 size-12">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-base">GL</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full shadow-glow-primary border border-primary/30 bg-primary/10 transition-all duration-300 size-12">
        <div class="flex size-full items-center justify-center bg-primary/20 font-medium text-primary uppercase">
          <span class="select-none text-base">PR</span>
        </div>
      </div>
    </div>
  `,
};

/**
 * Avatar Group
 */
export const Group = {
  render: () => `
    <div class="flex -space-x-3">
      <div class="relative flex shrink-0 overflow-hidden rounded-full border-2 border-card shadow-glow-subtle transition-all duration-300 size-12 ring-2 ring-background">
        <div class="flex size-full items-center justify-center bg-primary/20 font-medium text-primary uppercase">
          <span class="select-none text-sm">A</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border-2 border-card shadow-glow-subtle transition-all duration-300 size-12 ring-2 ring-background">
        <div class="flex size-full items-center justify-center bg-secondary/20 font-medium text-secondary uppercase">
          <span class="select-none text-sm">B</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border-2 border-card shadow-glow-subtle transition-all duration-300 size-12 ring-2 ring-background">
        <div class="flex size-full items-center justify-center bg-accent/20 font-medium text-accent uppercase">
          <span class="select-none text-sm">C</span>
        </div>
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border-2 border-card shadow-glow-subtle transition-all duration-300 size-12 ring-2 ring-background">
        <img alt="User" class="aspect-square size-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face" />
      </div>
      <div class="relative flex shrink-0 overflow-hidden rounded-full border-2 border-card bg-muted/50 shadow-glow-subtle transition-all duration-300 size-12 ring-2 ring-background">
        <div class="flex size-full items-center justify-center bg-muted font-medium text-muted-foreground uppercase">
          <span class="select-none text-sm">+3</span>
        </div>
      </div>
    </div>
  `,
};
