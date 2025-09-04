import { FaInstagram } from 'react-icons/fa';

interface InstagramIconProps {
  url: string;
  className?: string;
}

export function InstagramIcon({ url, className = "" }: InstagramIconProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:from-[#7029A3] hover:via-[#E31B1B] hover:to-[#E66632] transition-colors ${className}`}
    >
      <FaInstagram className="text-white text-2xl" />
    </a>
  );
}