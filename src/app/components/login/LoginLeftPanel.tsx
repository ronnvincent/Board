import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Building2, ShieldCheck, Sparkles, Users, Home } from "lucide-react";

const features = [
  {
    icon: <Sparkles size={18} />,
    title: "Effortless management",
    text: "Track rooms, rent, and repairs in one place — no spreadsheets, no stress.",
  },
  {
    icon: <Users size={18} />,
    title: "Resident-first experience",
    text: "Give every tenant a simple portal to pay, request, and stay connected.",
  },
  {
    icon: <Home size={18} />,
    title: "Built for shared living",
    text: "Purpose-built for boarding houses, dormitories, and co-living spaces.",
  },
];

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-9 place-items-center rounded-[13px] bg-[#e6b65c] text-[#1d5148]">
        <Building2 size={19} strokeWidth={2.3} />
      </div>
      <span className="font-['DM_Sans'] text-[18px] font-bold tracking-[-0.03em] text-[#fffdf8]">
        Boarding<span className="text-[#e6b65c]">How</span>
      </span>
    </div>
  );
}

export default function LoginLeftPanel({ mode = "login" }: { mode?: "login" | "signup" }) {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative hidden overflow-hidden bg-[#1f5149] px-12 py-10 lg:flex lg:flex-col xl:px-20">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Floating circles */}
        <motion.div
          className="absolute -right-16 top-24 size-72 rounded-full border border-[#e6b65c]/25"
          style={{ animation: "float-slow 18s ease-in-out infinite" }}
        />
        <motion.div
          className="absolute -right-4 top-48 size-44 rounded-full bg-[#e6b65c]/8"
          style={{ animation: "float-medium 14s ease-in-out infinite" }}
        />
        <motion.div
          className="absolute -left-12 bottom-32 size-56 rounded-full border border-[#fffdf8]/8"
          style={{ animation: "float-slow 22s ease-in-out infinite 3s" }}
        />
        <motion.div
          className="absolute left-1/3 top-16 size-20 rounded-full bg-[#e6b65c]/6"
          style={{ animation: "float-fast 10s ease-in-out infinite 1s" }}
        />

        {/* Dot grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fffdf8 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <BrandMark />
      </motion.div>

      {/* Main content */}
      <div className="relative my-auto max-w-[530px]">
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-7 font-['DM_Mono'] text-[11px] uppercase tracking-[0.17em] text-[#e6b65c]"
        >
          {mode === "login" ? "The house is in good hands" : "Join your house"}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="font-['Libre_Baskerville'] text-[44px] font-normal leading-[1.18] tracking-[-0.035em] text-[#fffdf8] xl:text-[56px]"
        >
          {mode === "login" ? "Your daily rhythm," : "A place that already"}{" "}
          <span className="relative inline-block">
            {mode === "login" ? "made lighter." : "feels like home."}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-[#e6b65c]/50"
            />
          </span>
        </motion.h1>

        {/* Feature carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-14 min-h-[110px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-[#fffdf8]/10 bg-[#fffdf8]/[0.04] px-6 py-5 backdrop-blur-sm"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-[#e6b65c]/15 text-[#e6b65c]">
                  {features[activeFeature].icon}
                </span>
                <span className="text-sm font-semibold text-[#fffdf8]">
                  {features[activeFeature].title}
                </span>
              </div>
              <p className="text-sm leading-6 text-[#c9d9ce]">
                {features[activeFeature].text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Carousel indicators */}
          <div className="mt-4 flex items-center gap-2">
            {features.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveFeature(i)}
                className="group relative h-1.5 transition-all duration-300"
                style={{ width: i === activeFeature ? 28 : 8 }}
                aria-label={`Show feature ${i + 1}`}
              >
                <span
                  className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    i === activeFeature
                      ? "bg-[#e6b65c]"
                      : "bg-[#fffdf8]/20 group-hover:bg-[#fffdf8]/35"
                  }`}
                />
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Security badge + footer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="relative space-y-5"
      >
        <div className="flex items-center gap-4 border-t border-[#fffdf8]/10 pt-6 text-sm leading-6 text-[#d9e3d8]">
          <ShieldCheck className="shrink-0 text-[#e6b65c]" size={23} />
          <span>Secure sign-in for house managers, staff, and residents.</span>
        </div>
        <p className="font-['DM_Mono'] text-[10px] uppercase tracking-[0.15em] text-[#afc8bc]">
          © 2025 BoardingHow · Made for shared living
        </p>
      </motion.div>
    </section>
  );
}
