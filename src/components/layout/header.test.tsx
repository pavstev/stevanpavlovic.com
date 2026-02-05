import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Header } from "./header";

vi.mock("@client/hooks/use-scroll", () => ({
  useScroll: vi.fn(() => false),
}));

vi.mock("../custom/shared/hooks", () => ({
  useCurrentPath: vi.fn(() => "/"),
  useIsActive: vi.fn(() => false),
}));

vi.mock("@client/navigation-progress", () => ({
  initNavigationProgress: vi.fn(),
}));

vi.mock("./mobile-nav", () => ({
  MobileNav: vi.fn(() => <div data-testid="mobile-nav" />),
}));

describe("Header", () => {
  it("renders the logo link", () => {
    render(<Header />);
    const logoLink = screen.getByRole("link", { name: /logo/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
  });

  it("renders navigation items", () => {
    render(<Header />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
  });
});
