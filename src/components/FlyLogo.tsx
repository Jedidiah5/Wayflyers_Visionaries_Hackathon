import Image from "next/image";
import { cn } from "@/lib/utils";
import logoSrc from "@/Fly_intelligence_logo.png";

interface FlyLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function FlyLogo({ size = 32, className, priority = false }: FlyLogoProps) {
  return (
    <Image
      src={logoSrc}
      alt="Fly Intelligence"
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}

export function FlyWordmark({
  showLogo = true,
  logoSize = 28,
  className,
}: {
  showLogo?: boolean;
  logoSize?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2.5 sm:gap-3", className)}
    >
      {showLogo && <FlyLogo size={logoSize} priority />}
      <span className="font-display text-lg uppercase tracking-tight text-text-primary sm:text-2xl">
        Fly Intelligence
      </span>
    </span>
  );
}
