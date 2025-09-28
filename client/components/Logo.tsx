import Image from "next/image";

type LogoProps = {
    height: number;
    width: number;
    className?: string;
};

export default function Logo({ height, width, className }: LogoProps) {
    return <Image src="/logo.png" alt="Logo" height={height} width={width} className={className} />;
}
