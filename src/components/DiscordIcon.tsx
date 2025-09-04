import { FaDiscord } from 'react-icons/fa';

interface DiscordIconProps {
  url: string;
  className?: string;
}

export function DiscordIcon({ url, className = "" }: DiscordIconProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center p-3 rounded-full bg-[#5865F2] hover:bg-[#4752C4] transition-colors ${className}`}
    >
      <FaDiscord className="text-white text-2xl" />
    </a>
  );
}