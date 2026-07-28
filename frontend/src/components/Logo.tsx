import tracklyIcon from "../assets/trackly-icon.svg";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 32, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <img src={tracklyIcon} width={size} height={size} alt="Trackly logo" />
      {showText && (
        <span className="font-bold text-lg tracking-tight text-gray-900">
          Trackly
        </span>
      )}
    </div>
  );
}
