const animateValue = (
  obj: HTMLElement,
  start: number,
  end: number,
  duration: number,
  decimalPlaces: number
): void => {
  let startTimestamp: null | number = null;
  const step = (timestamp: number): void => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = start + (end - start) * easeProgress;
    obj.textContent = current.toFixed(decimalPlaces);

    if (progress < 1) {
      window.requestAnimationFrame(step);
      return;
    }

    obj.textContent = end.toFixed(decimalPlaces);
  };
  window.requestAnimationFrame(step);
};

export const initTickers = (): void => {
  const tickers = document.querySelectorAll<HTMLElement>("[data-ticker]");
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const val = parseFloat(el.dataset.value ?? "0");
          const startVal = parseFloat(el.dataset.startValue ?? "0");
          const dir = el.dataset.direction ?? "up";
          const delayMs = parseFloat(el.dataset.delay ?? "0") * 1000;
          const decimals = parseInt(el.dataset.decimalPlaces ?? "0", 10);
          const start = dir === "down" ? val : startVal;
          const end = dir === "down" ? startVal : val;

          setTimeout(() => {
            animateValue(el, start, end, 2000, decimals);
          }, delayMs);
          observer.unobserve(el);
        }
      }
    },
    { threshold: 0.1 }
  );

  for (const t of tickers) {
    observer.observe(t);
  }
};
