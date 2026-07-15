import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Menu,
  Sparkles,
  X,
  CreditCard,
  Wrench,
  MessageCircle,
  Users,
  Star,
  Quote,
} from "lucide-react";

const benefits = [
  ["01", "One calm source of truth", "Rooms, rent, repairs, and residents — gathered with intention."],
  ["02", "A welcome that works", "Give every resident a simple, thoughtful way to stay in the loop."],
  ["03", "Less chasing, more hosting", "Automate the small reminders so your house can feel like home."],
];

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid size-10 place-items-center rounded-xl bg-white overflow-hidden">
        <img src="/logo.png" alt="BoardingHow Logo" className="w-full h-full object-cover" />
      </div>
      <span className={`font-['DM_Sans'] text-[18px] font-bold tracking-[-0.03em] ${light ? "text-[#fffdf8]" : "text-foreground"}`}>
        Boarding<span className={light ? "text-[#e6b65c]" : "text-primary"}>How</span>
      </span>
    </div>
  );
}

interface HomePageProps {
  onGoToLogin: () => void;
}

export default function HomePage({ onGoToLogin }: HomePageProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f0e6] font-['DM_Sans'] text-foreground selection:bg-[#e6b65c]/45">
      <nav className="relative z-20 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12 lg:py-7">
        <BrandMark />
        <div className="hidden items-center gap-8 lg:flex">
          <a href="#how" className="text-sm font-medium text-muted-foreground transition hover:text-primary">How it works</a>
          <a href="#why" className="text-sm font-medium text-muted-foreground transition hover:text-primary">Why BoardingHow</a>
          <a href="#stories" className="text-sm font-medium text-muted-foreground transition hover:text-primary">Stories</a>
        </div>
        <div className="hidden items-center gap-4 lg:flex">
          <button onClick={onGoToLogin} className="text-sm font-semibold text-primary">Log in</button>
          <button onClick={onGoToLogin} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_7px_16px_rgba(31,81,73,.16)] transition hover:-translate-y-0.5">Start your house</button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-full border border-border bg-card lg:hidden" aria-label="Open menu">{menuOpen ? <X size={19} /> : <Menu size={20} />}</button>
      </nav>

      {menuOpen && (
        <div className="absolute inset-x-4 top-[76px] z-30 rounded-2xl border border-border bg-card p-4 shadow-xl lg:hidden">
          <div className="grid gap-1">
            <a href="#how" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">How it works</a>
            <a href="#why" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium">Why BoardingHow</a>
            <button onClick={onGoToLogin} className="mt-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground">Log in to BoardingHow</button>
          </div>
        </div>
      )}

      <section className="relative mx-auto grid max-w-[1320px] gap-12 px-5 pb-20 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-12 lg:pb-28 lg:pt-20">
        <div className="relative z-10 max-w-[630px]">
          <div className="mb-7 flex items-center gap-3"><span className="h-px w-8 bg-[#c79236]" /><p className="font-['DM_Mono'] text-[11px] uppercase tracking-[0.14em] text-[#8c6b37]">Built for people who make a house a home</p></div>
          <h1 className="font-['Libre_Baskerville'] text-[42px] leading-[1.11] tracking-[-0.04em] sm:text-[56px] lg:text-[66px]">A better way to<br /><em className="font-normal text-primary">run your house.</em></h1>
          <p className="mt-7 max-w-[490px] text-[17px] leading-7 text-muted-foreground">BoardingHow brings the moving pieces of shared living into one beautifully simple place. More care, less clutter.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={onGoToLogin} className="group flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_10px_20px_rgba(31,81,73,.18)] transition hover:-translate-y-0.5">Enter BoardingHow <span className="grid size-5 place-items-center rounded-full bg-[#e6b65c] text-primary transition group-hover:translate-x-0.5"><ArrowRight size={13} strokeWidth={3} /></span></button>
            <button className="flex items-center justify-center gap-2 rounded-full border border-border bg-[#fbf8f1]/70 px-6 py-3.5 text-sm font-bold text-primary transition hover:border-primary"><CircleHelp size={17} /> See how it works</button>
          </div>
          <div className="mt-11 flex items-center gap-5">
            <div className="flex -space-x-2">
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#f5f0e6] bg-[#bcd2c4] text-[10px] font-bold text-primary">LM</span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#f5f0e6] bg-[#e6b65c] text-[10px] font-bold text-primary">JC</span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#f5f0e6] bg-[#d1a194] text-[10px] font-bold text-primary">RA</span>
            </div>
            <p className="text-sm text-muted-foreground"><strong className="font-bold text-foreground">1,200+ households</strong> are already settling in.</p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[580px] lg:mr-0">
          <div className="absolute -left-10 top-16 size-20 rounded-full border border-[#1f5149]/20" /><div className="absolute -right-4 bottom-4 size-24 rounded-full bg-[#e6b65c]/35" />
          <div className="relative rotate-[2deg] rounded-[28px] border border-[#2e6057] bg-[#1f5149] p-3 shadow-[18px_22px_0_#ded2bd,25px_29px_40px_rgba(57,52,43,.15)]">
            <div className="overflow-hidden rounded-[19px] bg-[#f9f4e9] p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-[#ded2bd] pb-4"><div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-primary text-[#e6b65c]"><Building2 size={16}/></span><div><p className="text-xs font-bold">The Green House</p><p className="font-['DM_Mono'] text-[8px] uppercase tracking-[.12em] text-muted-foreground">House dashboard</p></div></div><span className="rounded-full bg-[#dceadf] px-2.5 py-1 font-['DM_Mono'] text-[8px] uppercase tracking-[.09em] text-primary">All well</span></div>
              <div className="grid grid-cols-3 gap-2 py-4"><div className="rounded-xl bg-[#e6efe8] p-3"><p className="font-['DM_Mono'] text-[8px] uppercase tracking-[.08em] text-primary">Occupied</p><p className="mt-1.5 text-xl font-bold text-primary">18<span className="text-xs font-normal text-muted-foreground">/20</span></p></div><div className="rounded-xl bg-[#f2e3c1] p-3"><p className="font-['DM_Mono'] text-[8px] uppercase tracking-[.08em] text-[#876127]">Due today</p><p className="mt-1.5 text-xl font-bold text-[#5f4825]">3</p></div><div className="rounded-xl bg-[#eee4d6] p-3"><p className="font-['DM_Mono'] text-[8px] uppercase tracking-[.08em] text-muted-foreground">Open tasks</p><p className="mt-1.5 text-xl font-bold">5</p></div></div>
              <div className="grid gap-2"><div className="flex items-center justify-between rounded-xl border border-[#e4dbcd] bg-white/50 px-3 py-2.5"><div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-full bg-[#d6e4d7] text-primary"><Check size={13} strokeWidth={3}/></span><span className="text-[11px] font-semibold">Rent reminders sent</span></div><span className="font-['DM_Mono'] text-[9px] text-muted-foreground">09:00</span></div><div className="flex items-center justify-between rounded-xl border border-[#e4dbcd] bg-white/50 px-3 py-2.5"><div className="flex items-center gap-2.5"><span className="grid size-7 place-items-center rounded-full bg-[#f1deb3] text-[#8a6729]"><Sparkles size={13} /></span><span className="text-[11px] font-semibold">Welcome Sora to Room 04</span></div><ChevronRight size={15} className="text-muted-foreground" /></div></div>
            </div>
          </div>
          <div className="absolute -bottom-6 -left-2 rounded-xl border border-[#d9cbb4] bg-[#fffaf0] px-4 py-3 shadow-lg sm:-left-6"><p className="font-['DM_Mono'] text-[8px] uppercase tracking-[.12em] text-muted-foreground">This month</p><p className="mt-1 text-sm font-bold">92% <span className="font-normal text-muted-foreground">paid on time</span></p></div>
        </div>
      </section>

      {/* HOW IT WORKS / FEATURES */}
      <section id="how" className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 text-center">
          <p className="font-['DM_Mono'] text-[11px] uppercase tracking-[.14em] text-[#8c6b37]">Features</p>
          <h2 className="mt-4 font-['Libre_Baskerville'] text-[33px] leading-[1.22] tracking-[-.035em] sm:text-[42px]">Everything you need, nothing you don't.</h2>
          <p className="mx-auto mt-4 max-w-[500px] text-muted-foreground">BoardingHow simplifies the core tasks of managing a shared living space so you can focus on creating a great environment.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <CreditCard size={20} className="text-emerald-600" />, title: "Rent Tracking", desc: "Automated due dates, simple payment logging, and visual collection rates.", bg: "bg-emerald-50" },
            { icon: <Wrench size={20} className="text-blue-600" />, title: "Maintenance", desc: "Residents submit requests, you assign them to staff, everyone stays updated.", bg: "bg-blue-50" },
            { icon: <MessageCircle size={20} className="text-amber-600" />, title: "Announcements", desc: "Broadcast important house updates, water interruptions, or cleaning schedules.", bg: "bg-amber-50" },
            { icon: <Users size={20} className="text-purple-600" />, title: "Role Access", desc: "Unique dashboards for Admins, Staff, and Residents to keep things organized.", bg: "bg-purple-50" }
          ].map((feat, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
              <div className={`mb-4 inline-flex rounded-xl p-3 ${feat.bg}`}>
                {feat.icon}
              </div>
              <h3 className="mb-2 text-lg font-bold">{feat.title}</h3>
              <p className="text-sm text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY BOARDINGHOW */}
      <section id="why" className="border-y border-[#ded2bd] bg-[#eee5d6] py-20 lg:py-28">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-['DM_Mono'] text-[11px] uppercase tracking-[.14em] text-[#8c6b37]">Not another noisy dashboard</p>
              <h2 className="mt-4 max-w-[620px] font-['Libre_Baskerville'] text-[33px] leading-[1.22] tracking-[-.035em] sm:text-[42px]">The behind-the-scenes work, given a little grace.</h2>
            </div>
            <button onClick={onGoToLogin} className="w-fit text-sm font-bold text-primary hover:underline">Explore the workspace <ArrowRight className="ml-1 inline" size={15}/></button>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[#d8cdbb] bg-[#d8cdbb] md:grid-cols-3">
            {benefits.map(([number, title, text]) => (
              <article key={number} className="bg-[#fbf8f1] p-7 transition hover:bg-white sm:p-8">
                <span className="font-['DM_Mono'] text-[11px] text-[#b28339]">{number}</span>
                <h3 className="mt-10 font-['Libre_Baskerville'] text-[23px] leading-[1.35] tracking-[-.03em]">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* STORIES / TESTIMONIALS */}
      <section id="stories" className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mb-12 text-center">
          <p className="font-['DM_Mono'] text-[11px] uppercase tracking-[.14em] text-[#8c6b37]">Stories</p>
          <h2 className="mt-4 font-['Libre_Baskerville'] text-[33px] leading-[1.22] tracking-[-.035em] sm:text-[42px]">Trusted by houses everywhere.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-[#fbf8f1] p-8 shadow-sm">
            <div className="mb-6 flex text-[#e6b65c]"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
            <Quote size={32} className="mb-4 text-[#d9cbb4]" />
            <p className="mb-6 text-lg leading-relaxed text-foreground">"Before BoardingHow, tracking who paid what and when was a nightmare of spreadsheets and text messages. Now, my tenants have their own portal, and I can see my collection rate at a glance. It's completely changed how I manage my property."</p>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full bg-[#1f5149] text-lg font-bold text-white">MS</div>
              <div>
                <p className="font-bold">Maria Santos</p>
                <p className="text-sm text-muted-foreground">House Manager, Sunrise Dorm</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6 flex text-[#e6b65c]"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
            <Quote size={32} className="mb-4 text-border" />
            <p className="mb-6 text-lg leading-relaxed text-foreground">"I love having a single place to check my rent balance and submit maintenance requests. The last place I lived at used a group chat for everything, and things always got lost. This feels so much more professional and calm."</p>
            <div className="flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full bg-[#dbeafe] text-lg font-bold text-[#2563eb]">SK</div>
              <div>
                <p className="font-bold">Sora K.</p>
                <p className="text-sm text-muted-foreground">Resident, Room 04</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="mx-auto max-w-[1320px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-[#1f5149] px-6 py-16 text-center text-[#fffdf8] shadow-xl sm:px-12 lg:py-24">
          <div className="absolute -right-10 -top-10 size-64 rounded-full bg-[#2a6d63] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-80 rounded-full bg-[#173f39] blur-3xl" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="font-['Libre_Baskerville'] text-[36px] leading-[1.1] tracking-[-.03em] sm:text-[48px]">Ready to bring calm to your house?</h2>
            <p className="mt-6 text-lg text-[#c9d9ce]">Join over 1,200 households already using BoardingHow to manage rent, maintenance, and residents with ease.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button onClick={onGoToLogin} className="w-full rounded-full bg-[#e6b65c] px-8 py-4 font-bold text-[#1d5148] shadow-[0_8px_20px_rgba(230,182,92,.3)] transition hover:-translate-y-1 sm:w-auto">Start your house</button>
              <button onClick={onGoToLogin} className="w-full rounded-full border border-[#c9d9ce] px-8 py-4 font-bold text-white transition hover:bg-white/10 sm:w-auto">Resident login</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#ded2bd] bg-[#f5f0e6] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <BrandMark />
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">The softer system for the serious work of looking after a home.</p>
          </div>
          <div className="flex gap-6 font-['DM_Mono'] text-[10px] uppercase tracking-[.12em] text-muted-foreground"><span>Privacy</span><span>Support</span><span>© 2025</span></div>
        </div>
      </footer>
    </main>
  );
}
