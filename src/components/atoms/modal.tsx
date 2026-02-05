import type React from "react";

import { Icon } from "@iconify/react";
import { useEffect, useRef } from "react";

import { cn } from "../../lib/cn";

interface ModalProps {
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
  open: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
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
      )}
      onCancel={handleCancel}
      onClick={handleClick}
      ref={dialogRef}
    >
      <div
        className={cn(
          "relative w-full max-w-lg overflow-hidden rounded-2xl bg-card shadow-2xl",
          className,
        )}
      >
        {showCloseButton && (
          <button
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            onClick={onClose}
            type="button"
          >
            <Icon className="size-5" icon="mdi:close" />
          </button>
        )}

        {children}
      </div>
    </dialog>
  );
};

export default Modal;
