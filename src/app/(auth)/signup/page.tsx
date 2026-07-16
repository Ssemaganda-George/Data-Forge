"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const trialId = searchParams.get("trial");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [error, setError] = useState("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
          trialId: trialId ?? undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (data.needsEmailConfirmation) {
        setNeedsEmailConfirmation(true);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (needsEmailConfirmation) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-8 text-center">
        <p className="text-sm font-medium text-[#0B2E2C] mb-1">Check your email</p>
        <p className="text-sm text-[#4A6461]">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          activate your account, then sign in.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-xs text-[#028090] hover:underline"
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#0B2E2C]">
          Create your account
        </h2>
        <Link
          href="/"
          className="text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
          aria-label="Cancel and go back"
        >
          <X size={18} />
        </Link>
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <Input
          label="Name"
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          autoComplete="name"
        />
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          autoComplete="new-password"
          showPasswordToggle
          passwordVisible={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError("");
          }}
          autoComplete="new-password"
          error={error}
        />
        <Button
          type="submit"
          variant="primary"
          className="w-full justify-center"
          loading={loading}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-[#4A6461]">
        Already have an account?{" "}
        <Link href="/login" className="text-[#028090] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
