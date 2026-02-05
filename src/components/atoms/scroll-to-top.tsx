import React, { useEffect, useState } from "react";

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;
      const threshold = 200;
      setIsVisible(currentScrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  };

  return (
    <button
      aria-label="Scroll to top"
      className={`group fixed right-20 bottom-4 z-40 flex cursor-pointer items-center gap-1.5 rounded-full bg-foreground/5 px-4 py-2 text-sm font-semibold text-muted-foreground shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-foreground/10 hover:text-foreground hover:shadow-xl ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      }`}
      id="smart-scroll-to-top"
      onClick={scrollToTop}
      type="button"
    >
      TOP
      <svg
        className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
};

export default ScrollToTop;
