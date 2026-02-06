/**
 * Button Component Stories
 * Interactive button component with multiple variants and sizes.
 */

export default {
  title: "Atoms/Button",
  component: "button",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "glass", "destructive"],
      description: "The visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "icon"],
      description: "The size of the button",
    },
    children: {
      control: "text",
      description: "Button content",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "A versatile button component with glowing effects and multiple variants.",
      },
    },
  },
};

/**
 * Default Primary Button
 */
export const Primary = {
  args: {
    variant: "primary",
    size: "md",
    children: "Primary Button",
    disabled: false,
  },
  render: (args) => `
    <button
      class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50
      ${args.size === "sm" ? "h-8 rounded-md px-3 text-[12px]" : args.size === "md" ? "h-9 rounded-lg px-4 text-[13px]" : args.size === "lg" ? "h-11 rounded-xl px-6 text-[15px]" : "size-9 rounded-full"}
      ${args.variant === "primary" ? "shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110" : ""}
      ${args.variant === "secondary" ? "shadow-glow-secondary hover:shadow-glow-secondary/80 bg-secondary text-secondary-foreground hover:bg-secondary/80" : ""}
      ${args.variant === "outline" ? "hover:shadow-glow-primary border border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary" : ""}
      ${args.variant === "ghost" ? "hover:shadow-glow-subtle text-muted-foreground hover:bg-foreground/5 hover:text-foreground" : ""}
      ${args.variant === "glass" ? "glass hover:shadow-glow border-white/10 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10" : ""}
      ${args.variant === "destructive" ? "shadow-glow-destructive hover:shadow-glow-destructive/80 bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
      ${args.disabled ? "disabled:pointer-events-none disabled:opacity-50" : ""}"
      ${args.disabled ? "disabled" : ""}
    >
      ${args.children}
    </button>
  `,
};

/**
 * All Variants
 */
export const Variants = {
  render: () => `
    <div class="flex flex-wrap gap-4">
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        Primary
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] shadow-glow-secondary hover:shadow-glow-secondary/80 bg-secondary text-secondary-foreground hover:bg-secondary/80">
        Secondary
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] hover:shadow-glow-primary border border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
        Outline
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] hover:shadow-glow-subtle text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
        Ghost
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] glass hover:shadow-glow border-white/10 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
        Glass
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] shadow-glow-destructive hover:shadow-glow-destructive/80 bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Destructive
      </button>
    </div>
  `,
};

/**
 * All Sizes
 */
export const Sizes = {
  render: () => `
    <div class="flex items-center gap-4">
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-8 rounded-md px-3 text-[12px] shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        Small
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        Medium
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-11 rounded-xl px-6 text-[15px] shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        Large
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] size-9 rounded-full shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  `,
};

/**
 * Button with Icons
 */
export const WithIcons = {
  render: () => `
    <div class="flex flex-wrap gap-4">
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Item
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] hover:shadow-glow-primary border border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Go Back
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] h-9 rounded-lg px-4 text-[13px] glass hover:shadow-glow border-white/10 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
        Download
        <svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
    </div>
  `,
};

/**
 * Disabled Button
 */
export const Disabled = {
  render: () => `
    <div class="flex gap-4">
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 h-9 rounded-lg px-4 text-[13px] shadow-glow-primary relative border border-primary/50 bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110">
        Disabled
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 h-9 rounded-lg px-4 text-[13px] glass hover:shadow-glow border-white/10 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10">
        Disabled
      </button>
    </div>
  `,
};

/**
 * Button Group
 */
export const Group = {
  render: () => `
    <div class="inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-glow-subtle">
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] rounded-md h-8 px-3 text-[12px] bg-primary text-primary-foreground shadow-sm">
        Day
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] rounded-md h-8 px-3 text-[12px] text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
        Week
      </button>
      <button class="inline-flex cursor-pointer items-center justify-center gap-2 font-medium tracking-wide whitespace-nowrap ring-offset-background transition-all duration-300 select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none active:scale-[0.98] rounded-md h-8 px-3 text-[12px] text-muted-foreground hover:bg-foreground/5 hover:text-foreground">
        Month
      </button>
    </div>
  `,
};
