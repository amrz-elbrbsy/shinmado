import React from 'react';
import zipblindLogoClean from '../../assets/images/zipblind_logo_clean.png';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'gold';
  collapsed?: boolean;
  showSubtitle?: boolean;
  className?: string;
  useImage?: boolean;
}

/**
 * Official ZIPBLIND® Vector Brand Logo (Transparent)
 * Styled after the official brandmark in rich golden-ochre (#CF9217)
 * with the signature P-B junction cut and registered trademark symbol ®.
 */
export const ZipblindVectorLogo: React.FC<{
  className?: string;
  color?: string;
  height?: number;
}> = ({ className = 'h-7', color = '#CF9217' }) => {
  return (
    <svg
      viewBox="0 0 420 86"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} w-auto select-none`}
      aria-label="ZIPBLIND®"
    >
      <g fill={color}>
        {/* Z */}
        <path d="M12 18H62V29.5L29 63.5H64V75H12V63.5L45 29.5H12V18Z" />

        {/* I */}
        <path d="M72 18H86V75H72V18Z" />

        {/* P */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M96 18H138C151.255 18 162 25.163 162 36C162 46.837 151.255 54 138 54H110V75H96V18ZM110 29.5V42.5H137C143.627 42.5 148 39.59 148 36C148 32.41 143.627 29.5 137 29.5H110Z"
        />

        {/* B (with distinctive slant on the left to interlock with P) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M165 18H205C217.15 18 226 24.2 226 33.5C226 39.5 221.8 44.5 215 46.5C223 48.8 228 54.2 228 61C228 70.8 218.5 75 206 75H165V18ZM179 29.5V42H203C208.5 42 212 39.2 212 35.8C212 32.3 208.5 29.5 203 29.5H179ZM179 51V63.5H204C209.8 63.5 214 60.5 214 57.2C214 53.8 209.8 51 204 51H179Z"
        />

        {/* L */}
        <path d="M236 18H250V63.5H280V75H236V18Z" />

        {/* I */}
        <path d="M289 18H303V75H289V18Z" />

        {/* N */}
        <path d="M312 18H326L354 59.5V18H368V75H354L326 33.5V75H312V18Z" />

        {/* D */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M377 18H406C423 18 433 28.5 433 46.5C433 64.5 423 75 406 75H377V18ZM391 29.5V63.5H405C414.5 63.5 419 57.2 419 46.5C419 35.8 414.5 29.5 405 29.5H391Z"
        />

        {/* ® (Registered Trademark Circle R) */}
        <circle cx="448" cy="27" r="10" stroke={color} strokeWidth="2" fill="none" />
        <path
          d="M445 22H449C451.5 22 453 23 453 24.7C453 26 452.2 26.9 450.8 27.2L453.5 32H451.3L448.9 27.8H446.8V32H445V22ZM446.8 23.5V26.5H448.8C450.2 26.5 451.2 25.8 451.2 24.8C451.2 23.8 450.2 23.5 448.8 23.5H446.8Z"
          fill={color}
        />
      </g>
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'gold',
  collapsed = false,
  showSubtitle = true,
  className = '',
  useImage = true,
}) => {
  if (collapsed) {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C49219] to-[#A2720E] flex items-center justify-center text-white shadow-xs font-black text-sm">
          ZB
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start select-none ${className}`}>
      <div className="flex items-center">
        <img
          src={zipblindLogoClean}
          alt="ZIPBLIND®"
          className="h-7 w-auto object-contain"
          onError={(e) => {
            // Hide image and fallback if needed
            e.currentTarget.style.display = 'none';
          }}
        />
        <ZipblindVectorLogo className="h-7 hidden peer-placeholder-shown:block" color="#C59218" />
      </div>

      {showSubtitle && (
        <div className="flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF2DE] border border-[#E9D5A1] text-[#9E7312] text-[10px] font-bold tracking-wider">
          <span>PT SHINMADO</span>
          <span className="text-[#C59218]">•</span>
          <span>OFFICIAL</span>
        </div>
      )}
    </div>
  );
};
