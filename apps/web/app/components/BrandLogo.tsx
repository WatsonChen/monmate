import Image from "next/image";

type BrandLogoProps = {
  variant?: "mark" | "horizontal" | "slogan";
  className?: string;
};

const assetMap = {
  mark: "/brand/logo-mark.png",
  horizontal: "/brand/logo-horizontal.png",
  slogan: "/brand/logo-slogan.png"
};

export function BrandLogo({
  variant = "horizontal",
  className = ""
}: BrandLogoProps) {
  return (
    <Image
      src={assetMap[variant]}
      alt="MonMate"
      width={variant === "mark" ? 160 : 420}
      height={variant === "mark" ? 160 : 220}
      className={className}
      priority
    />
  );
}
