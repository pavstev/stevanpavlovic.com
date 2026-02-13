import type React from "react";

import { cn } from "@client/utils";

export const LogoIcon = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6 10C6 7.79086 7.79086 6 10 6H16C18.2091 6 20 7.79086 20 10V13H13C10.7909 13 9 14.7909 9 17V26"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
    <path
      d="M26 22C26 24.2091 24.2091 26 22 26H16V16H22C24.2091 16 26 17.7909 26 20V22Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
    />
  </svg>
);

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn("flex items-center gap-2 text-xl font-bold tracking-tight", className)}
    {...props}
  >
    <LogoIcon className="size-6" />
    <span>Stevan Pavlovic</span>
  </div>
);
