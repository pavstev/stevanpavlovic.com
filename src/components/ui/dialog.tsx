import { cn } from "@client/utils";
import { Button } from "@components/ui/button";
import { Icon } from "@components/ui/icon";
import { Dialog as DialogPrimitive } from "radix-ui";
import { type ComponentProps, type FC, type JSX } from "react";

export const Dialog: FC<ComponentProps<typeof DialogPrimitive.Root>> = ({ ...props }) => (
  <DialogPrimitive.Root data-slot="dialog" {...props} />
);

export const DialogTrigger = ({
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>): JSX.Element => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
);

const DialogPortal: FC<ComponentProps<typeof DialogPrimitive.Portal>> = ({ ...props }) => (
  <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
);

const DialogClose: FC<ComponentProps<typeof DialogPrimitive.Close>> = ({ ...props }) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
);

const DialogOverlay = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Overlay>): JSX.Element => (
  <DialogPrimitive.Overlay
    className={cn(
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className
    )}
    data-slot="dialog-overlay"
    {...props}
  />
);

export const DialogContent = ({
  children,
  className,
  showCloseButton = true,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}): JSX.Element => (
  <DialogPortal data-slot="dialog-portal">
    <DialogOverlay />
    <DialogPrimitive.Content
      className={cn(
        "bg-background data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-2xl",
        className
      )}
      data-slot="dialog-content"
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          data-slot="dialog-close"
        >
          <Icon name="mdi:close" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
);

export const DialogHeader: FC<ComponentProps<"div">> = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    data-slot="dialog-header"
    {...props}
  />
);

const DialogFooter = ({
  children,
  className,
  showCloseButton = false,
  ...props
}: ComponentProps<"div"> & {
  showCloseButton?: boolean;
}): JSX.Element => (
  <div
    className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
    data-slot="dialog-footer"
    {...props}
  >
    {children}
    {showCloseButton && (
      <DialogPrimitive.Close asChild>
        <Button variant="outline">Close</Button>
      </DialogPrimitive.Close>
    )}
  </div>
);

export const DialogTitle = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>): JSX.Element => (
  <DialogPrimitive.Title
    className={cn("text-lg leading-none font-semibold", className)}
    data-slot="dialog-title"
    {...props}
  />
);

export const DialogDescription = ({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>): JSX.Element => (
  <DialogPrimitive.Description
    className={cn("text-muted-foreground text-sm", className)}
    data-slot="dialog-description"
    {...props}
  />
);
