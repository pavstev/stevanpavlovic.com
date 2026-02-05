import type { ImageMetadata } from "astro";

import { Image } from "astro:assets";
import React, { useState } from "react";

import Modal from "../atoms/Modal";

interface ZoomableImageProps {
  alt: string;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  src: ImageMetadata | string;
  width?: number;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  alt,
  className,
  height,
  loading = "lazy",
  src,
  width,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageSrc = typeof src === "string" ? src : src.src;

  return (
    <>
      <div
        className={`group relative inline-block cursor-zoom-in overflow-hidden ${className || ""}`}
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
        {typeof src === "string"
          ? (
            <img
              alt={alt}
              className="transition-transform duration-300 group-hover:scale-110"
              loading={loading}
              src={src}
            />
          )
          : (
            <Image
              alt={alt}
              class="transition-transform duration-300 group-hover:scale-110"
              height={height}
              loading={loading}
              src={src}
              width={width}
            />
          )}
      </div>

      <Modal
        bodyClass="p-0 overflow-hidden"
        className="m-0 !flex !h-screen !max-h-none !w-screen !max-w-none !items-center !justify-center !border-none !bg-transparent !p-0 backdrop:bg-black/90"
        dialogClass="!p-0"
        onClose={() => { setIsModalOpen(false); }}
        open={isModalOpen}
        showCloseButton={false}
      >
        <div
          className="absolute inset-0 size-full cursor-zoom-out"
          onClick={() => { setIsModalOpen(false); }}
          onKeyDown={(e): void => {
            if (e.key === "Escape") {
              setIsModalOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
        >
          <img
            alt={alt}
            className="max-h-screen w-auto object-contain"
            src={imageSrc}
          />
        </div>
      </Modal>
    </>
  );
};

export default ZoomableImage;
