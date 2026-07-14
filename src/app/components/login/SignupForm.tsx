import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Loader2, Mail, UserRound } from "lucide-react";
import AnimatedInput from "./AnimatedInput";
import { useAuth } from "../../context/AuthContext";
import GuestModal from "./GuestModal";

interface SignupFormProps {
  onGoHome: () => void;
  onGoToLogin: () => void;
}

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export default function SignupForm({ onGoHome, onGoToLogin }: SignupFormProps) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showGuestModal, setShowGuestModal] = useState(false);

    const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Detect missing Vercel environment variables immediately
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError("CONFIGURATION ERROR: You need to add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel Project Settings -> Environment Variables, then redeploy.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, fullName);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:px-[clamp(3rem,7vw,7.5rem)] lg:py-10">
      {/* Mobile header */}
      <div className="flex items-center justify-between lg:hidden">
        <button onClick={onGoHome} className="flex items-center gap-2.5">
          <div className="grid size-9 place-items-center rounded-[13px] bg-primary text-primary-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
          </div>
          <span className="font-['DM_Sans'] text-[18px] font-bold tracking-[-0.03em] text-foreground">
            Boarding<span className="text-primary">How</span>
          </span>
        </button>
        <button onClick={onGoHome} className="text-sm font-medium text-primary">
          Back home
        </button>
      </div>

      {/* Form container */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
        }}
        className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-14 lg:py-10"
      >
        {/* Back button (desktop) */}
        <motion.button
          variants={staggerItem}
          onClick={onGoHome}
          className="mb-10 hidden items-center gap-2 text-sm text-muted-foreground transition hover:text-primary lg:flex"
        >
          <ArrowLeft size={16} /> Back to home
        </motion.button>

        {/* Header */}
        <motion.div variants={staggerItem} className="mb-8">
          <p className="mb-3 font-['DM_Mono'] text-[11px] uppercase tracking-[0.15em] text-primary">
            Join your house
          </p>
          <h2 className="font-['Libre_Baskerville'] text-[34px] leading-[1.2] tracking-[-0.035em] sm:text-[38px]">
            Create your{" "}
            <span className="relative inline-block">
              account.
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-primary/30"
              />
            </span>
          </h2>
          <p className="mt-3 text-[15px] leading-6 text-muted-foreground">
            Set up your resident account to get started.
          </p>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
              className="overflow-hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <motion.div variants={staggerItem}>
            <AnimatedInput
              label="Full name"
              icon={<UserRound size={17} />}
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedInput
              label="Email address"
              icon={<Mail size={17} />}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedInput
              label="Password"
              icon={<LockKeyhole size={17} />}
              isPassword
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </motion.div>

          <motion.div variants={staggerItem}>
            <AnimatedInput
              label="Confirm password"
              icon={<LockKeyhole size={17} />}
              isPassword
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </motion.div>

          {/* Submit button */}
          <motion.div variants={staggerItem} className="pt-1">
            <motion.button
              type="submit"
              disabled={loading || submitted}
              whileHover={!loading && !submitted ? { y: -2 } : {}}
              whileTap={!loading && !submitted ? { scale: 0.985 } : {}}
              className={`
                relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3.5
                text-sm font-bold transition-all duration-300
                ${submitted
                  ? "bg-emerald-600 text-white shadow-[0_8px_18px_rgba(16,185,129,.2)]"
                  : "bg-primary text-primary-foreground shadow-[0_8px_18px_rgba(31,81,73,.18)] hover:bg-[#173f39]"
                }
                disabled:cursor-not-allowed
              `}
            >
              {!loading && !submitted && (
                <span
                  className="pointer-events-none absolute inset-0 bg-[length:200%_100%]"
                  style={{
                    backgroundImage:
                      "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.08) 50%, transparent 75%)",
                    animation: "shimmer 3s ease-in-out infinite",
                  }}
                />
              )}

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.span
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Check size={17} strokeWidth={3} /> Account created!
                  </motion.span>
                ) : loading ? (
                  <motion.span
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 size={17} className="animate-spin" /> Creating account…
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    Create account <ArrowRight size={17} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>

        {/* Success banner */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: 8, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto", marginTop: 20 }}
              exit={{ opacity: 0, y: -8, height: 0, marginTop: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden rounded-xl border border-[#bcd2c4] bg-[#e3eee5] px-4 py-3 text-sm text-[#1f5149]"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-[#1f5149] text-white">
                  <Check size={11} strokeWidth={3} />
                </span>
                Welcome aboard! Redirecting to your dashboard…
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login link */}
        <motion.p
          variants={staggerItem}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Already have an account?{" "}
          <button
            type="button"
            onClick={onGoToLogin}
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </button>
        </motion.p>

        {/* Guest Mode Divider & Button */}
        <motion.div variants={staggerItem} className="mt-8 flex flex-col items-center">
          <div className="flex w-full items-center gap-4 text-sm text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <button
            type="button"
            onClick={() => setShowGuestModal(true)}
            className="mt-6 rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-muted"
          >
            Continue as Guest
          </button>
        </motion.div>
      </motion.div>

      <GuestModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />

      {/* Mobile footer */}
      <p className="text-center text-xs text-muted-foreground lg:hidden">
        © 2025 BoardingHow
      </p>
    </section>
  );
}
