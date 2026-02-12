import Link from "next/link";

interface ContactButtonProps {
  onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  variant?: "primary" | "secondary";
  className?: string;
}

export default function ContactButton({
  onClick,
  variant = "primary",
  className = "",
}: ContactButtonProps) {
  const baseClasses =
    "inline-flex w-full md:w-48 text-white items-center justify-center rounded-[4px] px-4 py-2 md:px-6 md:py-3 text-lg md:text-xl font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary: "bg-pink-400",
    secondary: "bg-blue-1",
  };

  return (
    <Link
      href="#"
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      prefetch={false}
    >
      Contáctanos
    </Link>
  );
}
