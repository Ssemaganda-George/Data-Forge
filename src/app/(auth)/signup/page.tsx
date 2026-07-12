"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconBrandGoogle } from "@tabler/icons-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignUp(e: React.FormEvent) {
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
        setError("Failed to send signup email. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await signIn("google", { callbackUrl: "/" });
  }

  if (sent) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-gray-900 mb-1">Check your email</p>
        <p className="text-sm text-gray-500">
          We sent a magic link to <strong>{email}</strong>. Click it to activate
          your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Create your account
      </h2>

      <Button
        variant="secondary"
        className="w-full justify-center mb-4"
        onClick={handleGoogle}
      >
        <IconBrandGoogle size={16} />
        Sign up with Google
      </Button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2 w-fit mx-auto">
          or continue with email
        </div>
      </div>

      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
          autoComplete="email"
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

      <p className="mt-6 text-center text-xs text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-gray-300">
        By creating an account you agree to our{" "}
        <span className="underline cursor-pointer">Terms of Service</span> and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );
}
