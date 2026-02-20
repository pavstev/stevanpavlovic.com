"use client";

import type { FC, MouseEventHandler } from "react";

import { cn } from "@client/utils";
import { Icon } from "@components/ui/icon";
import { motion, useMotionValue, useTransform } from "framer-motion";

import type { BentoItem } from "./bento-types";

import { fadeInUp } from "../shared/animations";
import { ChartAnimation } from "./chart";
import { CounterAnimation } from "./counter";
import { IconsFeature } from "./icons";
import { MetricsFeature } from "./metrics";
import { SpotlightFeature } from "./spotlight";
import { TimelineFeature } from "./timeline";
import { TypingCodeFeature } from "./typing-code";

export const BentoCard: FC<{ item: BentoItem }> = ({ item }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]);
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct * 100);
    y.set(yPct * 100);
  };

  const handleMouseLeave = (): void => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="h-full"
      onHoverEnd={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      transition={{ damping: 20, stiffness: 300, type: "spring" }}
      variants={fadeInUp}
      whileHover={{ y: -5 }}
    >
      <a
        aria-label={`${item.title} - ${item.description}`}
        className={cn(
          "group border-border/50 bg-card dark:bg-card/40 relative flex h-full flex-col overflow-hidden rounded-2xl border p-0 shadow-sm transition-all duration-500 ease-out hover:shadow-xl",
          item.className
        )}
        href={item.href ?? "#"}
        tabIndex={0}
      >
        {!!item.image && (
          <div className="bg-muted aspect-video w-full overflow-hidden">
            <img
              alt={item.title}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              src={item.image}
            />
          </div>
        )}

        <div className="relative z-10 flex flex-1 flex-col gap-3 p-6">
          <div className="flex flex-1 flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {item.icon && !item.image && (
                  <div className="bg-primary/5 group-hover:bg-primary/10 flex size-10 items-center justify-center rounded-xl p-2 backdrop-blur-sm transition-colors">
                    <Icon className="text-primary size-full" name={item.icon} />
                  </div>
                )}
                <h3 className="text-foreground line-clamp-1 text-xl font-bold tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>

            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              {item.description}
            </p>

            {!item.image && (
              <>
                {item.feature === "custom" && item.content}

                {item.feature === "spotlight" && item.spotlightItems && (
                  <div className="mt-2">
                    <SpotlightFeature icon={item.icon} items={item.spotlightItems} />
                  </div>
                )}

                {item.feature === "counter" && item.statistic && (
                  <div className="mt-auto pt-4">
                    <p className="text-muted-foreground mb-1 text-[10px] font-bold tracking-wider uppercase">
                      {item.statistic.label}
                    </p>
                    <CounterAnimation
                      end={item.statistic.end || 0}
                      start={item.statistic.start || 0}
                      suffix={item.statistic.suffix}
                    />
                  </div>
                )}

                {item.feature === "chart" && item.statistic && (
                  <div className="mt-auto pt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                        {item.statistic.label}
                      </span>
                      <span className="text-foreground text-sm font-bold">
                        {item.statistic.end}
                        {item.statistic.suffix}
                      </span>
                    </div>
                    <ChartAnimation value={item.statistic.end || 0} />
                  </div>
                )}

                {item.feature === "icons" && item.featureIcons && (
                  <div className="mt-4">
                    <IconsFeature icons={item.featureIcons} />
                  </div>
                )}

                {item.feature === "timeline" && item.timeline && (
                  <div className="mt-2">
                    <TimelineFeature timeline={item.timeline} />
                  </div>
                )}

                {item.feature === "typing" && item.typingText && (
                  <div className="mt-2">
                    <TypingCodeFeature text={item.typingText} />
                  </div>
                )}

                {item.feature === "metrics" && item.metrics && (
                  <div className="mt-2 text-left">
                    <MetricsFeature metrics={item.metrics} />
                  </div>
                )}
              </>
            )}

            {item.tags && item.tags.length > 0 && (
              <div
                className={cn(
                  "mt-4",
                  item.tagsVariant === "list" ? "flex flex-wrap" : "flex flex-wrap gap-2"
                )}
              >
                {item.tagsVariant === "list" ? (
                  <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400">
                    {item.tags.join(", ")}
                  </span>
                ) : (
                  item.tags.slice(0, 3).map((tag) => (
                    <span
                      className="bg-secondary/50 text-secondary-foreground inline-flex items-center rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            )}

            {item.cta && (
              <div className="mt-auto pt-6">
                <span className="text-primary inline-flex items-center text-sm font-bold transition-all group-hover:gap-2">
                  {item.cta}
                  <Icon
                    className="ml-1 size-4 transition-transform group-hover:translate-x-1"
                    name="mdi:arrow-right"
                  />
                </span>
              </div>
            )}
          </div>
        </div>
      </a>
    </motion.div>
  );
};
