import { cn } from "@client/utils";
import { type ComponentProps, type FC } from "react";

import rawSvg from "../../assets/logo.svg?raw";
import { fullName } from "../../constants";

type LogoProps = ComponentProps<"div">;

export const Logo: FC<LogoProps> = ({ className, ...props }) => {
  const svg = rawSvg.replace(/stroke="#[^"]+"/g, 'stroke="currentColor"');

  return (
    <div
      className={cn(
        "text-md flex items-center gap-2 font-mono font-bold tracking-tight",
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="size-6 shrink-0 [&_svg]:size-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <span className="truncate">{fullName}</span>
    </div>
  );
};
