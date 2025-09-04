import { FaXTwitter } from 'react-icons/fa6';

interface XIconProps {
  url: string;
  className?: string;
}

export function XIcon({ url, className = "" }: XIconProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center p-3 rounded-full bg-black hover:bg-gray-800 transition-colors ${className}`}
    >
      <FaXTwitter className="text-white text-2xl" />
    </a>
  );
}