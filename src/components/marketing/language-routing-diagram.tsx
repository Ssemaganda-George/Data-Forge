import { AudioLines, Languages, Sparkles, Gauge, PackageCheck } from "lucide-react";

/**
 * Language routing diagram for the Language & voice studio.
 *
 * Structured HTML/flow (no image) so it stays theme-consistent. The Sunbird AI
 * node is intentionally accent-colored (coral) so a visitor can tell at a
 * glance that there is a dedicated path for African languages.
 */

const CORAL = "#E76F51";
const CORAL_BG = "#FDEEE9";
const CORAL_BORDER = "#F6D3C7";

function Arrow() {
  return (
    <div className="flex justify-center py-2" aria-hidden="true">
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
        <path
          d="M8 0v20M8 20l-5-5M8 20l5-5"
          stroke="#B8C7C5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface NodeProps {
  icon: React.ComponentType<{
    size?: number | string;
    className?: string;
    style?: React.CSSProperties;
  }>;
  title: string;
  subtitle: string;
  bg: string;
  border: string;
  iconColor: string;
  titleColor?: string;
  emphasized?: boolean;
}

function Node({
  icon: Icon,
  title,
  subtitle,
  bg,
  border,
  iconColor,
  titleColor = "#0B2E2C",
  emphasized = false,
}: NodeProps) {
  return (
    <div
      className="rounded-xl px-5 py-4 text-center"
      style={{
        backgroundColor: bg,
        border: `${emphasized ? "1.5px" : "0.5px"} solid ${border}`,
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon size={16} className="shrink-0" style={{ color: iconColor }} />
        <span
          className="text-sm font-semibold"
          style={{ color: titleColor }}
        >
          {title}
        </span>
      </div>
      <p className="mt-1 text-xs text-[#4A6461]">{subtitle}</p>
    </div>
  );
}

export function LanguageRoutingDiagram() {
  return (
    <div>
      <p className="text-sm text-[#4A6461] mb-4">
        Every upload is routed to the transcription engine built for its
        language.
      </p>

      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 md:p-8">
        <div className="mx-auto max-w-md">
          {/* 1. Audio uploaded */}
          <Node
            icon={AudioLines}
            title="Audio uploaded"
            subtitle="Voice memos, recordings, interviews"
            bg="#F7FAF9"
            border="#E5E7EB"
            iconColor="#4A6461"
          />

          <Arrow />

          {/* 2. Detect language */}
          <Node
            icon={Languages}
            title="Detect language"
            subtitle="Route to the right engine"
            bg="#E6F2F2"
            border="#D5E8E8"
            iconColor="#028090"
          />

          {/* Branch */}
          <div className="py-2" aria-hidden="true">
            <svg
              viewBox="0 0 200 28"
              className="w-full h-7"
              preserveAspectRatio="none"
            >
              <path
                d="M100 0v8M100 8H40v20M100 8h60v20"
                stroke="#B8C7C5"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sunbird AI — the differentiator, made to pop */}
            <Node
              icon={Sparkles}
              title="Sunbird AI"
              subtitle="For Luganda and more"
              bg={CORAL_BG}
              border={CORAL_BORDER}
              iconColor={CORAL}
              titleColor={CORAL}
              emphasized
            />
            {/* Groq Whisper — neutral */}
            <Node
              icon={AudioLines}
              title="Groq Whisper"
              subtitle="For other languages"
              bg="#F7FAF9"
              border="#E5E7EB"
              iconColor="#4A6461"
            />
          </div>

          {/* Merge */}
          <div className="py-2" aria-hidden="true">
            <svg
              viewBox="0 0 200 28"
              className="w-full h-7"
              preserveAspectRatio="none"
            >
              <path
                d="M40 0v8M160 0v8M40 8h120M100 8v20"
                stroke="#B8C7C5"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 6. Confidence score */}
          <Node
            icon={Gauge}
            title="Confidence score"
            subtitle="Flag anything uncertain"
            bg="#FDF6E7"
            border="#F5E6BE"
            iconColor="#C4890B"
          />

          <Arrow />

          {/* 8. Export dataset */}
          <Node
            icon={PackageCheck}
            title="Export dataset"
            subtitle="Labeled, with a data card"
            bg="#EAF6EE"
            border="#CDE9D6"
            iconColor="#1B873F"
          />
        </div>
      </div>
    </div>
  );
}
