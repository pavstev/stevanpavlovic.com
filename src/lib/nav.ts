export const isActivePath = (currentPath: string, href: string): boolean => {
  if (href === "/") {
    return currentPath === "/";
  }
  const cleanPath = currentPath.replace(/\/$/, "");
  const cleanHref = href.replace(/\/$/, "");
  return cleanPath.startsWith(cleanHref);
};
