import { cn } from "@client/utils.ts";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { type AnchorHTMLAttributes, type ComponentProps, type ElementType, type FC } from "react";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      isActive: false,
      size: "default",
      variant: "default",
    },
    variants: {
      isActive: {
        false: "",
        true: "shadow-glow-primary/50 border-2 border-primary bg-primary/15 text-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        icon: "size-9",
        "icon-lg": "size-10",
        "icon-sm": "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
      },
      variant: {
        default:
          "shadow-glow-primary relative border border-primary/50 bg-primary bg-linear-to-b from-primary to-primary/80 text-primary-foreground hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(210_100%_45%_/_0.6)] hover:brightness-110",
        destructive:
          "shadow-glow-destructive hover:shadow-glow-destructive/80 bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        ghost: "hover:shadow-glow-subtle hover:bg-foreground/5 hover:text-foreground",
        glass:
          "glass hover:shadow-glow border-foreground/10 text-foreground shadow-sm hover:-translate-y-0.5 hover:border-foreground/20 hover:bg-foreground/10",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "hover:shadow-glow-primary border bg-background shadow-xs hover:border-primary/50 hover:bg-primary/5 hover:text-primary dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "shadow-glow-secondary hover:shadow-glow-secondary/80 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      },
    },
  }
);

export const Button: FC<
  AnchorHTMLAttributes<HTMLAnchorElement> &
    ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      as?: ElementType;
      asChild?: boolean;
      isActive?: boolean;
    }
> = ({
  as,
  asChild = false,
  className,
  isActive,
  size = "default",
  variant = "default",
  ...props
}) => {
  const Comp = asChild ? Slot.Root : (as ?? "button");

  return (
    <Comp
      className={cn(buttonVariants({ className, isActive, size, variant }))}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  );
};
