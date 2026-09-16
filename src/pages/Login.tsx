import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PawPrint, Mail, Smartphone, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const { user, ready } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"email" | "otp">("email");

  useEffect(() => {
    document.title = "PawPoint — Veterinary Store Sign In";
  }, []);

  useEffect(() => {
    if (ready && user) navigate("/store", { replace: true });
  }, [ready, user, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Brand panel */}
      <div className="relative flex flex-col justify-between overflow-hidden bg-primary p-8 text-primary-foreground lg:w-1/2 lg:p-14">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-foreground/15">
            <PawPrint className="h-6 w-6" />
          </span>
          <span className="font-display text-2xl font-semibold">PawPoint</span>
        </div>
        <div className="py-12">
          <h1 className="font-display max-w-md text-4xl font-semibold leading-tight lg:text-5xl">
            Every tail in town, cared for.
          </h1>
          <p className="mt-4 max-w-md text-base text-primary-foreground/80">
            Pet food, medicine, supplements and store inventory — managed from one calm,
            organised counter.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Browse food, medicine & supplies by pet and category",
              "Add to cart with live stock awareness",
              "Track and restock inventory in one view",
            ].map((line) => (
              <li key={line} className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary-foreground/70" />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/60">
          Demo build — any credentials sign you in.
        </p>
        <PawPrint className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rotate-12 text-primary-foreground/10" />
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-14">
        <div className="w-full max-w-md">
          <h2 className="font-display text-3xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your veterinary store account.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-full border border-border bg-muted p-1">
            {(
              [
                { key: "email", label: "Email & Password", icon: Mail },
                { key: "otp", label: "Mobile OTP", icon: Smartphone },
              ] as const
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                  tab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {tab === "email" ? <EmailForm /> : <OtpForm />}
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring";

function EmailForm() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 4) return setError("Password must be at least 4 characters.");
    login({ method: "email", identifier: email });
    navigate("/store");
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Email address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vet@pawpoint.in"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputCls}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Sign in <ArrowRight className="h-4 w-4" />
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Demo mode — any valid-looking email and password works.
      </p>
    </form>
  );
}

function OtpForm() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [stage, setStage] = useState<"mobile" | "code">("mobile");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [error, setError] = useState("");

  const sendOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile))
      return setError("Enter a valid 10-digit Indian mobile number.");
    const generated = String(Math.floor(100000 + Math.random() * 900000));
    setSentCode(generated);
    setStage("code");
    setError("");
  };

  const verify = (e: FormEvent) => {
    e.preventDefault();
    if (code !== sentCode) return setError("Incorrect OTP. Try again.");
    login({ method: "otp", identifier: `+91 ${mobile}` });
    navigate("/store");
  };

  if (stage === "mobile") {
    return (
      <form onSubmit={sendOtp} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Mobile number</label>
          <div className="flex overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring">
            <span className="flex items-center border-r border-input bg-muted px-3 text-sm text-muted-foreground">
              +91
            </span>
            <input
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="98765 43210"
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
        >
          Send OTP <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">Enter 6-digit OTP</label>
        <input
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="••••••"
          className={cn(inputCls, "text-center text-lg tracking-[0.5em]")}
        />
        <p className="mt-2 rounded-lg bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          Demo OTP for +91 {mobile}: <span className="font-bold">{sentCode}</span>
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
      >
        Verify & Sign in <ShieldCheck className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          setStage("mobile");
          setCode("");
          setError("");
        }}
        className="flex w-full items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Change number / resend
      </button>
    </form>
  );
}
