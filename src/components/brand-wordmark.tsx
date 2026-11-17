import Image from "next/image";

type BrandWordmarkProps = {
  tone: "white" | "black";
  name: string;
  className?: string;
  priority?: boolean;
};

const SOURCES = {
  white: "/brand/las-flores-wordmark-white.svg",
  black: "/brand/las-flores-wordmark-black.svg",
} as const;

export function BrandWordmark({
  tone,
  name,
  className = "",
  priority = false,
}: BrandWordmarkProps) {
  return (
    <Image
      className={`brand-wordmark ${className}`.trim()}
      src={SOURCES[tone]}
      alt={name}
      width={1024}
      height={385}
      priority={priority}
      unoptimized
    />
  );
}
