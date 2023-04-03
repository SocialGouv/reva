import {
  SectionHeader,
  SectionParagraph
} from "@/components/section-content/SectionContent";
import Image from "next/image";
import Link from "next/link";

export const Professionnels = () => (
  <section
    id="professionnel"
    className="overflow-y-visible overflow-x-hidden bg-[#E5E5E5]"
  >
    <div className="w-full max-w-[1248px] mt-[100px] mx-auto relative flex flex-col lg:flex-row lg:items-end px-5">
      <div className="lg:pb-20">
        <header>
          <p className="font-bold text-2xl text-[#000091] lg:text-2xl">
            Pour les professionnels
          </p>
          <SectionHeader>Professionnel de la VAE, rejoignez-nous</SectionHeader>
        </header>
        <SectionParagraph>
          Vous voulez accompagner des candidats dans leurs parcours VAE ? Venez
          vous renseigner sur l'espace professionnel.
        </SectionParagraph>
        <Link
          className="fr-link fr-fi-arrow-right-line fr-link--icon-right"
          href="/espace-candidat"
        >
          En savoir plus sur la VAE
        </Link>
      </div>
      <div className="mt-24 flex justify-center space-x-4 lg:flex-1">
        <div className="relative w-44 h-44 sm:w-64 sm:h-64">
          <Image
            src="/home-page/image-young-woman.png"
            className=""
            alt="image compte validé"
            fill={true}
            style={{
              objectFit: "contain",
            }} />
        </div>
        <div className="relative w-44 h-44 sm:w-64 sm:h-64">
          <Image
            src="/home-page/image-businessman.png"
            className=""
            alt="image compte validé"
            fill={true}
            style={{
              objectFit: "contain",
            }} />
        </div>
      </div>
    </div>
  </section>
);
