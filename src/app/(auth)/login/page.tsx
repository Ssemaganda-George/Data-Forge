"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
      } else {
        if (data.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#0B2E2C]">Sign in</h2>
        <Link
          href="/"
          className="text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
          aria-label="Cancel and go back"
        >
          <X size={18} />
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
        {error && (
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

      <p className="mt-6 text-center text-xs text-[#4A6461]">
        No account?{" "}
        <Link href="/signup" className="text-[#028090] hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
