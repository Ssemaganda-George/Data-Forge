"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";


export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(
    null
  );
  const [error, setError] = useState("");

  async function handleOAuthSignIn(provider: "github" | "google") {
    setError("");
    setOauthLoading(provider);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setOauthLoading(null);
      }
    } catch {
      setError(`Could not start ${provider} sign in. Please try again.`);
      setOauthLoading(null);
    }
  }

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

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => handleOAuthSignIn("github")}
          disabled={oauthLoading !== null || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#0B2E2C] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {oauthLoading === "github" ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
            </svg>
          )}
          Continue with GitHub
        </button>

        <button
          type="button"
          onClick={() => handleOAuthSignIn("google")}
          disabled={oauthLoading !== null || loading}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#0B2E2C] transition-colors hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {oauthLoading === "google" ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.52 12.27c0-.86-.08-1.68-.22-2.47H12v4.68h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.84Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.09A12 12 0 0 0 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l3.99-3.09Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l3.99 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
              />
            </svg>
          )}
          Continue with Google
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-xs text-[#4A6461]">or</span>
        <span className="h-px flex-1 bg-[#E5E7EB]" />
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
