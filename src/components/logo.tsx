import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <img
      src="/logo-icon.svg"
      alt="YoDataSet"
      width={28}
      height={28}
      className={className}
    />
  );
}
