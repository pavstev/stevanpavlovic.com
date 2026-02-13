import * as React from "react";
import { cn } from "@client/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@components/ui/navigation-menu";
import { NAV_ITEMS_ARRAY } from "../../config";

export function MainNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {NAV_ITEMS_ARRAY.map((item) => (
          <NavigationMenuItem key={item.label}>
            {item.label === "Blog" || item.label === "Projects" ? (
              <>
                <NavigationMenuTrigger className="bg-transparent">{item.label}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href={item.href}
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            {item.label}
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            {item.description}
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    {/* Placeholder for sub-items if we had them. For now just linking to main page */}
                     <ListItem href={item.href} title={`All ${item.label}`}>
                        View all {item.label.toLowerCase()}
                     </ListItem>
                  </ul>
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <a
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10 focus:text-accent-foreground"
                  )}
                  href={item.href}
                >
                  {item.label}
                </a>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
