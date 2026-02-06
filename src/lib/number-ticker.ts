function animateValue(
  obj: HTMLElement,
  start: number,
  end: number,
  duration: number,
  decimalPlaces: number,
) {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    // Ease out expo
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

    const current = start + (end - start) * easeProgress;
    obj.textContent = current.toFixed(decimalPlaces);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.textContent = end.toFixed(decimalPlaces);
    }
  };
  window.requestAnimationFrame(step);
}

export function initTicker() {
  const tickers = document.querySelectorAll("#number-ticker");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const value = parseFloat(el.dataset.value || "0");
          const startValue = parseFloat(el.dataset.startValue || "0");
          const direction = el.dataset.direction || "up";
          const delay = parseFloat(el.dataset.delay || "0") * 1000;
          const decimalPlaces = parseInt(el.dataset.decimalPlaces || "0");

          const start = direction === "down" ? value : startValue;
          const end = direction === "down" ? startValue : value;

          setTimeout(() => {
            animateValue(el, start, end, 2000, decimalPlaces); // Duration fixed or calculated? using 2s defaults
          }, delay);

          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1 },
  );

  tickers.forEach((ticker) => observer.observe(ticker));
}
