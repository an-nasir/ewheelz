// src/components/MagneticButton.tsx
// Button that slightly follows the cursor — JetBrains magnetic button effect.
"use client";

import { useRef, MouseEvent, ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number; // 0–1, default 0.3
  type?: "button" | "submit";
}

export default function MagneticButton({
  children,
  href,
  onClick,
  className = "",
  strength = 0.28,
  type = "button",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  const sharedStyle: React.CSSProperties = {
    transition: "transform 0.18s cubic-bezier(.2,.8,.2,1)",
  };

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={className}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={sharedStyle}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      className={className}
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={sharedStyle}
    >
      {children}
    </button>
  );
}
