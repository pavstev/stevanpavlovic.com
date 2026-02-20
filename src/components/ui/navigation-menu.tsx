import { cn } from "@client/utils";
import { Icon } from "@components/ui/icon";
import { cva } from "class-variance-authority";
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui";
import { type ComponentProps, type JSX } from "react";

export const NavigationMenu = ({
  children,
  className,
  viewport = true,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  viewport?: boolean;
}): JSX.Element => (
  <NavigationMenuPrimitive.Root
    className={cn(
      "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
      className
    )}
    data-slot="navigation-menu"
    data-viewport={viewport}
    {...props}
  >
    {children}
    {viewport && <NavigationMenuViewport />}
  </NavigationMenuPrimitive.Root>
);

export const NavigationMenuItem = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Item>): JSX.Element => (
  <NavigationMenuPrimitive.Item
    className={cn("relative", className)}
    data-slot="navigation-menu-item"
    {...props}
  />
);

export const NavigationMenuList = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.List>): JSX.Element => (
  <NavigationMenuPrimitive.List
    className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
    data-slot="navigation-menu-list"
    {...props}
  />
);

export const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-[color,box-shadow] outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-accent/50 data-[state=open]:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:focus:bg-accent"
);

const NavigationMenuContent = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Content>): JSX.Element => (
  <NavigationMenuPrimitive.Content
    className={cn(
      "data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion^=from-]:animate-in data-[motion^=from-]:fade-in data-[motion^=to-]:animate-out data-[motion^=to-]:fade-out top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
      "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
      className
    )}
    data-slot="navigation-menu-content"
    {...props}
  />
);

const NavigationMenuIndicator = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Indicator>): JSX.Element => (
  <NavigationMenuPrimitive.Indicator
    className={cn(
      "data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:animate-in data-[state=visible]:fade-in top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
      className
    )}
    data-slot="navigation-menu-indicator"
    {...props}
  >
    <div className="bg-border relative top-[60%] size-2 rotate-45 rounded-tl-sm shadow-md" />
  </NavigationMenuPrimitive.Indicator>
);

export const NavigationMenuLink = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Link>): JSX.Element => (
  <NavigationMenuPrimitive.Link
    className={cn(
      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:hover:bg-accent data-[active=true]:focus:bg-accent [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    data-slot="navigation-menu-link"
    {...props}
  />
);

const NavigationMenuTrigger = ({
  children,
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Trigger>): JSX.Element => (
  <NavigationMenuPrimitive.Trigger
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    data-slot="navigation-menu-trigger"
    {...props}
  >
    {children}{" "}
    <Icon
      aria-hidden="true"
      className="relative top-px ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
      name="mdi:chevron-down"
    />
  </NavigationMenuPrimitive.Trigger>
);

const NavigationMenuViewport = ({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Viewport>): JSX.Element => (
  <div className={cn("absolute top-full left-0 isolate z-50 flex justify-center")}>
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "origin-top-center bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:zoom-in-90 relative mt-1.5 h-(--radix-navigation-menu-viewport-height) w-full overflow-hidden rounded-md border shadow md:w-(--radix-navigation-menu-viewport-width)",
        className
      )}
      data-slot="navigation-menu-viewport"
      {...props}
    />
  </div>
);
