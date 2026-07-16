import { motion, useReducedMotion } from "motion/react";

type HouseLoadingSize = "sm" | "md" | "lg";
type HouseLoadingVariant = "inline" | "page" | "overlay";

interface HouseLoadingProps {
  label?: string;
  subLabel?: string;
  size?: HouseLoadingSize;
  variant?: HouseLoadingVariant;
  className?: string;
}

const sizeClasses: Record<HouseLoadingSize, string> = {
  sm: "w-40",
  md: "w-52",
  lg: "w-64",
};

const shellClasses: Record<HouseLoadingVariant, string> = {
  inline: "py-6",
  page: "min-h-[100dvh] px-4 py-12",
  overlay: "rounded-3xl border border-border bg-card/95 px-5 py-4 shadow-xl backdrop-blur-md",
};

export default function HouseLoading({
  label = "Loading your space...",
  subLabel,
  size = "md",
  variant = "inline",
  className = "",
}: HouseLoadingProps) {
  const reduceMotion = useReducedMotion();
  const isPage = variant === "page";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`house-loading flex flex-col items-center justify-center text-center font-['DM_Sans'] text-foreground ${shellClasses[variant]} ${className}`}
    >
      <div className={`house-loading-scene ${sizeClasses[size]}`} aria-hidden="true">
        <motion.div
          className="house-loading-cloud house-loading-cloud-one"
          animate={reduceMotion ? undefined : { x: [0, 8, 0], opacity: [0.55, 0.9, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="house-loading-cloud house-loading-cloud-two"
          animate={reduceMotion ? undefined : { x: [0, -10, 0], opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          className="house-loading-home"
          animate={reduceMotion ? undefined : { x: ["-10%", "78%"], y: [0, -5, 0, -4, 0] }}
          transition={{ duration: 2.25, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 96 84" className="house-loading-home-svg" focusable="false">
            <path className="house-loading-roof" d="M14 38 48 10l34 28v7H14z" />
            <path className="house-loading-body" d="M23 39h50v34a5 5 0 0 1-5 5H28a5 5 0 0 1-5-5z" />
            <path className="house-loading-door" d="M42 53a6 6 0 0 1 12 0v25H42z" />
            <circle className="house-loading-knob" cx="51" cy="66" r="1.5" />
            <rect className="house-loading-window" x="29" y="48" width="10" height="10" rx="2" />
            <rect className="house-loading-window" x="58" y="48" width="10" height="10" rx="2" />
            <path className="house-loading-heart" d="M48 34c-4.8-4.9-12 1.4-5.7 7.2L48 46l5.7-4.8C60 35.4 52.8 29.1 48 34z" />
          </svg>
        </motion.div>

        <div className="house-loading-road">
          <span />
        </div>
      </div>

      <p className={`mt-3 font-bold tracking-tight ${isPage ? "text-base" : "text-sm"}`}>{label}</p>
      {subLabel && <p className="mt-1 max-w-xs text-xs text-muted-foreground sm:text-sm">{subLabel}</p>}
      <span className="sr-only">Please wait</span>
    </div>
  );
}
