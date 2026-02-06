import type React from "react";

import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";

import { cn } from "../../lib/cn";

interface ModalProps {
  caption?: React.ReactNode;
  captionPosition?: "bottom" | "top";
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
  open: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  caption,
  captionPosition: _captionPosition = "bottom",
  children,
  className,
  onClose,
  open,
  showCloseButton = true,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync the 'open' prop with the native <dialog> API
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    }

    if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    // Cleanup on unmount
    return (): void => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle native "Escape" key behavior
  const handleCancel = (e: React.SyntheticEvent): void => {
    e.preventDefault();
    onClose();
  };

  // Handle clicking the backdrop to close
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>): void => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      className={cn(
        "m-auto bg-transparent p-0 focus:outline-none",
        "backdrop:bg-background/80 backdrop:backdrop-blur-xl",
        "open:animate-in open:fade-in open:zoom-in-95 open:duration-300",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-br before:from-primary/30 before:via-accent/20 before:to-secondary/30 before:opacity-20 before:blur-3xl before:grayscale",
      )}
      onCancel={handleCancel}
      onClick={handleClick}
      ref={dialogRef}
    >
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl border border-foreground/5 bg-card shadow-2xl backdrop-blur-sm",
          "hover:shadow-3xl transition-all duration-300",
          "before:absolute before:-inset-1 before:-z-10 before:rounded-2xl before:bg-linear-to-br before:from-primary/20 before:via-accent/10 before:to-secondary/20 before:opacity-5 before:blur-3xl before:grayscale",
          className,
        )}
      >
        <div className="absolute inset-0 rounded-2xl bg-card/50 backdrop-blur-sm"></div>
        <div className="relative z-10 p-6">
          {showCloseButton && (
            <button
              aria-label="Close"
              className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-all duration-300 hover:scale-105 hover:bg-foreground/10 hover:text-foreground hover:shadow-lg focus:scale-105 focus:ring-2 focus:ring-foreground/20 focus:outline-none active:scale-95 active:shadow-md"
              onClick={onClose}
              type="button"
            >
              <Icon
                className="hover:scale-1.1 size-5 transition-all duration-300 hover:rotate-90"
                icon="mdi:close-thick"
              />
            </button>
          )}

          {children}

          {caption && (
            <div className="mt-4 border-t border-foreground/10 pt-4">
              <div className="text-sm leading-relaxed text-muted-foreground">{caption}</div>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
