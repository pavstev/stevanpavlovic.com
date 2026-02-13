import { cn } from "@components/lib/utils";

type FullWidthDividerProps = React.ComponentProps<"div"> & {
  contained?: boolean;
  position?: "bottom" | "top";
};

export const FullWidthDivider = ({
  className,
  contained = false,
  position,
  ...props
}: FullWidthDividerProps) => (
  <div
    aria-hidden="true"
    className={cn(
      "pointer-events-none absolute h-px bg-border",
      // full-bleed (default)
      "data-[contained=false]:left-1/2 data-[contained=false]:w-screen data-[contained=false]:-translate-x-1/2",
      // contained
      "data-[contained=true]:inset-x-0 data-[contained=true]:w-full",
      // position
      position && "data-[position=bottom]:-bottom-px data-[position=top]:-top-px",
      className
    )}
    data-contained={contained}
    data-position={position}
    {...props}
  />
);
