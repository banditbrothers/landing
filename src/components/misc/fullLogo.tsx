import Image from "next/image";

const FullLogo = ({ size = 120 }: { size?: number }) => {
  return (
    <Image
      src="/logo-full.svg"
      alt="Bandit Brothers Logo"
      width={size}
      height={size}
      className="rounded-full mr-2"
    />
  );
};

export { FullLogo };
