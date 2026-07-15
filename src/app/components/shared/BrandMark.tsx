import { Building2 } from "lucide-react";

interface BrandMarkProps {
  light?: boolean;
  size?: "sm" | "md";
}

export default function BrandMark({ light = false, size = "md" }: BrandMarkProps) {
  const iconSize = size === "sm" ? 15 : 19;
  const boxSize = size === "sm" ? "size-7" : "size-9";
  const textSize = size === "sm" ? "text-[15px]" : "text-[18px]";
  const radius = size === "sm" ? "rounded-[10px]" : "rounded-[13px]";

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`grid ${boxSize} place-items-center ${radius} bg-white overflow-hidden`}
      >
        <img src="/logo.png" alt="BoardingHow Logo" className="w-full h-full object-cover" />
      </div>
      <span
        className={`font-['DM_Sans'] ${textSize} font-bold tracking-[-0.03em] ${
          light ? "text-[#fffdf8]" : "text-foreground"
        }`}
      >
        Boarding
        <span className={light ? "text-[#e6b65c]" : "text-primary"}>How</span>
      </span>
    </div>
  );
}
