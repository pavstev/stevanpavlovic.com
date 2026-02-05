import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-300 ease-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none ring-offset-background",
  {
    compoundVariants: [
      {
        class: "h-auto px-0 py-0 rounded-none",
        size: ["default", "sm", "lg", "xl", "icon"],
        variant: ["link", "primary", "muted", "back", "nav", "unstyled"],
      },
    ],
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-5 py-2 rounded-xl text-sm",
        icon: "size-10 rounded-xl",
        lg: "h-12 px-8 rounded-2xl text-base",
        none: "",
        sm: "h-9 px-4 rounded-lg text-xs",
        xl: "h-14 px-10 rounded-2xl text-lg",
      },
      variant: {
        // Alphabetical order for lint
        accent:
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:shadow-glow-accent hover:-translate-y-0.5 active:scale-95",
        back: "text-sm text-muted-foreground no-underline hover:text-foreground",
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-glow-primary hover:-translate-y-0.5 active:scale-95",
        fab:
          "fixed bottom-6 right-6 size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-glow-primary hover:-translate-y-1 active:scale-95 z-50",
        ghost:
          "text-muted-foreground hover:bg-foreground/5 hover:text-foreground active:scale-95",
        glass:
          "glass border border-foreground/10 text-foreground hover:bg-foreground/10 hover:border-foreground/30 hover:shadow-glow-subtle active:scale-95",
        link: "text-foreground underline-offset-4 hover:underline",
        muted: "text-muted-foreground/80 no-underline hover:text-muted-foreground",
        nav: "relative py-1 text-sm transition-colors duration-200",
        outline:
          "border border-foreground/15 bg-transparent shadow-sm hover:bg-foreground/5 hover:text-foreground hover:border-foreground/30 active:scale-95",
        primary: "text-primary underline-offset-4 hover:underline",
        secondary:
          "bg-primary/10 text-primary shadow-sm hover:bg-primary/20 hover:shadow-glow-primary/10 active:scale-95",
        subtle:
          "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground active:scale-95",
        tabs:
          "relative h-9 rounded-lg px-4 text-sm transition-all hover:bg-muted/50 data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm",
        unstyled: "",
      },
    },
  },
);
