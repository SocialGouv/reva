import { FC, ReactNode } from "react";

import logoImg from "../../atoms/Logo/logo.png";

const Divider = () => <span className="text-gray-400">|</span>;
const Link: FC<{ href: string; target?: string; children?: ReactNode }> = ({
  children,
  href,
  target = "_self",
}) => (
  <a className="hover:text-gray-900" href={href} target={target}>
    {children}
  </a>
);
export const Footer = () => (
  <footer>
    <div className="w-full hidden sm:flex items-end justify-center text-gray-600 text-sm pb-6">
      <div className="space-x-2">
        <Link href="/" target="_blank">
          Site Reva
        </Link>
        <Divider />
        <Link href="/cgu" target="_blank">
          CGU
        </Link>
        <Divider />
        <Link href="/mentions-l%C3%A9gale" target="_blank">
          Mentions légales
        </Link>
        <Divider />
        <Link href="/politique-de-confidentialit%C3%A9" target="_blank">
          Données personnelles
        </Link>
      </div>
    </div>
    <div className="fixed bottom-0 left-0 hidden sm:block p-6">
      <a href="/">
        <img alt="Reva" className="h-6" src={logoImg} />
      </a>
    </div>
  </footer>
);
