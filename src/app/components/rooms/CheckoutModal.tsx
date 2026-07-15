import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CreditCard, Building2, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  room, 
  house, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  room: any; 
  house: any; 
  user: any;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "gcash">("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mock form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [gcashNumber, setGcashNumber] = useState("");

  if (!isOpen || !room) return null;

  const handleClose = () => {
    // Reset state on close
    setErrorMsg(null);
    setIsSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    // Mock payment delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Attempt insert
    const { error } = await supabase.from("tenants").insert({
      name: user?.fullName || "Applicant",
      room_id: room.id,
      profile_id: user?.id,
      rent_status: "Due" // Application submitted, awaiting approval
    });

    if (error) {
      setErrorMsg(error.message || "Failed to submit application.");
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <AnimatePresence>
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold font-['Libre_Baskerville']">Application Submitted!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment method has been verified. The property administrator will review your request shortly.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39]"
            >
              Back to Explore
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl flex flex-col md:flex-row"
          >
            {/* Left side: Order Summary */}
            <div className="bg-muted/30 p-6 md:w-2/5 border-b md:border-b-0 md:border-r border-border">
              <h3 className="text-sm font-bold font-['DM_Mono'] uppercase tracking-widest text-muted-foreground mb-6">Order Summary</h3>
              
              <div className="mb-6 rounded-2xl bg-background p-4 border border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{house?.name || "Boarding House"}</p>
                    <p className="text-xs text-muted-foreground">Room {room.number}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span className="font-semibold">₱{(room.price || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Deposit</span>
                    <span className="font-semibold">₱0</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Application Fee</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-border pt-4">
                <span className="text-sm font-bold">Total Due Today</span>
                <span className="text-xl font-bold text-primary">₱{(room.price || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Right side: Payment Details */}
            <div className="p-6 md:w-3/5 relative">
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted transition"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-bold mb-6 font-['Libre_Baskerville']">Payment Details</h3>

              {errorMsg && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Application Failed</p>
                    <p className="text-xs mt-1 opacity-90">{errorMsg}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleApply} className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <CreditCard size={16} /> Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("gcash")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                      paymentMethod === "gcash"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Smartphone size={16} /> GCash
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === "card" ? (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-bold text-muted-foreground">Card Number</label>
                        <input 
                          type="text" 
                          placeholder="0000 0000 0000 0000" 
                          required
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="w-full mt-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-muted-foreground">Expiry Date</label>
                          <input 
                            type="text" 
                            placeholder="MM/YY" 
                            required
                            value={expiry}
                            onChange={e => setExpiry(e.target.value)}
                            className="w-full mt-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-muted-foreground">CVC</label>
                          <input 
                            type="text" 
                            placeholder="123" 
                            required
                            value={cvc}
                            onChange={e => setCvc(e.target.value)}
                            className="w-full mt-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary" 
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="gcash"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-xs font-bold text-muted-foreground">GCash Mobile Number</label>
                        <input 
                          type="text" 
                          placeholder="0917 000 0000" 
                          required
                          value={gcashNumber}
                          onChange={e => setGcashNumber(e.target.value)}
                          className="w-full mt-1.5 rounded-xl border border-blue-200 bg-background px-4 py-2.5 text-sm outline-none focus:border-blue-500" 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You will receive an SMS prompt to authorize this payment after clicking submit.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs flex gap-2 items-start text-left">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <p><strong>Non-Refundable Policy:</strong> By proceeding, you acknowledge that all rent payments and deposits are strictly non-refundable.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-[#173f39] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Processing..." : `Pay ₱${(room.price || 0).toLocaleString()} & Apply`}
                </button>
                <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                  <CreditCard size={10} /> Payments are secure and encrypted.
                </p>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
