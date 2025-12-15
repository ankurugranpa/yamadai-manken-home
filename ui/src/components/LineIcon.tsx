import { FaLine } from 'react-icons/fa';

interface LineIconProps {
  url: string;
  className?: string;
}

export function LineIcon({ url, className = "" }: LineIconProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center p-3 rounded-full bg-[#00B900] hover:bg-[#009900] transition-colors ${className}`}
    >
      <FaLine className="text-white text-2xl" />
    </a>
  );
}