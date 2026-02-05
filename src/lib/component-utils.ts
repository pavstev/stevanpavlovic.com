// Shared component patterns and utilities

/**
 * Standard prop destructuring pattern
 * @param props - Astro props
 * @param defaults - Default values
 * @returns Destructured props with defaults
 */
export function getProps<T>(props: T, defaults: Partial<T> = {}) {
  return { ...defaults, ...props } as T;
}

/**
 * Standard class name pattern
 * @param className - Custom class name
 * @param baseClass - Base class name
 * @returns Combined class name
 */
export function getClassName(className?: string, baseClass?: string) {
  return [baseClass, className].filter(Boolean).join(' ');
}

/**
 * Standard icon component pattern
 * @param icon - Icon name
 * @param size - Icon size
 * @param className - Custom class name
 * @returns Icon component
 */
export function IconComponent(icon?: string, size?: number, className?: string) {
  if (!icon) return null;
  
  return `<div class="flex size-12 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 ${className || ''}"><Icon name="${icon}" size="${size || 24}" /></div>`;
}

/**
 * Standard heading component pattern
 * @param level - Heading level
 * @param title - Heading title
 * @param subtitle - Heading subtitle
 * @param description - Heading description
 * @param icon - Heading icon
 * @param className - Custom class name
 * @returns Heading component
 */
export function HeadingComponent({
  level = 2,
  title,
  subtitle,
  description,
  icon,
  className,
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  className?: string;
}) {
  return `<div class="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 ${className || ''}">
    <Stack align="center" class="min-w-0" direction="row" gap={4}>
      ${IconComponent(icon, 24)}
      <div class="min-w-0">
        <Heading level="${level}" size="xl">
          ${title}
        </Heading>
        
        ${subtitle ? `<Text size="sm" variant="muted">
          ${subtitle}
        </Text>` : ''}
        
        ${description ? `<Text class="mt-2" size="sm" variant="secondary">
          ${description}
        </Text>` : ''}
      </div>
    </Stack>
  </div>`;
}

/**
 * Standard back button component
 * @param href - Back button URL
 * @param text - Back button text
 * @param className - Custom class name
 * @returns Back button component
 */
export function BackButton(href?: string, text = 'Back', className?: string) {
  if (!href) return null;
  
  return `<a href="${href}" class="shrink-0 text-muted hover:text-foreground transition-colors ${className || ''}">
    <span class="sr-only">${text}</span>
    <span aria-hidden class="material-icons text-sm">arrow_back</span>
  </a>`;
}

/**
 * Standard action slot component
 * @param children - Action content
 * @param className - Custom class name
 * @returns Action slot component
 */
export function ActionSlot(children: any, className?: string) {
  return `<div class="shrink-0 ${className || ''}">
    ${children}
  </div>`;
}

/**
 * Standard tags component
 * @param tags - Array of tags
 * @param heading - Tags heading
 * @param variant - Tags variant
 * @param className - Custom class name
 * @returns Tags component
 */
export function TagsComponent({
  tags,
  heading = 'Tags',
  variant = 'default',
  className,
}: {
  tags?: string[];
  heading?: string;
  variant?: 'default' | 'subtle' | 'elevated';
  className?: string;
}) {
  if (!tags || tags.length === 0) return null;
  
  return `<div class="group relative overflow-hidden rounded-2xl border border-foreground/5 bg-linear-to-br from-background/30 to-transparent p-6 shadow-sm backdrop-blur-sm transition-all duration-500 hover:border-foreground/10 hover:shadow-md ${variant === 'subtle' ? 'bg-foreground/5 border-foreground/10' : ''} ${variant === 'elevated' ? 'shadow-lg' : ''} ${className || ''}">
    <div class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-accent/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    <Stack class="relative" gap={3}>
      <div class="flex items-center justify-between">
        <h6 class="mb-2 font-medium ${variant === 'subtle' ? 'text-foreground' : 'text-muted'}">${heading}</h6>
        <slot name="action" />
      </div>
      <Tags tags={tags} />
    </Stack>
  </div>`;
}

export default {
  getProps,
  getClassName,
  IconComponent,
  HeadingComponent,
  BackButton,
  ActionSlot,
  TagsComponent,
};