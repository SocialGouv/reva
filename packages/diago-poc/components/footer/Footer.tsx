import Image from "next/image";
import { ReactNode } from "react";

const Divider = () => <span className="text-gray-400">|</span>;

interface LinkProps {
    children: ReactNode;
    href: string;
    target: string;
}

const Link = ({
  children,
  href,
  target = "_self",
}: LinkProps) => (
  <a className="hover:text-gray-900" href={href} target={target}>
    {children}
  </a>
);

export const Footer = () => (
  <footer className="flex-none">
    <div className="relative">
        <div className="w-full hidden sm:flex items-end justify-center text-gray-600 text-sm pb-6">
            <div className="space-x-2">
                <Link href="https://reva.beta.gouv.fr/" target="_blank">
                Site Reva
                </Link>
                <Divider />
                <Link href="https://reva.beta.gouv.fr/cgu" target="_blank">
                CGU
                </Link>
                <Divider />
                <Link href="https://reva.beta.gouv.fr/mentions-l%C3%A9gale" target="_blank">
                Mentions légales
                </Link>
                <Divider />
                <Link href="https://reva.beta.gouv.fr/politique-de-confidentialit%C3%A9" target="_blank">
                Données personnelles
                </Link>
            </div>
        </div>
        <div className="absolute bottom-0 left-0 hidden sm:block p-6">
            <a href="/" className="relative block h-6 w-[3.75rem]" >
                <Image alt="Reva" fill={true} src="/logo.png"  />
            </a>
        </div>
    </div>
  </footer>
);
