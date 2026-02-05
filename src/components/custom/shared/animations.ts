import type { Variants } from "framer-motion";

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
    y: 0,
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
    x: 0,
  },
};

export const fadeInUpSubtle: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
    y: 0,
  },
};
