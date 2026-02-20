import type { FC } from "react";

import { Badge } from "@components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Icon } from "@components/ui/icon";

interface InfoCardItem {
  icon?: string;
  label?: string;
  value?: string;
}

interface InfoCardProps {
  className?: string;
  description?: string;
  items?: InfoCardItem[];
  tags?: {
    items: {
      icon?: string;
      id: string;
      label?: string;
    }[];
    title?: string;
  };
  title: string;
}

export const InfoCard: FC<InfoCardProps> = ({ className, items, tags, title }) => (
  <Card className={className}>
    <CardHeader className="p-5 pb-0">
      <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4 p-5 text-sm">
      {items && items.length > 0 && (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index}>
              {item.label && (
                <p className="text-muted-foreground text-xs uppercase">{item.label}</p>
              )}
              <p className="text-foreground flex items-center gap-1.5 font-medium">
                {item.icon && <Icon className="size-3.5" name={item.icon} />}
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {tags && tags.items.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.items.map((tag) => (
            <a className="block no-underline" href={`/tags/${tag.id}`} key={tag.id}>
              <Badge
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 justify-start gap-1.5 rounded-md pl-1.5 font-normal"
                variant="secondary"
              >
                {tag.icon && <Icon className="text-foreground size-3.5" name={tag.icon} />}
                {tag.label || tag.id}
              </Badge>
            </a>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);