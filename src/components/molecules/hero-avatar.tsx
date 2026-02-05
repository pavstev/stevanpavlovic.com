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
        className={`w-56 cursor-zoom-in rounded-lg bg-white p-1.5 shadow-xl transition-all duration-500 hover:scale-108 hover:rotate-2 hover:shadow-2xl md:w-64 ${className || ""}`}
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
        <div className="rounded-sm">
          <img
            alt={PROFILE.name}
            className="aspect-4/5 w-full object-cover"
            loading="eager"
            src={profileImage.src}
          />
        </div>
      </div>

      <Modal
        className="m-0 flex! h-screen! max-h-none! w-screen! max-w-none! items-center! !justify-center !border-none !bg-transparent !p-0"
        dialogClass="!p-0"
        onClose={() => { setIsModalOpen(false); }}
        open={isModalOpen}
        showCloseButton={false}
      >
        <div className="relative animate-zoom-in">
          <img
            alt={PROFILE.name}
            className="max-h-[90vh] max-w-[90vw] rounded-sm object-contain"
            src={profileImage.src}
          />
        </div>
      </Modal>

      <style>{`
        .animate-zoom-in {
          animation: zoomIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default HeroAvatar;
