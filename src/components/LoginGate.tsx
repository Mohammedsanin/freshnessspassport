import { useEffect, useState, type FormEvent } from "react";

const BRAND = {
  company: "Acme Grocers",
  product: "Freshness Passport",
  tagline: "Operational intelligence for every store, every shelf, every batch.",
  domain: "@acmegrocers.com",
  accent: "#1E5BFF",
  accentDark: "#0E3FB8",
};

const STORAGE_KEY = "fp.session.v1";

type Session = { email: string; name: string; role: string; at: number };

function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function useFpSession() {
  const [session, setSession] = useState<Session | null>(() =>
    typeof window === "undefined" ? null : getStoredSession(),
  );
  useEffect(() => {
    const onStorage = () => setSession(getStoredSession());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };
  return { session, setSession, signOut };
}

export default function LoginGate({
  onAuthenticated,
}: {
  onAuthenticated: (s: Session) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes("@") || password.length < 4) {
      setError("Enter a valid work email and password (min 4 characters).");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const name = email
        .split("@")[0]
        .split(/[._-]/)
        .filter(Boolean)
        .map((p) => p[0].toUpperCase() + p.slice(1))
        .join(" ") || "Team Member";
      const session: Session = {
        email,
        name,
        role: "Store Operations Manager",
        at: Date.now(),
      };
      if (remember) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      onAuthenticated(session);
      setLoading(false);
    }, 650);
  };

  const ssoLogin = (provider: string) => {
    const session: Session = {
      email: `demo${BRAND.domain}`,
      name: "Demo User",
      role: `Signed in via ${provider}`,
      at: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    onAuthenticated(session);
  };

  return (
    <div
      className="min-h-screen w-full grid lg:grid-cols-[1.05fr_1fr]"
      style={{ backgroundColor: "#F0F2F5", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Brand panel */}
      <div
        className="relative hidden lg:flex flex-col justify-between p-12 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${BRAND.accentDark} 0%, ${BRAND.accent} 55%, #4A8BFF 100%)`,
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.6) 0px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.5) 0px, transparent 1px)",
            backgroundSize: "28px 28px, 36px 36px",
          }}
        />
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center ring-1 ring-white/25">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8 6 5 9 5 13a7 7 0 0014 0c0-4-3-7-7-11z"
                fill="white"
                opacity="0.95"
              />
              <path d="M12 7v10M8 13l4 4 4-4" stroke={BRAND.accentDark} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div className="text-[13px] font-medium tracking-wider uppercase opacity-80">
              {BRAND.company}
            </div>
            <div className="text-lg font-semibold tracking-tight">{BRAND.product}</div>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-semibold leading-[1.05] tracking-tight">
            Every batch.<br />Every shelf.<br />
            <span className="text-white/80">Accounted for.</span>
          </h1>
          <p className="mt-5 text-white/85 text-[15px] leading-relaxed">{BRAND.tagline}</p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { k: "−38%", v: "Shrink reduction" },
              { k: "142", v: "Active stores" },
              { k: "99.4%", v: "Cold-chain uptime" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl bg-white/10 backdrop-blur-sm ring-1 ring-white/15 p-3">
                <div className="text-xl font-semibold tracking-tight">{s.k}</div>
                <div className="text-[11px] text-white/75 mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/70 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {BRAND.company}. Internal use only.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: BRAND.accent }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 6 5 9 5 13a7 7 0 0014 0c0-4-3-7-7-11z" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] tracking-wider uppercase text-slate-500">{BRAND.company}</div>
              <div className="text-base font-semibold text-slate-900">{BRAND.product}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/70 p-8">
            <div className="mb-6">
              <h2 className="text-[22px] font-semibold text-slate-900 tracking-tight">
                Sign in to your workspace
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Use your <span className="font-medium text-slate-700">{BRAND.company}</span> credentials.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => ssoLogin("Microsoft 365")}
                className="w-full h-11 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700"
              >
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <rect width="7" height="7" fill="#F25022" />
                  <rect x="9" width="7" height="7" fill="#7FBA00" />
                  <rect y="9" width="7" height="7" fill="#00A4EF" />
                  <rect x="9" y="9" width="7" height="7" fill="#FFB900" />
                </svg>
                Continue with Microsoft 365
              </button>
              <button
                onClick={() => ssoLogin("Okta SSO")}
                className="w-full h-11 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-2.5 text-sm font-medium text-slate-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#007DC1">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a4 4 0 110-8 4 4 0 010 8z" />
                </svg>
                Continue with Okta SSO
              </button>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] uppercase tracking-wider text-slate-400">or</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`you${BRAND.domain}`}
                  autoComplete="email"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[var(--fp-accent)] focus:ring-4 focus:ring-[var(--fp-accent)]/15"
                  style={{ ["--fp-accent" as never]: BRAND.accent }}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[12px] font-medium hover:underline"
                    style={{ color: BRAND.accent }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full h-11 rounded-lg border border-slate-200 px-3.5 pr-12 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[var(--fp-accent)] focus:ring-4 focus:ring-[var(--fp-accent)]/15"
                    style={{ ["--fp-accent" as never]: BRAND.accent }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-700"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[var(--fp-accent)]"
                  style={{ ["--fp-accent" as never]: BRAND.accent }}
                />
                Keep me signed in on this device
              </label>

              {error && (
                <div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg text-white text-sm font-semibold transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110"
                style={{ backgroundColor: BRAND.accent }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-[12px] text-slate-500 text-center">
              Need access?{" "}
              <a className="font-medium hover:underline" style={{ color: BRAND.accent }} href="#">
                Contact your {BRAND.company} administrator
              </a>
            </p>
          </div>

          <p className="mt-6 text-[11px] text-slate-400 text-center leading-relaxed">
            Protected by {BRAND.company} security policy. By signing in you agree to the{" "}
            <a className="underline hover:text-slate-600" href="#">Acceptable Use Policy</a> and{" "}
            <a className="underline hover:text-slate-600" href="#">Data Handling Standard</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
