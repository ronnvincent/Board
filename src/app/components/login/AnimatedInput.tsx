import { useState, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

interface AnimatedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
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
  value,
  onChange,
  ...rest
}: AnimatedInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const currentValue = value !== undefined ? String(value) : internalValue;
  const hasContent = currentValue.length > 0;
  const isFloating = focused || hasContent;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    else setInternalValue(e.target.value);
  };

  return (
    <div className="space-y-1.5">
      <motion.div
        animate={error ? { x: [0, -6, 5, -4, 3, 0] } : {}}
        transition={{ duration: 0.4 }}
        className={`
          relative flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5
          transition-all duration-300 ease-out
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
        <div className="relative flex-1 min-h-[24px]">
          {/* Floating label */}
          <motion.label
            htmlFor={id}
            initial={false}
            animate={{
              y: isFloating ? -10 : 0,
              scale: isFloating ? 0.75 : 1,
              opacity: isFloating ? 0.7 : 0.55,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute left-0 origin-left cursor-text text-[15px] text-muted-foreground pointer-events-none select-none"
            style={{ top: "50%", transform: "translateY(-50%)" }}
          >
            {label}
          </motion.label>

          <input
            id={id}
            type={isPassword ? (showPassword ? "text" : "password") : rest.type}
            value={currentValue}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={`
              w-full border-0 bg-transparent p-0 text-[15px] outline-none
              transition-all duration-200
              ${isFloating ? "translate-y-[3px]" : ""}
            `}
            {...rest}
          />
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
