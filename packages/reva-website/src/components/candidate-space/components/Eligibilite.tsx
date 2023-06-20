import {
  SectionHeader,
  SectionParagraph,
  SectionSubHeader,
} from "@/components/section-content/SectionContent";
import Image from "next/image";

export const Eligibilite = () => (
  <section
    id="eligibilite"
    className="relative lg:bg-[url('/candidate-space/home-page/section-background/polygons-section3.svg')] lg:bg-contain bg-no-repeat"
  >
    <div className="fr-container flex flex-col items-center lg:flex-row max-w-[1248px] mx-auto mt-20 lg:mt-[200px] ">
      <div className="px-5 sm:flex-1">
        <header>
          <SectionSubHeader>Éligibilité</SectionSubHeader>
          <SectionHeader>Qui peut faire une VAE ?</SectionHeader>
        </header>
        <SectionParagraph>
          Le dispositif de VAE est accessible à toute personne ayant des
          compétences liées au diplôme visé. Peuvent en bénéficier les salariés
          travaillant dans le secteur privé ou public, demandeurs d'emploi,
          volontaires et bénévoles, élus et responsables syndicaux, proches
          aidants, étudiants, etc.
        </SectionParagraph>
      </div>
      <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
        <Image
          src="/candidate-space/image-eligibilite.png"
          alt=""
          width={1067}
          height={969}
        />
      </div>
    </div>
  </section>
);
