"use client";
import { useEffect, useState } from "react";

export const useScroll = (downThreshold: number, upThreshold?: number): boolean => {
  const [scrolled, setScrolled] = useState(false);
  const scrollUpThreshold = upThreshold ?? downThreshold / 2;

  useEffect(() => {
    const handleScroll = (): void => {
      const y = window.scrollY;
      // Hysteresis: different thresholds for up/down to prevent flickering
      setScrolled((prev) => {
        if (prev) {
          // Currently scrolled - only unscroll when below lower threshold
          return y > scrollUpThreshold;
        }
        // Currently not scrolled - only scroll when above higher threshold
        return y > downThreshold;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return (): void => window.removeEventListener("scroll", handleScroll);
  }, [downThreshold, scrollUpThreshold]);

  return scrolled;
};
