
import React from 'react';

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kaabharat Onboarding Logo"
    >
      <defs>
        <linearGradient id="grad_pink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d61f7e" />
          <stop offset="100%" stopColor="#f353a8" />
        </linearGradient>
        <linearGradient id="grad_orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f7971e" />
          <stop offset="100%" stopColor="#ffd200" />
        </linearGradient>
        <linearGradient id="grad_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0052d4" />
          <stop offset="100%" stopColor="#4364f7" />
        </linearGradient>
      </defs>
      
      {/* Blue Shape */}
      <g>
        <path
          d="M 100,190 C 70,190 60,150 70,120 L 100,70 L 130,120 C 140,150 130,190 100,190 Z"
          fill="url(#grad_blue)"
          transform="rotate(180, 100, 100)"
        />
        <circle cx="100" cy="35" r="22" fill="url(#grad_blue)" transform="rotate(180, 100, 100)" />
      </g>

      {/* Pink Shape */}
      <g transform="rotate(-60, 100, 100)">
        <path
          d="M 100,190 C 70,190 60,150 70,120 L 100,70 L 130,120 C 140,150 130,190 100,190 Z"
          fill="url(#grad_pink)"
          transform="rotate(180, 100, 100)"
        />
        <circle cx="100" cy="35" r="22" fill="url(#grad_pink)" transform="rotate(180, 100, 100)" />
      </g>
      
      {/* Orange Shape */}
      <g transform="rotate(60, 100, 100)">
        <path
          d="M 100,190 C 70,190 60,150 70,120 L 100,70 L 130,120 C 140,150 130,190 100,190 Z"
          fill="url(#grad_orange)"
          transform="rotate(180, 100, 100)"
        />
        <circle cx="100" cy="35" r="22" fill="url(#grad_orange)" transform="rotate(180, 100, 100)" />
      </g>

    </svg>
  );
};

export default LogoIcon;
