import React from 'react';

export function StayLinkLogo({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* City buildings on the top left */}
      <path d="M170 150 V90 H210 V150 Z" fill="#0EA5E9" />
      <path d="M210 150 V60 H250 V150 Z" fill="#0EA5E9" />
      {/* 4-pane windows on buildings */}
      <rect x="180" y="100" width="10" height="10" fill="white" />
      <rect x="195" y="100" width="10" height="10" fill="white" />
      <rect x="180" y="115" width="10" height="10" fill="white" />
      <rect x="195" y="115" width="10" height="10" fill="white" />

      <rect x="220" y="70" width="10" height="10" fill="white" />
      <rect x="235" y="70" width="10" height="10" fill="white" />
      <rect x="220" y="85" width="10" height="10" fill="white" />
      <rect x="235" y="85" width="10" height="10" fill="white" />

      {/* House Roof & Pin outer shape */}
      {/* The top part is a roof /_\ that seamlessly blends into a pin shape */}
      <path d="M160 170 L250 100 L340 170 C340 180 340 190 330 200 C320 220 280 250 250 280 C220 250 180 220 170 200 C160 190 160 180 160 170 Z" fill="#0284C7" />
      
      {/* Inner Pin / House Body */}
      <path d="M180 180 L250 125 L320 180 C320 220 280 250 250 280 C220 250 180 220 180 180 Z" fill="white" />
      
      {/* Window inside the house */}
      <rect x="224" y="150" width="22" height="22" fill="#0284C7" />
      <rect x="254" y="150" width="22" height="22" fill="#0284C7" />
      <rect x="224" y="180" width="22" height="22" fill="#0284C7" />
      <rect x="254" y="180" width="22" height="22" fill="#0284C7" />

      {/* Deep blue accent on the right of the pin to simulate the 3D curve / shadow */}
      <path d="M250 280 C280 250 340 220 340 180 V170 L250 100 V125 L320 180 C320 220 280 250 250 280 Z" fill="#0369A1" />

      {/* The word 'StayLink' */}
      <text x="250" y="360" fontFamily="Inter, sans-serif" fontSize="84" fontWeight="900" fill="#0369A1" textAnchor="middle" letterSpacing="-2">
        <span>Stay</span><tspan fill="#0EA5E9">Link</tspan>
      </text>
    </svg>
  );
}
