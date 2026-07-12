"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "credentials" | "email";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await signIn("email", { email, redirect: false });
      if (res?.error) {
        setError("Failed to send magic link. Please try again.");
      } else {
        setMagicSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (magicSent) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-gray-900 mb-1">Check your email</p>
        <p className="text-sm text-gray-500">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
        <button
          onClick={() => setMagicSent(false)}
          className="mt-4 text-xs text-brand-600 hover:underline"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Sign in</h2>

      <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => setMode("credentials")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
            mode === "credentials"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${
            mode === "email"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Magic link
        </button>
      </div>

      {mode === "credentials" ? (
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            autoComplete="current-password"
            error={error}
            showPasswordToggle
            passwordVisible={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
          {error && mode === "credentials" && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            loading={loading}
          >
            Sign in
          </Button>
        </form>
      ) : (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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
          {error && mode === "email" && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center"
            loading={loading}
          >
            Send magic link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-xs text-gray-400">
        No account?{" "}
        <Link href="/signup" className="text-brand-600 hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
