import React, { useState } from "react";

import profileImage from "../../assets/profile.jpeg";
import { PROFILE } from "../../lib/config";
import MagnifyOverlay from "../atoms/magnify-overlay";
import Modal from "../atoms/modal";

interface HeroAvatarProps {
  className?: string;
}

const HeroAvatar: React.FC<HeroAvatarProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMagnified, setIsMagnified] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!isMagnified) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPosition({ x, y });
  };

  return (
    <>
      <div
        className={`group relative z-10 ${className || ""}`}
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
        {/* Ambient Glow - Back */}
        <div className="absolute -inset-4 -z-10 animate-pulse rounded-full bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
        <div className="absolute -inset-0.5 -z-10 rounded-[1.25rem] bg-linear-to-br from-white/20 via-white/5 to-white/20 opacity-50 blur-sm transition-all duration-500 group-hover:blur-md" />

        {/* Main Card */}
        <div className="group-hover:shadow-glow-accent relative w-56 cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-1.5 shadow-2xl backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:border-white/20 md:w-64">

          {/* Inner Image Container */}
          <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-neutral-900">
            <img
              alt={PROFILE.name}
              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
              loading="eager"
              src={profileImage.src}
            />

            {/* Overlay Shine */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20" />

            {/* Magnifying Glass Icon */}
            <MagnifyOverlay />
          </div>
        </div>
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
          onClick={() => { setIsMagnified(!isMagnified); }}
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
            alt={PROFILE.name}
            className={`object-contain transition-all duration-100 ${
              isMagnified
                ? "scale-150 cursor-zoom-out"
                : "max-h-[90vh] max-w-[95vw] cursor-zoom-in"
            }`}
            src={profileImage.src}
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

export default HeroAvatar;
