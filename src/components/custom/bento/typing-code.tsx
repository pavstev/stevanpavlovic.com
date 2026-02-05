"use client";

import { type FC, useEffect, useRef, useState } from "react";

export const TypingCodeFeature: FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect((): void | VoidFunction => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(
        () => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex((prev) => prev + 1);

          if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
          }
        },
        Math.random() * 30 + 10
      );

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  useEffect((): void | VoidFunction => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div className="relative mt-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="text-xs text-neutral-500 dark:text-neutral-400">server.ts</div>
      </div>
      <div
        className="h-[150px] overflow-y-auto rounded-xl bg-neutral-900 p-3 font-mono text-xs text-neutral-100 dark:bg-black/60"
        ref={terminalRef}
      >
        <pre className="whitespace-pre-wrap">
          {displayedText}
          <span className="animate-pulse">|</span>
        </pre>
      </div>
    </div>
  );
};
