import type { ImageMetadata } from "astro";

import React, { useCallback, useState } from "react";

import MagnifyOverlay from "../atoms/magnify-overlay";
import Modal from "../atoms/modal";

interface Props {
  alt: string;
  className?: string;
  height?: number;
  loading?: "eager" | "lazy";
  src: ImageMetadata | string;
  width?: number;
}

const ZoomableImage: React.FC<Props> = ({ alt, className, height, loading = "lazy", src, width }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMagnified, setIsMagnified] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!isMagnified) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Use state for updates without re-renders
      setPosition({ x, y });

      // Update transform directly for instant response
      const img = e.currentTarget.querySelector("img");
      if (img) {
        img.style.transformOrigin = `${x.toString()}% ${y.toString()}%`;
      }
    },
    [isMagnified],
  );

  return (
    <>
      <div
        className={`group relative block cursor-pointer overflow-hidden transition-all hover:opacity-90 ${className || ""}`}
        onClick={() => {
          setIsModalOpen(true);
        }}
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
          src={typeof src === "string" ? src : src.src}
          width={width}
        />
        {/* Magnifying Glass Decoration */}
        <MagnifyOverlay />
      </div>

      <Modal
        className="max-h-[95vh] max-w-[95vw] overflow-visible border-none bg-transparent shadow-none"
        onClose={() => {
          setIsModalOpen(false);
          setIsMagnified(false);
          setPosition({ x: 50, y: 50 });
        }}
        open={isModalOpen}
        showCloseButton={true}
      >
        <div
          className={`relative cursor-zoom-${isMagnified ? "out" : "in"} overflow-hidden transition-transform duration-100`}
          onClick={() => {
            setIsMagnified(!isMagnified);
          }}
          onKeyDown={(e): void => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsMagnified(!isMagnified);
            }
          }}
          onMouseMove={handleMouseMove}
          role="button"
          tabIndex={0}
        >
          <img
            alt={alt}
            className={`object-contain transition-all duration-100 ${
              isMagnified ? "scale-150 cursor-zoom-out" : "max-h-[90vh] max-w-[95vw] cursor-zoom-in"
            }`}
            src={typeof src === "string" ? src : src.src}
            style={
              isMagnified
                ? {
                    transformOrigin: `${String(position.x)}% ${String(position.y)}%`,
                  }
                : undefined
            }
          />
        </div>
      </Modal>
    </>
  );
};

export default ZoomableImage;
