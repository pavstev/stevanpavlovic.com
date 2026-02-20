import type { JSX, ReactNode } from "react";

import { cn } from "@client/utils";
import { Button } from "@components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@components/ui/empty";
import { Icon } from "@components/ui/icon";

interface ErrorPageProps {
  children?: ReactNode;
  className?: string;
  code?: string;
  description?: string;
  title?: string;
}

export const ErrorPage = ({
  children,
  className,
  code = "404",
  description = "The page you're looking for might have been moved or doesn't exist.",
  title = "Page not found",
}: ErrorPageProps): JSX.Element => (
  <div
    className={cn(
      "relative flex min-h-screen w-full items-center justify-center overflow-hidden",
      className
    )}
  >
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
          {code}
        </EmptyTitle>
        {title && <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>}
        <EmptyDescription className="text-muted-foreground max-w-4xl text-balance">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {children || (
          <div className="flex gap-2">
            <Button asChild>
              <a href="/">
                <Icon className="mr-2" data-icon="inline-start" name="mdi:home" />
                Go Home
              </a>
            </Button>

            <Button asChild variant="outline">
              <a href="/projects">
                <Icon className="mr-2" data-icon="inline-start" name="mdi:compass" /> Explore
              </a>
            </Button>
          </div>
        )}
      </EmptyContent>
    </Empty>
  </div>
);