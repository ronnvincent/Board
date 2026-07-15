import { useState, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

interface AnimatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "placeholder"> {
  label: string;
  icon: ReactNode;
  error?: string;
  isPassword?: boolean;
}

export default function AnimatedInput({
  label,
  icon,
  error,
  isPassword = false,
  ...rest
}: AnimatedInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1.5">
      <motion.div
        animate={error ? { x: [0, -6, 5, -4, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`
          relative flex items-center gap-3 rounded-xl border bg-card px-4 py-2.5
          transition-all duration-300 ease-out min-h-[58px]
          ${focused
            ? "border-primary shadow-[0_0_0_3px_rgba(31,81,73,0.10)]"
            : error
              ? "border-destructive shadow-[0_0_0_3px_rgba(212,24,61,0.08)]"
              : "border-border hover:border-primary/40"
          }
        `}
      >
        {/* Icon */}
        <motion.span
          animate={{ color: focused ? "#1f5149" : "#64706a" }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          {icon}
        </motion.span>

        {/* Input + floating label wrapper */}
        <div className="relative flex-1 flex flex-col justify-center h-full pt-3.5">
          <input
            id={id}
            type={isPassword ? (showPassword ? "text" : "password") : rest.type}
            placeholder=" " /* Crucial for CSS floating label to work */
            onFocus={(e) => {
              setFocused(true);
              rest.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              rest.onBlur?.(e);
            }}
            className={`
              peer w-full border-0 bg-transparent p-0 text-[15px] outline-none
              transition-all duration-200
            `}
            {...rest}
          />
          <label
            htmlFor={id}
            className="absolute left-0 top-1/2 -translate-y-1/2 origin-left cursor-text text-[15px] text-muted-foreground pointer-events-none select-none transition-all duration-200 ease-out z-10
            peer-focus:-translate-y-[24px] peer-focus:scale-75 peer-focus:opacity-70
            peer-[:not(:placeholder-shown)]:-translate-y-[24px] peer-[:not(:placeholder-shown)]:scale-75 peer-[:not(:placeholder-shown)]:opacity-70"
          >
            {label}
          </label>
        </div>

        {/* Password toggle */}
        {isPassword && (
          <motion.button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            whileTap={{ scale: 0.9 }}
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={showPassword ? "eye-off" : "eye"}
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.15 }}
                className="block"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-xs font-medium text-destructive pl-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
