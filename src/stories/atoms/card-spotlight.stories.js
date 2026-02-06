/**
 * CardSpotlight Component Stories
 * Cards with dynamic spotlight effect that follows the mouse cursor.
 */

export default {
  title: "Atoms/CardSpotlight",
  component: "card-spotlight",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "A card component with a dynamic spotlight effect that follows the mouse cursor.",
      },
    },
  },
  decorators: [
    (Story) => `
      <div class="group/card relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
        <div class="p-6">
          ${Story()}
        </div>
        <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
      </div>
    `,
  ],
};

/**
 * Default Card with Spotlight
 */
export const Default = {
  render: () => `
    <div>
      <h3 class="text-lg font-bold text-foreground mb-2">Spotlight Card</h3>
      <p class="text-muted-foreground">Hover over this card to see the spotlight effect follow your cursor.</p>
    </div>
  `,
};

/**
 * With Gradient Border
 */
export const GradientBorder = {
  render: () => `
    <div class="group/card relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
      <div class="p-6 relative z-10">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 rounded-xl"></div>
        <h3 class="text-lg font-bold text-foreground mb-2 relative z-10">Gradient Card</h3>
        <p class="text-muted-foreground relative z-10">This card features a subtle gradient overlay on hover.</p>
      </div>
      <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
    </div>
  `,
};

/**
 * With Image
 */
export const WithImage = {
  render: () => `
    <div class="group/card relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
      <div class="aspect-video w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=225&fit=crop" alt="Abstract art" class="size-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
      </div>
      <div class="p-6">
        <h3 class="text-lg font-bold text-foreground mb-2">Featured Image</h3>
        <p class="text-muted-foreground">A beautiful abstract artwork with spotlight interaction.</p>
      </div>
      <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
    </div>
  `,
};

/**
 * Interactive Cards Grid
 */
export const CardsGrid = {
  render: () => `
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
      <div class="group/card relative overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
        <div class="p-6">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-foreground mb-2">Lightning Fast</h3>
          <p class="text-sm text-muted-foreground">Built with Astro for optimal performance and speed.</p>
        </div>
        <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
      </div>
      <div class="group/card relative overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
        <div class="p-6">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-foreground mb-2">Secure by Design</h3>
          <p class="text-sm text-muted-foreground">Enterprise-grade security built into every component.</p>
        </div>
        <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
      </div>
      <div class="group/card relative overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
        <div class="p-6">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-foreground mb-2">Beautiful Design</h3>
          <p class="text-sm text-muted-foreground">Stunning aesthetics with Tailwind CSS v4.</p>
        </div>
        <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
      </div>
      <div class="group/card relative overflow-hidden rounded-xl border border-border bg-card shadow-glow-subtle transition-all duration-300 hover:border-primary/30">
        <div class="p-6">
          <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-foreground mb-2">TypeScript Ready</h3>
          <p class="text-sm text-muted-foreground">Full type safety and excellent developer experience.</p>
        </div>
        <div class="spotlight pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover/card:opacity-30" style="background: radial-gradient(500px circle at var(--mouse-x) var(--mouse-y), var(--color-primary) 0%, var(--color-secondary) 40%, var(--color-accent) 80%, transparent 100%);"></div>
      </div>
    </div>
    <script>
      document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.group\\/card');
        cards.forEach((card) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', x + 'px');
          card.style.setProperty('--mouse-y', y + 'px');
        });
      });
    </script>
  `,
};
