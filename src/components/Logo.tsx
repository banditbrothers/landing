import Image from "next/image";

function Logo({ size = 120 }: { size?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt="Bandit Brothers Logo"
      width={size}
      height={size}
      className="rounded-full mr-2"
    />
  );
}

export default Logo;
