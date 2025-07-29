import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";

import { useAuth } from "../auth/auth";

import closeIcon from "./assets/close.svg";
import helpIcon from "./assets/help.svg";

const sharedHelpLinks = [
  {
    label: "Nouvelles fonctionnalités",
    url: "https://fabnummas.notion.site/Nouveaut-s-de-l-espace-professionnel-AAP-et-certificateurs-et-de-l-espace-candidat-France-VAE-42e539695d68436abe32fcf4b146c192",
  },
];

const aapHelpLinks = [
  ...sharedHelpLinks,
  {
    label: "Espace documentaire",
    url: "https://fabnummas.notion.site/Espace-documentaire-f697c4fa5fcf42d49d85428b5e0b40c5",
  },
  {
    label: "FAQ AAP",
    url: "https://vae.gouv.fr/faq/",
  },
  {
    label: "En savoir plus sur la VAE",
    url: "https://vae.gouv.fr/savoir-plus/",
  },
];

const certificationAuthorityHelpLinks = [
  ...sharedHelpLinks,
  {
    label: "Espace documentaire",
    url: "https://fabnummas.notion.site/Espace-documentaire-659cdc012ab24c788cefbda97441510b",
  },
  {
    label: "FAQ",
    url: "https://fabnummas.notion.site/FAQ-Certificateurs-1e0653b7be0780d1bcf6d6e6964cac63",
  },
];

export const HelpBubble = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(!open), [open]);

  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  const helpLinks =
    isCertificationAuthority || isCertificationRegistryManager
      ? certificationAuthorityHelpLinks
      : aapHelpLinks;

  return (
    <div className={`flex flex-col ${className || ""}`}>
      {open ? (
        <div className="flex flex-col items-start w-[320px] bg-white rounded-2xl p-6 pt-4 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <h2 className="text-xl font-bold mb-0">Notre aide en ligne</h2>
          <ul className="list-none pl-0">
            {helpLinks.map(({ label, url }) => (
              <li key={url}>
                <Link target="_blank" className="fr-link" href={url}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ToggleButton open={open} onClick={toggle} className="ml-auto mt-5" />
    </div>
  );
};

const ToggleButton = ({
  open,
  className,
  onClick,
}: {
  open: boolean;
  className?: string;
  onClick?: () => void;
}) => (
  <button
    className={`w-[54px] h-[54px] md:w-[60px] md:h-[60px] flex items-center justify-center bg-white shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] rounded-full ${className || ""}`}
    onClick={onClick}
  >
    {open ? (
      <Image src={closeIcon} alt="fermer" />
    ) : (
      <Image src={helpIcon} alt="aide" />
    )}
  </button>
);
