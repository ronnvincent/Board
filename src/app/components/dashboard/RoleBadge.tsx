import { ROLE_CONFIG, type UserRole } from "../../types/auth";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md";
}

export default function RoleBadge({ role, size = "md" }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  const sizeClasses =
    size === "sm"
      ? "px-2 py-0.5 text-[10px]"
      : "px-2.5 py-1 text-[11px]";

  return (
    <span
      className={`inline-flex items-center rounded-full font-['DM_Mono'] uppercase tracking-[0.08em] font-medium ${sizeClasses}`}
      style={{ color: config.color, backgroundColor: config.bgColor }}
    >
      {config.label}
    </span>
  );
}
