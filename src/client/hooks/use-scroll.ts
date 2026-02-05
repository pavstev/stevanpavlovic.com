"use client";
import { useEffect, useState } from "react";

export const useScroll = (downThreshold: number, upThreshold?: number): boolean => {
  const [scrolled, setScrolled] = useState(false);
  const scrollUpThreshold = upThreshold ?? downThreshold / 2;

  useEffect((): void | VoidFunction => {
    const handleScroll = (): void => {
      const y = window.scrollY;

      setScrolled((prev) => {
        if (prev) {
          return y > scrollUpThreshold;
        }

        return y > downThreshold;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return (): void => window.removeEventListener("scroll", handleScroll);
  }, [downThreshold, scrollUpThreshold]);

  return scrolled;
};
