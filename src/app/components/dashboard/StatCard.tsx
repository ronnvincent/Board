import { type ReactNode } from "react";
import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendText?: string;
  colorClass?: string;
  index?: number;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendText,
  colorClass = "bg-[#e6efe8] text-primary",
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <span
          className={`grid size-10 place-items-center rounded-xl ${colorClass}`}
        >
          {icon}
        </span>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              trend === "up"
                ? "text-emerald-600"
                : trend === "down"
                  ? "text-red-500"
                  : "text-muted-foreground"
            }`}
          >
            {trend === "up" ? (
              <TrendingUp size={13} />
            ) : trend === "down" ? (
              <TrendingDown size={13} />
            ) : (
              <Minus size={13} />
            )}
            {trendText}
          </span>
        )}
      </div>
      <p className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </p>
      <p className="mt-1 text-2xl font-bold tracking-tight">
        {value}
        {subtitle && (
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {subtitle}
          </span>
        )}
      </p>
    </motion.div>
  );
}
