import Image from "next/image";

import logo from "./assets/france_competences_logo.png";

export const FranceCompetencesLogo = () => (
  <Image
    src={logo.src}
    alt="Logo France Compétences"
    width={140}
    height={40}
    className="hidden md:block"
  />
);
