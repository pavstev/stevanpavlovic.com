import { themeStore } from "@client/store";
import { cn } from "@client/utils";
import { MagicCard } from "@components/common/magic-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { useStore } from "@nanostores/react";

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
}: ContentCardProps): React.JSX.Element => {
  const theme = useStore(themeStore);

  return (
    <a className={cn("group block h-full outline-none", className)} href={href}>
      <Card className="h-full border-none p-0 shadow-none">
        <MagicCard
          className="flex h-full flex-col overflow-hidden"
          gradientColor={theme === "dark" ? "#262626" : "#D9D9D955"}
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
          <CardHeader className="p-4">
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
          <CardContent className="p-4 pt-0">
            <CardDescription className="line-clamp-3">{description}</CardDescription>
          </CardContent>
          {tags && tags.length > 0 && (
            <CardFooter className="mt-auto flex flex-wrap gap-2 p-4 pt-0 text-sm">
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
      </Card>
    </a>
  );
};
