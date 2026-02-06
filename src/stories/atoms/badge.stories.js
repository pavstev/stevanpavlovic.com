/**
 * Badge Component Stories
 * Small labels for status, categories, or notifications.
 */

export default {
  title: "Atoms/Badge",
  component: "badge",
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "accent", "cyber"],
      description: "The visual style variant",
    },
    children: {
      control: "text",
      description: "Badge content",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "A versatile badge component with glowing effects and cyber aesthetics.",
      },
    },
  },
  decorators: [
    (Story) => `
      <div class="flex flex-wrap gap-3 p-6 bg-card rounded-xl border border-border">
        ${Story()}
      </div>
    `,
  ],
};

/**
 * Default Badge
 */
export const Default = {
  args: {
    variant: "default",
    children: "Default",
  },
  render: (args) => `
    <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none border-border/50 bg-foreground/5 text-muted-foreground hover:border-primary/30">
      ${args.children}
    </span>
  `,
};

/**
 * All Variants
 */
export const Variants = {
  render: () => `
    <div class="flex flex-wrap gap-3">
      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none neon-border bg-card/80 text-foreground">
        CYBER
      </span>
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none border-border/50 bg-foreground/5 text-muted-foreground hover:border-primary/30">
        DEFAULT
      </span>
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none shadow-glow-primary border-primary/40 bg-primary/10 text-primary">
        PRIMARY
      </span>
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none shadow-glow-accent border-accent/40 bg-accent/10 text-accent">
        ACCENT
      </span>
    </div>
  `,
};

/**
 * Status Badges
 */
export const Status = {
  render: () => `
    <div class="flex flex-wrap gap-3">
      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none neon-border bg-card/80 text-foreground">
        NEW
      </span>
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none shadow-glow-primary border-primary/40 bg-primary/10 text-primary">
        FEATURED
      </span>
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none shadow-glow-accent border-accent/40 bg-accent/10 text-accent">
        LIVE
      </span>
      <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none border-border/50 bg-foreground/5 text-muted-foreground hover:border-primary/30">
        DRAFT
      </span>
    </div>
  `,
};

/**
 * Notification Badge
 */
export const Notification = {
  render: () => `
    <div class="relative inline-flex">
      <svg class="size-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-glow-destructive">
        3
      </span>
    </div>
  `,
};

/**
 * Tech Stack Badges
 */
export const TechStack = {
  render: () => `
    <div class="flex flex-wrap gap-2">
      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none neon-border bg-card/80 text-foreground">
        ASTRO
      </span>
      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none shadow-glow-primary border-primary/40 bg-primary/10 text-primary">
        TAILWIND
      </span>
      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none shadow-glow-accent border-accent/40 bg-accent/10 text-accent">
        TYPESCRIPT
      </span>
      <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all duration-300 select-none border-border/50 bg-foreground/5 text-muted-foreground hover:border-primary/30">
        NODE
      </span>
    </div>
  `,
};
