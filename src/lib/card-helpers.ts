import { cva } from "class-variance-authority";

export const cardVariants = cva(
  "group/card relative flex w-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card/50 p-5 text-left backdrop-blur-md transition-all duration-300 sm:p-6",
  {
    defaultVariants: {
      interactive: false,
      variant: "default",
    },
    variants: {
      interactive: {
        false: "",
        true: "cursor-pointer hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/70 hover:shadow-xl hover:shadow-primary/5",
      },
      variant: {
        default: "",
        ghost: "border-foreground/5 bg-transparent shadow-none hover:border-foreground/15",
        glass: "glass text-foreground border-white/10",
        outline: "border-2 border-foreground/10 bg-transparent hover:border-primary/20",
      },
    },
  },
);

export interface CardData {
  align?: "center" | "start";
  animate?: boolean;
  date?: Date;
  delay?: number;
  description?: string;
  footerMeta?: string;
  icon?: string;
  image?: ImageMetadata | string;
  meta?: string;
  subtitle?: string;
  tags?: string[];
  title?: string;
  url?: string;
}
