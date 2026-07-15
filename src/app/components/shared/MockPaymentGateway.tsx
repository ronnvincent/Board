import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Smartphone, CreditCard, ShieldCheck, Loader2 } from "lucide-react";

interface MockPaymentGatewayProps {
  amount: number;
  description: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function MockPaymentGateway({ amount, description, onSuccess, onCancel }: MockPaymentGatewayProps) {
  const [step, setStep] = useState<"select" | "processing" | "success">("select");
  const [method, setMethod] = useState<"gcash" | "card" | null>(null);

  const handlePay = () => {
    if (!method) return;
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
      >
        <div className="relative border-b border-border bg-muted/30 px-6 py-5">
          <button 
            onClick={onCancel}
            disabled={step === "processing"}
            className="absolute right-5 top-5 text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <X size={20} />
          </button>
          <p className="font-['DM_Mono'] text-xs font-medium uppercase tracking-widest text-muted-foreground">Secure Checkout</p>
          <p className="mt-1 text-2xl font-bold">₱{amount.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "select" && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-sm font-semibold">Select Payment Method</p>
                
                <div className="grid gap-3">
                  <button
                    onClick={() => setMethod("gcash")}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                      method === "gcash" ? "border-blue-500 bg-blue-500/5 ring-1 ring-blue-500" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="grid size-10 place-items-center rounded-full bg-blue-500 text-white">
                      <Smartphone size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">E-Wallet (GCash / Maya)</p>
                      <p className="text-xs text-muted-foreground">Pay instantly using your mobile wallet</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMethod("card")}
                    className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                      method === "card" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground">
                      <CreditCard size={18} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">Credit / Debit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, JCB</p>
                    </div>
                  </button>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handlePay}
                    disabled={!method}
                    className="w-full rounded-xl bg-primary px-4 py-3.5 text-[15px] font-bold text-primary-foreground transition-all hover:bg-[#173f39] disabled:opacity-50"
                  >
                    Pay ₱{amount.toLocaleString()}
                  </button>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck size={14} />
                    <p>Payments are 100% secure and encrypted.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Loader2 size={40} className="animate-spin text-primary" />
                <p className="mt-4 font-bold text-lg">Processing Payment...</p>
                <p className="text-sm text-muted-foreground">Please don't close this window.</p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="grid size-16 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_0_0_8px_rgba(16,185,129,0.15)]">
                  <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </motion.svg>
                </div>
                <p className="mt-6 font-bold text-xl text-emerald-600">Payment Successful!</p>
                <p className="text-sm text-muted-foreground">Your rent status has been updated.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
