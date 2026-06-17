import { useEffect, useRef, useState } from "react";
import { SessionProvider, type Session } from "@/lib/session-context";

const KEY = "fp_session_v1";
const ACCOUNTS_KEY = "fp_accounts_v1";

type Account = {
  email: string;
  password: string;
  fullName: string;
  storeName: string;
  storeType: string;
  city: string;
  country: string;
  unitSystem: string;
  language: string;
  notifications: boolean;
  avatarDataUrl?: string;
};

function loadAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}
function saveAccounts(a: Account[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "admin">("login");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  function login(s: Session) {
    localStorage.setItem(KEY, JSON.stringify(s));
    setSession(s);
  }
  function logout() {
    localStorage.removeItem(KEY);
    setSession(null);
    setMode("login");
  }

  if (!ready) return null;

  if (session) {
    return (
      <SessionProvider value={{ session, signOut: logout }}>
        {children}
      </SessionProvider>
    );
  }

  return <AuthShell mode={mode} setMode={setMode} onLogin={login} />;
}

function AuthShell({
  mode,
  setMode,
  onLogin,
}: {
  mode: "login" | "signup" | "admin";
  setMode: (m: "login" | "signup" | "admin") => void;
  onLogin: (s: Session) => void;
}) {
  return (
    <div className="min-h-screen w-full bg-[#F0F2F5] flex flex-col">
      {/* Top brand bar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 grid place-items-center text-white shadow-md">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 5 6v6c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-4Z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-slate-800 tracking-tight">Freshness Passport</div>
            <div className="text-[11px] text-slate-500">Food Waste Intelligence Platform</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-1 text-xs text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          All systems operational
        </div>
      </header>

      <main className="flex-1 grid place-items-center px-4 py-6">
        <div className="w-full max-w-[920px]">
          {/* Mode tabs */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex bg-white rounded-full p-1 shadow-sm border border-slate-200">
              <TabBtn active={mode === "login"} onClick={() => setMode("login")}>Sign In</TabBtn>
              <TabBtn active={mode === "signup"} onClick={() => setMode("signup")}>Create Account</TabBtn>
              <TabBtn active={mode === "admin"} onClick={() => setMode("admin")}>Admin</TabBtn>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)] border border-slate-100 overflow-hidden">
            {mode === "login" && <LoginForm onLogin={onLogin} switchToSignup={() => setMode("signup")} />}
            {mode === "signup" && <SignupForm onLogin={onLogin} switchToLogin={() => setMode("login")} />}
            {mode === "admin" && <AdminForm onLogin={onLogin} />}
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-5">
            Demo environment · Visual prototype · No data is transmitted
          </p>
        </div>
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 text-sm rounded-full transition-all ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-semibold"
          : "text-slate-600 hover:text-slate-900 font-medium"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  hint,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="text-[12px] font-semibold text-slate-700 mb-1.5 tracking-tight">{label}</div>
      {children}
      {hint && <div className="text-[10.5px] text-slate-400 mt-1">{hint}</div>}
    </label>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400";

function LoginForm({ onLogin, switchToSignup }: { onLogin: (s: Session) => void; switchToSignup: () => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !pwd) return setErr("Please enter your email and password.");
    const accounts = loadAccounts();
    const found = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    // Demo: accept any account with matching password, or any creds when no account exists yet
    if (found && found.password !== pwd) return setErr("Incorrect password.");
    onLogin({
      email,
      fullName: found?.fullName || email.split("@")[0],
      role: "user",
      storeName: found?.storeName,
    });
  }

  return (
    <div className="px-8 py-9 md:px-12 md:py-12">
      <div className="text-center mb-7">
        <div className="text-xs font-bold text-blue-600 tracking-[0.18em] mb-1.5">WELCOME BACK</div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your dashboard</h1>
        <p className="text-sm text-slate-500 mt-1.5">Access freshness analytics for your stores</p>
      </div>

      <form onSubmit={submit} className="max-w-sm mx-auto space-y-4">
        <Field label="Email Address">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@retailer.com" className={inputCls} autoFocus />
        </Field>
        <Field label="Password">
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••••••" className={inputCls} />
          <div className="text-[11px] text-blue-600 hover:underline mt-1.5 cursor-pointer inline-block">Forgot password?</div>
        </Field>

        {err && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">{err}</div>}

        <button type="submit" className="w-full py-2.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all">
          Sign In →
        </button>

        <div className="text-center text-xs text-slate-500 pt-2">
          New here?{" "}
          <button type="button" onClick={switchToSignup} className="text-blue-600 font-semibold hover:underline">
            Create your account
          </button>
        </div>
      </form>
    </div>
  );
}

function SignupForm({ onLogin, switchToLogin }: { onLogin: (s: Session) => void; switchToLogin: () => void }) {
  const [tab, setTab] = useState<"essentials" | "store" | "prefs">("essentials");
  const [err, setErr] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirm: "",
    role: "Store Manager",
    storeName: "",
    storeType: "Supermarket",
    city: "",
    country: "United Kingdom",
    storeSize: "Medium (1,000–3,000 m²)",
    unitSystem: "Metric (kg, °C)",
    language: "English",
    notifications: true,
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const tabs: { id: typeof tab; label: string; icon: string }[] = [
    { id: "essentials", label: "Essentials", icon: "👤" },
    { id: "store", label: "Store Details", icon: "🏪" },
    { id: "prefs", label: "Preferences", icon: "⚙️" },
  ];

  function next() {
    setErr("");
    if (tab === "essentials") {
      if (!form.fullName || !form.email || !form.password) return setErr("Please fill in name, email and password.");
      if (form.password.length < 6) return setErr("Password must be at least 6 characters.");
      if (form.password !== form.confirm) return setErr("Passwords don't match.");
      setTab("store");
    } else if (tab === "store") {
      if (!form.storeName || !form.city) return setErr("Please enter your store name and city.");
      setTab("prefs");
    }
  }

  function submit() {
    setErr("");
    const accounts = loadAccounts();
    if (accounts.some((a) => a.email.toLowerCase() === form.email.toLowerCase())) {
      return setErr("An account with that email already exists.");
    }
    const account = { ...form };
    saveAccounts([...accounts, account]);
    onLogin({ email: form.email, fullName: form.fullName, role: "user", storeName: form.storeName });
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 bg-gradient-to-b from-white to-slate-50/50">
      <div className="text-center mb-5">
        <div className="text-xs font-bold text-blue-600 tracking-[0.18em] mb-1">CREATE YOUR ACCOUNT</div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set up your Freshness Passport</h1>
      </div>

      {/* Inner pill tabs — match reference */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 rounded-full p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 md:px-5 py-1.5 text-[13px] rounded-full transition-all flex items-center gap-1.5 ${
                tab === t.id
                  ? "bg-blue-600 text-white font-semibold shadow-sm"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <span className="text-[11px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-100/60 rounded-2xl p-6 md:p-8 min-h-[340px]">
        {tab === "essentials" && (
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="mx-auto md:mx-0 flex-shrink-0">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 grid place-items-center text-white text-4xl font-bold shadow-md">
                  {(form.fullName || "?").charAt(0).toUpperCase()}
                </div>
                <button type="button" className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white border border-slate-200 grid place-items-center shadow-md hover:bg-slate-50">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-600"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                </button>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              <Field label="Full Name">
                <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Enter" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Email Address">
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@retailer.com" className={inputCls} />
                </Field>
                <Field label="Role">
                  <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}>
                    <option>Store Manager</option>
                    <option>Regional Manager</option>
                    <option>Sustainability Lead</option>
                    <option>Operations Director</option>
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Password">
                  <input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className={inputCls} />
                </Field>
                <Field label="Confirm Password">
                  <input type="password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} placeholder="••••••••" className={inputCls} />
                </Field>
              </div>
            </div>
          </div>
        )}

        {tab === "store" && (
          <div className="space-y-4">
            <Field label="Store Name">
              <input value={form.storeName} onChange={(e) => set("storeName", e.target.value)} placeholder="e.g. Fresh Market — Notting Hill" className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Store Type">
                <select value={form.storeType} onChange={(e) => set("storeType", e.target.value)} className={inputCls}>
                  <option>Supermarket</option>
                  <option>Hypermarket</option>
                  <option>Convenience Store</option>
                  <option>Discount Store</option>
                  <option>Distribution Center</option>
                </select>
              </Field>
              <Field label="Store Size">
                <select value={form.storeSize} onChange={(e) => set("storeSize", e.target.value)} className={inputCls}>
                  <option>Small (&lt; 1,000 m²)</option>
                  <option>Medium (1,000–3,000 m²)</option>
                  <option>Large (3,000–6,000 m²)</option>
                  <option>Extra Large (&gt; 6,000 m²)</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="London" className={inputCls} />
              </Field>
              <Field label="Country">
                <select value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls}>
                  <option>United Kingdom</option><option>Ireland</option><option>France</option>
                  <option>Germany</option><option>Spain</option><option>Italy</option>
                  <option>Netherlands</option><option>United States</option><option>India</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        {tab === "prefs" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Unit System">
                <select value={form.unitSystem} onChange={(e) => set("unitSystem", e.target.value)} className={inputCls}>
                  <option>Metric (kg, °C)</option>
                  <option>Imperial (lb, °F)</option>
                </select>
              </Field>
              <Field label="Language">
                <select value={form.language} onChange={(e) => set("language", e.target.value)} className={inputCls}>
                  <option>English</option><option>Français</option><option>Deutsch</option>
                  <option>Español</option><option>Italiano</option>
                </select>
              </Field>
            </div>
            <label className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
              <input
                type="checkbox"
                checked={form.notifications}
                onChange={(e) => set("notifications", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-blue-600"
              />
              <div>
                <div className="text-sm font-semibold text-slate-800">Email me freshness alerts</div>
                <div className="text-xs text-slate-500 mt-0.5">Get notified when batches drop below 30% RSL or cold-chain excursions occur.</div>
              </div>
            </label>
            <div className="text-[11px] text-slate-500 bg-blue-50/50 border border-blue-100 rounded-lg p-3">
              By creating an account you agree to our demo Terms of Service & Privacy Policy. No real data is collected.
            </div>
          </div>
        )}
      </div>

      {err && (
        <div className="max-w-md mx-auto mt-4 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg text-center">
          {err}
        </div>
      )}

      <div className="flex items-center justify-between mt-6 max-w-md mx-auto">
        <button
          type="button"
          onClick={switchToLogin}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
        >
          ← Already have an account?
        </button>
        {tab !== "prefs" ? (
          <button
            type="button"
            onClick={next}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Create Account ✓
          </button>
        )}
      </div>
    </div>
  );
}

function AdminForm({ onLogin }: { onLogin: (s: Session) => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!email || !pwd || !code) return setErr("All fields are required.");
    if (code !== "FP-ADMIN-2026") return setErr("Invalid administrator access code.");
    onLogin({ email, fullName: email.split("@")[0], role: "admin" });
  }

  return (
    <div className="grid md:grid-cols-2">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-bold tracking-[0.15em] mb-5 border border-white/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            RESTRICTED ACCESS
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Administrator Console</h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Manage stores, users, role assignments and platform-wide settings for the Freshness Passport network.
          </p>
          <ul className="space-y-2.5 text-xs text-slate-300">
            {[
              "Cross-store analytics & audit logs",
              "User & role management",
              "Tooltip and seed-data registry",
              "Platform configuration & integrations",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400"><polyline points="20 6 9 17 4 12"/></svg>
                {x}
              </li>
            ))}
          </ul>
          <div className="absolute bottom-0 right-0 opacity-20">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M12 2 5 6v6c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-4Z"/></svg>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="p-8 md:p-10 space-y-4">
        <div>
          <div className="text-xs font-bold text-indigo-600 tracking-[0.18em] mb-1">ADMIN SIGN IN</div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verify your credentials</h2>
        </div>

        <Field label="Administrator Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@freshness.io" className={inputCls} />
        </Field>
        <Field label="Password">
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••" className={inputCls} />
        </Field>
        <Field label="Access Code" hint="Demo code: FP-ADMIN-2026">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="FP-ADMIN-XXXX" className={`${inputCls} font-mono tracking-wider uppercase`} />
        </Field>

        {err && <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">{err}</div>}

        <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Enter Admin Console
        </button>

        <p className="text-[10.5px] text-slate-400 text-center leading-relaxed">
          All administrator actions are logged. Unauthorized access is prohibited.
        </p>
      </form>
    </div>
  );
}
