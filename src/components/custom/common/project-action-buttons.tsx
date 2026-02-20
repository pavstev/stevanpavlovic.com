import type { FC } from "react";

import { buttonVariants } from "@components/ui/button";
import { Icon } from "@components/ui/icon";

interface ProjectActionButtonsProps {
  demoUrl?: string;
  repoUrl?: string;
}

export const ProjectActionButtons: FC<ProjectActionButtonsProps> = ({ demoUrl, repoUrl }) => (
  <div className="mt-4 flex flex-wrap gap-4">
    {demoUrl && (
      <a
        className={buttonVariants({ className: "gap-2 rounded-full" })}
        href={demoUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        Live Demo
        <Icon className="size-4" name="mdi:open-in-new" />
      </a>
    )}
    {repoUrl && (
      <a
        className={buttonVariants({ className: "gap-2 rounded-full", variant: "outline" })}
        href={repoUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        View Code
        <Icon className="size-4" name="mdi:github" />
      </a>
    )}
  </div>
);
