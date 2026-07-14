import { useState } from "react";
import LoginLeftPanel from "../components/login/LoginLeftPanel";
import LoginForm from "../components/login/LoginForm";
import SignupForm from "../components/login/SignupForm";

interface LoginPageProps {
  onGoHome: () => void;
}

export default function LoginPage({ onGoHome }: LoginPageProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");

  return (
    <main className="min-h-screen bg-[#f5f0e6] font-['DM_Sans'] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <LoginLeftPanel mode={mode} />
        {mode === "login" ? (
          <LoginForm
            onGoHome={onGoHome}
            onGoToSignup={() => setMode("signup")}
          />
        ) : (
          <SignupForm
            onGoHome={onGoHome}
            onGoToLogin={() => setMode("login")}
          />
        )}
      </div>
    </main>
  );
}
