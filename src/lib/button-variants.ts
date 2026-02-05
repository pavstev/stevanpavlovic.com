import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2",
        icon: "size-9",
        lg: "h-10 rounded-md px-8",
        sm: "h-8 rounded-md px-3 text-xs",
      },
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        fab: "rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground",
        glass: "glass glass-hover text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border border-border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-[0.98]",
        tabs:
          "rounded-full border border-border/40 bg-background/40 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-md transition-all duration-200 hover:bg-accent/60 hover:text-accent-foreground data-[active=true]:bg-accent/80 data-[active=true]:text-accent-foreground data-[active=true]:border-border/60",
        toggle:
          "rounded-full border border-border/60 bg-background/60 px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-md hover:bg-accent/50 hover:text-accent-foreground hover:border-border active:scale-[0.95]",
      },
    },
  },
);
