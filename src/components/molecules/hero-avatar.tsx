import React, { useState } from "react";

import profileImage from "../../assets/profile.jpeg";
import { PROFILE } from "../../lib/config";
import Modal from "../atoms/modal";

interface HeroAvatarProps {
  className?: string;
}

const HeroAvatar: React.FC<HeroAvatarProps> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="group-hover:shadow-glow-accent relative w-56 transform cursor-zoom-in rounded-2xl border border-white/10 bg-black/20 p-1.5 shadow-2xl backdrop-blur-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03] group-hover:-rotate-1 group-hover:border-white/20 md:w-64">

          {/* Inner Image Container */}
          <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-neutral-900">
            <img
              alt={PROFILE.name}
              className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110"
              loading="eager"
              src={profileImage.src}
            />

            {/* Overlay Shine */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/20" />
          </div>
        </div>
      </div>

      <Modal
        className="m-0 flex! h-screen! max-h-none! w-screen! max-w-none! items-center! justify-center! border-none! bg-black/80! p-0! backdrop-blur-xl!"
        dialogClass="!p-0 !bg-transparent !shadow-none !border-none !max-w-none"
        onClose={() => { setIsModalOpen(false); }}
        open={isModalOpen}
        showCloseButton={false}
      >
        <div
          className="relative animate-zoom-in overflow-hidden rounded-lg shadow-2xl ring-1 shadow-accent/20 ring-white/10"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          role="presentation"
        >
          <img
            alt={PROFILE.name}
            className="max-h-[85vh] w-auto max-w-[90vw] object-contain md:max-h-[90vh]"
            src={profileImage.src}
          />
          {/* Close hint */}
          <button
            className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white/70 backdrop-blur-md transition-colors hover:bg-black/70 hover:text-white"
            onClick={() => { setIsModalOpen(false); }}
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>
      </Modal>

      <style>{`
        .animate-zoom-in {
          animation: zoomIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default HeroAvatar;
