import { FlyLogo } from "./FlyLogo";

interface AssistantAvatarProps {
  size?: number;
  className?: string;
}

export function AssistantAvatar({
  size = 32,
  className,
}: AssistantAvatarProps) {
  return (
    <FlyLogo
      size={size}
      className={`shrink-0 drop-shadow-[0_0_12px_rgba(200,255,0,0.25)] ${className ?? ""}`}
    />
  );
}
