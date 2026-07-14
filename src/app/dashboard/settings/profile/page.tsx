"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to update profile." });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully." });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">Loading profile...</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage your account details.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="max-w-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Email
          </label>
          <Input
            value={email}
            disabled
            className="max-w-sm bg-gray-50 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-400">Email cannot be changed.</p>
        </div>

        {message && (
          <p className={`text-xs ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <Button type="submit" loading={saving} disabled={saving}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
