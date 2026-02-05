import React, { useEffect, useRef, useState } from "react";

import { cn } from "../../lib/cn";

interface ModalProps {
  bodyClass?: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  description?: string;
  dialogClass?: string;
  onClose: () => void;
  open: boolean;
  showCloseButton?: boolean;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({
  bodyClass,
  caption,
  children,
  className,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  description,
  dialogClass,
  onClose,
  open,
  showCloseButton = true,
  title,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  // Handle scroll locking with smooth transition
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${String(scrollbarWidth)}px`;
      }
      return;
    }
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";

    return (): void => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && closeOnEscape && open) {
        handleClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return (): void => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, closeOnEscape]);

  // Smooth close with animation
  const handleClose = (): void => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 250);
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent): void => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      handleClose();
    }
  };

  // Show modal when open prop changes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open) {
      dialog.showModal();
      return;
    }
    dialog.close();
  }, [open]);

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <dialog
      aria-describedby={description ? `${title?.toLowerCase().replace(/\s+/g, "-") ?? ""}-description` : undefined}
      aria-labelledby={title ? `${title.toLowerCase().replace(/\s+/g, "-")}-title` : undefined}
      aria-modal="true"
      className={cn(
        "m-auto overflow-visible border-none bg-transparent p-0 outline-none backdrop:bg-background/90 backdrop:backdrop-blur-xl",
        dialogClass,
      )}
      onClick={handleBackdropClick}
      onKeyDown={(e): void => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
      ref={dialogRef}
    >
      <div
        className={cn(
          "glass-strong relative flex flex-col rounded-3xl border border-foreground/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/10 transition-all duration-300",
          "max-h-[90vh] w-full max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl",
          isClosing && "scale-95 opacity-0",
          className,
        )}
      >
        {/* Optional Header */}
        {(title || description) && (
          <div className="flex flex-col gap-2 border-b border-foreground/5 bg-linear-to-b from-foreground/5 to-transparent p-6 pb-5">
            {title && (
              <h2
                className="text-2xl font-bold tracking-tight text-foreground"
                id={`${title.toLowerCase().replace(/\s+/g, "-")}-title`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className="max-w-[90%] text-sm leading-relaxed text-muted-foreground"
                id={`${title?.toLowerCase().replace(/\s+/g, "-") ?? ""}-description`}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            aria-label="Close modal"
            className="absolute -top-3 -right-3 z-50 flex size-12 items-center justify-center rounded-full border-2 border-foreground/20 bg-background/98 text-foreground shadow-xl backdrop-blur-md transition-all duration-200 hover:scale-110 hover:rotate-90 hover:border-primary/70 hover:bg-primary/15 hover:text-primary hover:shadow-2xl focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
            onClick={handleClose}
            type="button"
          >
            <svg className="size-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Scrollable Content Body */}
        <div className={cn("scrollbar-thin flex-1 overflow-y-auto p-6", bodyClass)}>
          {children}
        </div>

        {/* Caption */}
        {caption && (
          <div className="border-t border-foreground/5 bg-linear-to-t from-foreground/5 to-transparent px-6 py-4">
            <p className="text-center text-sm text-muted-foreground italic">{caption}</p>
          </div>
        )}

        {/* Subtle bottom fade for long content */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-16 w-full rounded-b-3xl bg-linear-to-t from-background/40 to-transparent" />
      </div>

      <style>{`
        dialog {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          max-width: none;
          max-height: none;
          background: transparent;
          padding: 1rem;
        }

        dialog:not([open]) {
          display: none;
        }

        dialog::backdrop {
          background: color-mix(in srgb, var(--color-background), transparent 10%);
          backdrop-filter: blur(12px) saturate(1.2);
          opacity: 0;
        }

        dialog[open] {
          animation: modal-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        dialog[open]::backdrop {
          animation: backdrop-enter 0.35s ease-out forwards;
        }

        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes backdrop-enter {
          to {
            opacity: 1;
          }
        }

        /* Custom scrollbar for modal content */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--color-foreground), transparent 80%);
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--color-foreground), transparent 70%);
        }

      `}</style>
    </dialog>
  );
};

export default Modal;
