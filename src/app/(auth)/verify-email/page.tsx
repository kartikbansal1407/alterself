import Link from "next/link";
import { MailCheck } from "lucide-react";

export default function VerifyEmailPage() {
  return <div className="auth-card centered-card"><MailCheck className="status-icon" /><p className="eyebrow">VERIFY YOUR EMAIL</p><h1>Check your inbox</h1><p className="auth-intro">When cloud accounts are connected, your secure verification link will appear in the email you provided.</p><Link className="button button-primary" href="/login">Return to login</Link></div>;
}

