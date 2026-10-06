"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";

type Mode = "login" | "register" | "forgot" | "reset";

const copy = {
  login: { eyebrow: "WELCOME BACK", title: "Continue your training", submit: "Log in", alternate: "New to AlterEgo?", link: "/register", linkLabel: "Create an account" },
  register: { eyebrow: "CREATE YOUR ACCOUNT", title: "Your form. Your progress.", submit: "Create account", alternate: "Already have an account?", link: "/login", linkLabel: "Log in" },
  forgot: { eyebrow: "ACCOUNT RECOVERY", title: "Reset your password", submit: "Send reset link", alternate: "Remembered your password?", link: "/login", linkLabel: "Return to login" },
  reset: { eyebrow: "CHOOSE A PASSWORD", title: "Set a new password", submit: "Update password", alternate: "Need a new link?", link: "/forgot-password", linkLabel: "Request another" },
} satisfies Record<Mode, { eyebrow: string; title: string; submit: string; alternate: string; link: string; linkLabel: string }>;

export function AuthForm({ mode }: { mode: Mode }) {
  const content = copy[mode];
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "unavailable">("idle");
  const needsPassword = mode !== "forgot";
  const needsName = mode === "register";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    setStatus("submitting");
    window.setTimeout(() => setStatus("unavailable"), 350);
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">{content.eyebrow}</p>
      <h1>{content.title}</h1>
      <p className="auth-intro">Secure cloud accounts will open after the account provider is reviewed and connected.</p>

      <form onSubmit={submit} aria-describedby={status === "unavailable" ? "auth-status" : undefined}>
        {needsName && (
          <label>Display name<input name="name" autoComplete="name" minLength={2} required placeholder="How should we address you?" /></label>
        )}
        {mode !== "reset" && (
          <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
        )}
        {needsPassword && (
          <label>
            <span className="label-row">Password {mode === "login" && <Link href="/forgot-password">Forgot password?</Link>}</span>
            <span className="password-field">
              <input name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required placeholder="At least 8 characters" />
              <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </span>
          </label>
        )}
        {needsName && <label className="check-row"><input type="checkbox" required /> <span>I agree to the privacy notice and understand that coaching features are Beta.</span></label>}
        <button className="button button-primary auth-submit" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : null}
          {content.submit}<ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>

      {status === "unavailable" && <p className="form-status" id="auth-status" role="status">Account service is not connected yet. Your information was not sent or stored.</p>}
      <p className="auth-alternate">{content.alternate} <Link href={content.link}>{content.linkLabel}</Link></p>
    </div>
  );
}

