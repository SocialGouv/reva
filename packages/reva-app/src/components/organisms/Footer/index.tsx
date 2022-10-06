import { FC } from "react";

import logoImg from "../../atoms/Logo/logo.png";

const Divider = () => <span className="text-gray-400">|</span>;
const Link: FC<{ href: string }> = ({ children, href }) => (
  <a className="hover:text-gray-900" href={href}>
    {children}
  </a>
);
export const Footer = () => (
  <footer>
    <div className="w-full hidden sm:flex items-end justify-center text-gray-600 text-sm pb-6">
      <div className="space-x-2">
        <Link href="https://reva.incubateur.net/">Site Reva</Link>
        <Divider />
        <Link href="https://reva.incubateur.net/mentions-l%C3%A9gale">
          Mentions légales
        </Link>
        <Divider />
        <Link href="https://reva.incubateur.net/politique-de-confidentialit%C3%A9">
          Données personnelles
        </Link>
      </div>
    </div>
    <div className="fixed bottom-0 left-0 hidden sm:block p-6">
      <a href="https://reva.incubateur.net/">
        <img className="h-6" src={logoImg} />
      </a>
    </div>
  </footer>
);
