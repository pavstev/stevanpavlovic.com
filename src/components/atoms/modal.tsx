import React, { useEffect, useRef } from "react";

import { cn } from "../../lib/cn";

interface ModalProps {
  bodyClass?: string;
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

  // Handle scroll locking
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
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
    }

    return (): void => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent): void => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
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
        "m-auto overflow-visible border-none bg-transparent p-0 outline-none backdrop:bg-black/80 backdrop:backdrop-blur-md",
        dialogClass,
      )}
      onClick={handleBackdropClick}
      onKeyDown={(e): void => {
        if (e.key === "Escape") {
          onClose();
        }
      }}
      ref={dialogRef}
    >
      <div
        className={cn(
          "glass-strong relative flex flex-col rounded-3xl border border-white/10 shadow-2xl transition-all duration-500",
          "max-h-[85vh] w-full max-w-[calc(100vw-2rem)] sm:max-w-lg md:max-w-xl",
          className,
        )}
      >
        {/* Optional Header */}
        {(title || description) && (
          <div className="flex flex-col gap-1.5 border-b border-white/5 p-6 pb-4">
            {title && (
              <h2
                className="text-xl font-bold tracking-tight text-foreground"
                id={`${title.toLowerCase().replace(/\s+/g, "-")}-title`}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className="max-w-[90%] text-xs text-muted-foreground"
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
            className="absolute top-4 right-4 z-50 flex size-10 items-center justify-center rounded-full bg-white/10 text-muted-foreground transition-all hover:scale-110 hover:bg-white/20 hover:text-foreground focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
            onClick={onClose}
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Scrollable Content Body */}
        <div className={cn("scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 overflow-y-auto p-6", bodyClass)}>
          {children}
        </div>

        {/* Subtle bottom fade for long content */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-linear-to-t from-black/20 to-transparent" />
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
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          opacity: 0;
        }

        dialog[open] {
          animation: modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        dialog[open]::backdrop {
          animation: backdrop-enter 0.4s ease-out forwards;
        }

        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
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

        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
      `}</style>
    </dialog>
  );
};

export default Modal;
