import { type ConsolaInstance, createConsola } from "consola";

export const createLogger = (tag: string): ConsolaInstance =>
  createConsola({
    formatOptions: {
      colors: true,
      columns: 80,
      compact: false,
      date: false,
    },
    level: 3,
  }).withTag(tag);
