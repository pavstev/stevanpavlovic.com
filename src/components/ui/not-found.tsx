import { cn } from "@client/utils";
import { Button } from "@components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@components/ui/empty";
import { CompassIcon, HomeIcon } from "lucide-react";

export interface ErrorPageProps {
  children?: React.ReactNode;
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
}: ErrorPageProps) => (
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
        {title && <h2 className="text-xl font-bold">{title}</h2>}
        <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {children || (
          <div className="flex gap-2">
            <Button asChild>
              <a href="/">
                <HomeIcon className="mr-2" data-icon="inline-start" />
                Go Home
              </a>
            </Button>

            <Button asChild variant="outline">
              <a href="/projects">
                <CompassIcon className="mr-2" data-icon="inline-start" /> Explore
              </a>
            </Button>
          </div>
        )}
      </EmptyContent>
    </Empty>
  </div>
);

export const NotFoundPage = () => <ErrorPage />;
