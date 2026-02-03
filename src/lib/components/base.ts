/**
 * Base Component Utilities
 * Shared props, interfaces, and utilities for Astro components
 */

/**
 * Animation props for components with optional animations
 */
export interface AnimatedProps {
  animate?: boolean;
  delay?: number;
}

/**
 * Props that accept a tag name (div, span, section, etc.)
 */
export interface AsTagProps {
  as?: HTMLElementTagNameMap[keyof HTMLElementTagNameMap] | string;
  class?: string;
}

/**
 * Glow effect props for spotlight animations
 */
export interface GlowProps {
  glowColor?: string;
}

/**
 * Interactive props for hover/focus states
 */
export interface InteractiveProps {
  interactive?: boolean;
}

/**
 * Generate component display name for debugging
 */
export const getComponentName = (componentPath: string): string => {
  const parts = componentPath.split("/");
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
};

/**
 * Helper to merge class lists with optional conditional classes
 */
export const mergeClasses = (...classes: (false | null | string | undefined)[]): string => classes.filter(Boolean).join(" ");
