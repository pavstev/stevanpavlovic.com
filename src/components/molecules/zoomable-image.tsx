import type { ImageMetadata } from "astro";

import React, { useState } from "react";

import Modal from "../atoms/modal";

interface Props {
  alt: string;
  caption?: string;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  src: ImageMetadata | string;
  width?: number;
}

const ZoomableImage: React.FC<Props> = ({
  alt,
  caption,
  className,
  height,
  loading = "lazy",
  src,
  width,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMagnified, setIsMagnified] = useState(false);

  const imageSrc = typeof src === "string" ? src : src.src;

  return (
    <>
      <div
        className={`group relative block cursor-pointer overflow-hidden transition-all hover:opacity-90 ${className || ""}`}
        onClick={() => { setIsModalOpen(true); }}
        onKeyDown={(e): void => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <img
          alt={alt}
          className="size-full object-cover"
          height={height}
          loading={loading}
          src={imageSrc}
          width={width}
        />
        {/* Magnifying Glass Decoration */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
          <div className="flex size-16 scale-0 items-center justify-center rounded-full bg-primary/90 shadow-lg transition-all duration-300 group-hover:scale-100">
            <svg className="size-8 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <Modal
        bodyClass="p-0 overflow-visible flex items-center justify-center h-full"
        caption={caption}
        className="max-h-[95vh] max-w-[95vw] overflow-visible border-none bg-transparent shadow-none"
        onClose={() => {
          setIsModalOpen(false);
          setIsMagnified(false);
        }}
        open={isModalOpen}
        showCloseButton={true}
      >
        <div
          className={`relative cursor-zoom-${isMagnified ? "out" : "in"} transition-transform duration-300`}
          onClick={() => { setIsMagnified(!isMagnified); }}
          onKeyDown={(e): void => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsMagnified(!isMagnified);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <img
            alt={alt}
            className={`transition-all duration-300 ${
              isMagnified
                ? "max-h-none max-w-none scale-150 cursor-zoom-out"
                : "max-h-[80vh] max-w-[90vw] cursor-zoom-in object-contain"
            }`}
            src={imageSrc}
          />
        </div>
      </Modal>
    </>
  );
};

export default ZoomableImage;
