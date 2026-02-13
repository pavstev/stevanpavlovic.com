import { Button } from "@components/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@components/components/ui/empty";
import { CompassIcon, HomeIcon } from "lucide-react";

export const NotFoundPage = () => (
  <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
    <Empty>
      <EmptyHeader>
        <EmptyTitle className="mask-b-from-20% mask-b-to-80% text-9xl font-extrabold">
          404
        </EmptyTitle>
        <EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
          The page you're looking for might have been <br />
          moved or doesn't exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button asChild>
            <a href="#">
              <HomeIcon data-icon="inline-start" />
              Go Home
            </a>
          </Button>

          <Button asChild variant="outline">
            <a href="#">
              <CompassIcon data-icon="inline-start" /> Explore
            </a>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  </div>
);
