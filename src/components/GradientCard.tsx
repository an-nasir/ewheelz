// src/components/GradientCard.tsx
// Mouse-reactive spotlight card — JetBrains-inspired.
// Tracks cursor position and creates a radial glow following the mouse.
"use client";

import { useRef, MouseEvent, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  glowColor?: string; // rgba color for the spotlight
  href?: string;
}

export default function GradientCard({
  children,
  className = "",
  glowColor = "rgba(99,102,241,0.12)",
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${x}%`);
    card.style.setProperty("--mouse-y", `${y}%`);
    card.style.setProperty("--glow-color", glowColor);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
  };

  return (
    <div
      ref={cardRef}
      className={`card card-hover group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--glow-color": glowColor,
        } as React.CSSProperties
      }
    >
      {/* Mouse spotlight overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--glow-color, rgba(99,102,241,0.12)) 0%, transparent 55%)`,
        }}
      />
      {/* Content — must be above overlay */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
