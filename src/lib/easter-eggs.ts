export const initEasterEggs = () => {
  // 1. Console ASCII Art
  const ascii = `
   _____ __                             
  / ___// /____ _   ______ _____  ____ 
  \__ \/ __/ _ \ | / / __ \`/ __ \/ __ \
 ___/ / /_/  __/ |/ / /_/ / / / / / / /
/____/\__/\___/|___/\__,_/_/ /_/_/ /_/ 
                                       
  > ARCHITECTING RESILIENT SYSTEMS
  > hire-me@stevanpavlovic.com
  `;
  console.log(`%c${ascii}`, "color: #3b82f6; font-weight: bold;");

  // 2. Konami Code
  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let index = 0;

  window.addEventListener("keydown", (e) => {
    if (e.key === konami[index]) {
      index++;
      if (index === konami.length) {
        triggerMatrix();
        index = 0;
      }
    } else {
      index = 0;
    }
  });

  const triggerMatrix = () => {
    document.documentElement.classList.toggle("cyberpunk-mode");
    const msg = document.createElement("div");
    msg.className = "fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 text-primary font-mono text-xl animate-pulse pointer-events-none";
    msg.innerText = "SYSTEM_OVERRIDE: CYBERPUNK_MODE_ENABLED";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  };

  // 3. Magnetic Hover Effect
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    
    el.addEventListener("mousemove", (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (clientX - (left + width / 2)) * 0.35;
      const y = (clientY - (top + height / 2)) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0px, 0px)";
    });
  });
};
