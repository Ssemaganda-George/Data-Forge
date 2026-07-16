"use client";

import { useState } from "react";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactForm({ isOpen, onClose }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, company, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send inquiry. Please try again.");
      } else {
        setSuccess(true);
        setName("");
        setEmail("");
        setCompany("");
        setMessage("");
        setTimeout(onClose, 2000);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 max-w-md w-full shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#0B2E2C]">Send us an inquiry</h3>
          <button
            onClick={onClose}
            className="text-[#4A6461] hover:text-[#0B2E2C] transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-[#0B2E2C] mb-1">Message sent!</p>
            <p className="text-xs text-[#4A6461]">We&apos;ll get back to you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#4A6461] mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full text-sm rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#0B2E2C] focus:outline-none focus:border-[#028090]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A6461] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-sm rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#0B2E2C] focus:outline-none focus:border-[#028090]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A6461] mb-1">Company / Organization <span className="text-gray-400">(optional)</span></label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full text-sm rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#0B2E2C] focus:outline-none focus:border-[#028090]"
                placeholder="Your company"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4A6461] mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full text-sm rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-[#0B2E2C] focus:outline-none focus:border-[#028090] resize-none"
                placeholder="Tell us about your needs..."
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-medium text-[#0B2E2C] border border-[#E5E7EB] rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="text-xs font-medium text-white bg-[#028090] rounded-md px-3 py-1.5 hover:bg-[#026c78] transition-colors disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send inquiry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
