import React from "react";

export function FlowerIcon({ className = "w-5 h-5 text-[#D98880]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C10.5 3.5 10.5 6 12 7.5C13.5 6 13.5 3.5 12 2Z" />
      <path d="M12 16.5C10.5 18 10.5 20.5 12 22C13.5 20.5 13.5 18 12 16.5Z" />
      <path d="M2 12C3.5 10.5 6 10.5 7.5 12C6 13.5 3.5 13.5 2 12Z" />
      <path d="M16.5 12C18 10.5 20.5 10.5 22 12C20.5 13.5 18 13.5 16.5 12Z" />
      <path d="M4.9 4.9C6.7 6.1 8 8 8.5 9.5C7 9 5.1 7.7 3.9 5.9C3.6 5.4 4.4 4.6 4.9 4.9Z" />
      <path d="M19.1 19.1C17.3 17.9 16 16 15.5 14.5C17 15 18.9 16.3 20.1 18.1C20.4 18.6 19.6 19.4 19.1 19.1Z" />
      <circle cx="12" cy="12" r="3" className="fill-[#F3CECE]" />
    </svg>
  );
}

export function WavyDivider({ className = "w-full text-[#EADFD5]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 12C150 24 300 0 450 12C600 24 750 0 900 12C1050 24 1200 0 1350 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
