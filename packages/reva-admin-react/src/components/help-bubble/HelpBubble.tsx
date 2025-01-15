import { useState, useCallback } from "react";
import helpIcon from "./assets/help.svg";
import closeIcon from "./assets/close.svg";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../auth/auth";

const aapHelpLinks = [
  {
    label: "Nouvelles fonctionnalités",
    url: "https://www.notion.so/fabnummas/Nouveaut-s-produit-42e539695d68436abe32fcf4b146c192?pvs=4",
  },
  {
    label: "Espace documentaire",
    url: "https://www.notion.so/fabnummas/f697c4fa5fcf42d49d85428b5e0b40c5?v=9f55d3b4b2e54bd19d390ebe6febe3ea",
  },
  {
    label: "Cahier des charges AAP",
    url: "https://fabnummas.notion.site/Cahier-des-charges-ea8790303ab447cfb25b5c11c26b0d67",
  },
  {
    label: "En savoir plus sur la VAE",
    url: "https://vae.gouv.fr/savoir-plus/",
  },
  {
    label: "FAQ AAP",
    url: "https://vae.gouv.fr/faq/",
  },
  {
    label: "Calendrier des webinaires",
    url: "https://fabnummas.notion.site/Calendrier-des-webinaires-b93fb857a9ab458e934802ebbc605073",
  },
];

const certificationAuthorityHelpLinks = [
  {
    label: "Nouvelles fonctionnalités",
    url: "https://fabnummas.notion.site/Nouveaut-s-de-l-espace-professionnel-AAP-et-certificateurs-et-de-l-espace-candidat-France-VAE-42e539695d68436abe32fcf4b146c192",
  },
  {
    label: "Espace documentaire",
    url: "https://fabnummas.notion.site/Espace-documentaire-des-certificateurs-France-VAE-659cdc012ab24c788cefbda97441510b?pvs=4",
  },
  {
    label: "FAQ",
    url: "https://vae.gouv.fr/faq/",
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
          <h1 className="text-xl font-bold mb-0">Notre aide en ligne</h1>
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
