import React from "react";

const MagnifyOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
    <div className="flex scale-0 flex-col items-center gap-3 transition-all duration-300 group-hover:scale-100">
      {/* Icon Circle */}
      <div className="flex size-20 items-center justify-center rounded-full bg-accent shadow-[0_0_24px_rgba(var(--color-accent-rgb),0.6)] ring-2 ring-accent/40 ring-offset-2 ring-offset-black/50 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_32px_rgba(var(--color-accent-rgb),0.8)]">
        <svg className="size-10 text-accent-foreground" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 8v6M8 11h6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Label */}
      <div className="rounded-full bg-accent/90 px-4 py-1.5 shadow-lg backdrop-blur-sm">
        <span className="text-sm font-semibold tracking-wide text-accent-foreground">
            Enlarge
        </span>
      </div>
    </div>
  </div>
);

export default MagnifyOverlay;
