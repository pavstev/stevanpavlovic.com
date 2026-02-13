import { cn } from "@client/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { MagicCard } from "@components/ui/magic-card";

interface ContentCardProps {
  className?: string;
  date?: Date;
  description?: string;
  href: string;
  image?: string;
  tags?: (string | { id: string; label?: string })[];
  title: string;
}

export const ContentCard = ({
  className,
  date,
  description,
  href,
  image,
  tags,
  title,
}: ContentCardProps) => (
  <a className={cn("group block h-full outline-none", className)} href={href}>
    <MagicCard
      className="flex h-full flex-col gap-6 overflow-hidden border-transparent shadow-sm transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-primary hover:shadow-md"
      gradientColor="#D9D9D955"
      gradientSize={250}
    >
      {image && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            alt={title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            src={image}
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
          {title}
        </CardTitle>
        {date && (
          <div className="text-xs text-muted-foreground">
            {date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <CardDescription className="line-clamp-3">{description}</CardDescription>
      </CardContent>
      {tags && tags.length > 0 && (
        <CardFooter className="mt-auto flex flex-wrap gap-2 pt-0 text-sm">
          {" "}
          {/* Added mt-auto to push footer to bottom */}
          {tags.slice(0, 3).map((tag) => {
            const label = typeof tag === "string" ? tag : (tag.label ?? tag.id);
            return (
              <span
                className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-secondary-foreground/10 ring-inset"
                key={typeof tag === "string" ? tag : tag.id}
              >
                {label}
              </span>
            );
          })}
        </CardFooter>
      )}
    </MagicCard>
  </a>
);
