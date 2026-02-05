import React from "react";

const MagnifyOverlay: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-500 ease-out group-hover:bg-black/40">
    <div className="flex scale-90 flex-col items-center gap-2 opacity-0 transition-all duration-500 ease-out group-hover:scale-100 group-hover:opacity-100">
      {/* Icon with Label */}
      <div className="flex items-center gap-2 rounded-full bg-accent/95 px-4 py-2.5 shadow-[0_8px_24px_rgba(var(--color-accent-rgb),0.4)] backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_32px_rgba(var(--color-accent-rgb),0.6)]">
        <svg className="size-5 text-accent-foreground" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-semibold text-accent-foreground">
            Enlarge
        </span>
      </div>
    </div>
  </div>
);

export default MagnifyOverlay;
