import { PROFILE } from "../config";

export const getCopyrightText = (): string =>
  `© ${String(new Date().getFullYear())} ${PROFILE.name}. All rights reserved.`;
