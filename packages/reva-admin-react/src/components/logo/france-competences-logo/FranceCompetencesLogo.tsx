import logo from "./assets/france_competences_logo.png";

import Image from "next/image";

export const FranceCompetencesLogo = () => (
  <Image
    src={logo.src}
    alt="Logo France Compétences"
    width={140}
    height={40}
    className="hidden md:block"
  />
);
