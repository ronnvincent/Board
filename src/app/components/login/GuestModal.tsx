import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User as UserIcon, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";
import AnimatedInput from "./AnimatedInput";

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GuestModal({ isOpen, onClose }: GuestModalProps) {
  const { guestSignIn } = useAuth();
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("user");

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    guestSignIn(name.trim(), role);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h3 className="font-['Libre_Baskerville'] text-2xl tracking-tight text-foreground">
                Enter as Guest
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Bypass the database entirely to test the dashboard.
              </p>
            </div>

            <form onSubmit={handleGuestSubmit} className="space-y-6">
              <AnimatedInput
                label="Your Full Name"
                icon={<UserIcon size={17} />}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">Select Role</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                      role === "user"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-transparent text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <UserIcon size={16} />
                    Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("administrator")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition-all ${
                      role === "administrator"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-transparent text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <Shield size={16} />
                    Administrator
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.985 }}
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-md transition-colors hover:bg-[#173f39]"
              >
                Enter Dashboard
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
