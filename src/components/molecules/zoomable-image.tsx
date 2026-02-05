import type { ImageMetadata } from "astro";

import React, { useState } from "react";

import Modal from "../atoms/modal";

interface Props {
  alt: string;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  src: ImageMetadata | string;
  width?: number;
}

const ZoomableImage: React.FC<Props> = ({
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
      </div>

      <Modal
        bodyClass="p-0 overflow-hidden flex items-center justify-center h-full"
        className="max-h-[90vh] max-w-(--breakpoint-xl) overflow-hidden border-none bg-transparent shadow-none"
        onClose={() => { setIsModalOpen(false); }}
        open={isModalOpen}
        showCloseButton={true}
      >
        <img
          alt={alt}
          className="h-auto max-h-full w-full object-contain"
          src={imageSrc}
        />
      </Modal>
    </>
  );
};

export default ZoomableImage;
