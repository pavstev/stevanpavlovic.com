import { PROFILE } from "../config";

/**
 * Generates the copyright text with the current year
 */
export const getCopyrightText = (): string =>
  `© ${String(new Date().getFullYear())} ${PROFILE.name}. All rights reserved.`;
