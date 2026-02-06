/**
 * Container Component Stories
 * Responsive container component for constraining content width.
 */

export default {
  title: "Atoms/Container",
  component: "container",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "A responsive container that constrains content width with consistent padding.",
      },
    },
  },
  decorators: [
    (Story) => `
      <div class="w-full bg-muted/20 rounded-lg p-4">
        <div class="border border-dashed border-border">
          ${Story()}
        </div>
      </div>
    `,
  ],
};

/**
 * Default Container
 */
export const Default = {
  render: () => `
    <div class="relative mx-auto w-full max-w-6xl px-3 sm:px-5 lg:px-6">
      <div class="h-20 bg-muted/30 rounded border border-border/50 flex items-center justify-center">
        <p class="text-muted-foreground">Container Content (max-w-6xl)</p>
      </div>
    </div>
  `,
};

/**
 * Container Sizes
 */
export const Sizes = {
  render: () => `
    <div class="flex flex-col gap-6 w-full max-w-4xl">
      <div>
        <p class="text-sm text-muted-foreground mb-2">max-w-6xl (default)</p>
        <div class="relative mx-auto w-full max-w-6xl px-3 sm:px-5 lg:px-6">
          <div class="h-12 bg-primary/10 rounded border border-primary/30 flex items-center justify-center text-primary text-sm">Full Width Container</div>
        </div>
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-2">max-w-4xl</p>
        <div class="relative mx-auto w-full max-w-4xl px-3 sm:px-5 lg:px-6">
          <div class="h-12 bg-secondary/10 rounded border border-secondary/30 flex items-center justify-center text-secondary text-sm">Constrained Container</div>
        </div>
      </div>
      <div>
        <p class="text-sm text-muted-foreground mb-2">max-w-2xl</p>
        <div class="relative mx-auto w-full max-w-2xl px-3 sm:px-5 lg:px-6">
          <div class="h-12 bg-accent/10 rounded border border-accent/30 flex items-center justify-center text-accent text-sm">Narrow Container</div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Responsive Padding
 */
export const ResponsivePadding = {
  render: () => `
    <div class="relative mx-auto w-full max-w-4xl px-3 sm:px-5 lg:px-6">
      <div class="bg-muted/30 rounded border border-border">
        <div class="grid grid-cols-3 gap-4 p-3 sm:p-5 lg:p-6">
          <div class="aspect-square bg-primary/10 rounded flex items-center justify-center text-xs text-primary">xs: p-3</div>
          <div class="aspect-square bg-secondary/10 rounded flex items-center justify-center text-xs text-secondary">sm: p-5</div>
          <div class="aspect-square bg-accent/10 rounded flex items-center justify-center text-xs text-accent">lg: p-6</div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Container with Content
 */
export const WithContent = {
  render: () => `
    <div class="relative mx-auto w-full max-w-6xl px-3 sm:px-5 lg:px-6">
      <div class="bg-card rounded-xl border border-border shadow-glow-subtle overflow-hidden">
        <div class="border-b border-border px-4 py-3">
          <h3 class="font-semibold text-foreground">Page Title</h3>
        </div>
        <div class="p-6">
          <p class="text-muted-foreground mb-4">This is content inside a container with proper spacing and responsive padding.</p>
          <div class="flex gap-3">
            <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase neon-border bg-card/80 text-foreground">Container</span>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase shadow-glow-primary border-primary/40 bg-primary/10 text-primary">Responsive</span>
          </div>
        </div>
      </div>
    </div>
  `,
};

/**
 * Full Width Section
 */
export const FullWidthSection = {
  render: () => `
    <div class="w-full">
      <div class="relative mx-auto w-full max-w-6xl px-3 sm:px-5 lg:px-6 py-8">
        <div class="bg-gradient-to-r from-primary/10 via-card to-accent/10 rounded-xl border border-border p-6">
          <h3 class="text-xl font-bold text-foreground mb-2">Full Width Background</h3>
          <p class="text-muted-foreground">This section has a full-width background with a constrained content container.</p>
        </div>
      </div>
    </div>
  `,
};
