import type { FC, JSX, ReactNode } from "react";

import { cn } from "@client/utils";
import { HyperText } from "@components/ui/hyper-text";
import { motion } from "motion/react";

interface PageHeaderProps {
  align?: "center" | "left";
  children?: ReactNode;
  className?: string;
  description?: string;
  title: string;
  topContent?: ReactNode;
}

export const PageHeader: FC<PageHeaderProps> = ({
  align = "center",
  children,
  className,
  description,
  title,
  topContent,
}): JSX.Element => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex flex-col gap-4",
      align === "center" ? "items-center text-center" : "items-start text-left",
      className
    )}
    initial={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5 }}
  >
    {topContent}

    <HyperText
      animateOnHover={true}
      className="text-4xl font-bold tracking-tight md:text-5xl"
      duration={1200}
      startOnView={true}
    >
      {title}
    </HyperText>

    {description && (
      <motion.p
        animate={{ opacity: 1 }}
        className="text-muted-foreground max-w-4xl text-balance"
        initial={{ opacity: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {description}
      </motion.p>
    )}

    {children && (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="w-full"
        initial={{ opacity: 0, scale: 0.98 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        {children}
      </motion.div>
    )}
  </motion.div>
);