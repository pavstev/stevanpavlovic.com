export type ResponsiveValue<T>
  = | T
    | { base: T; lg?: T; md?: T; sm?: T; xl?: T };

export const buildResponsiveClasses = <T extends number | string>(
  value: ResponsiveValue<T> | undefined,
  prefix: string,
): string => {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    const classes = [`${prefix}-${String(value.base)}`];
    if (value.sm) {
      classes.push(`sm:${prefix}-${String(value.sm)}`);
    }
    if (value.md) {
      classes.push(`md:${prefix}-${String(value.md)}`);
    }
    if (value.lg) {
      classes.push(`lg:${prefix}-${String(value.lg)}`);
    }
    if (value.xl) {
      classes.push(`xl:${prefix}-${String(value.xl)}`);
    }
    return classes.join(" ");
  }

  return `${prefix}-${String(value)}`;
};
