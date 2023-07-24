import { AdmissibleSectorsInfoPanel } from "@/components/admissible-sectors-info-panel/AdmissibleSectorsInfoPanel";
import { TrackableButton } from "@/components/analytics/trackable-button/TrackableButton";
import {
  SectionHeader,
  SectionParagraph,
} from "@/components/section-content/SectionContent";
import Image from "next/image";

const ArrowRight = () => (
  <span className="fr-icon-arrow-right-line mr-6" aria-hidden="true" />
);

export const ExperienceReconnue = () => (
  <section
    id="experience-reconnue"
    className="w-full flex flex-col lg:flex-row items-center max-w-[1248px] mx-auto mt-20 overflow-x-hidden"
  >
    <div className="px-5 flex-1 lg:basis-3/5">
      <header>
        <SectionHeader>
          Votre expérience enfin reconnue par un diplôme
        </SectionHeader>
      </header>
      <SectionParagraph className="font-bold">
        La VAE, ou Validation des Acquis de l’Expérience, est la troisième voie
        d’accès à un diplôme en France depuis 2002.
      </SectionParagraph>
      <div className="font-bold lg:text-xl mb-4">Vous souhaitez : </div>
      <ul className="list-none pl-0 leading-7 lg:text-lg lg:leading-10 xl:text-2xl mb-8 ml-6">
        <li className="my-2">
          <ArrowRight />
          Faire reconnaitre vos expériences
        </li>
        <li className="my-2">
          <ArrowRight />
          Préparer une reconversion professionnelle
        </li>
        <li className="my-2">
          <ArrowRight />
          Obtenir un meilleur salaire
        </li>
        <li className="my-2">
          <ArrowRight />
          Faire évoluer votre carrière
        </li>
      </ul>
      <p className="lg:text-xl lg:leading-8">
        La VAE est faite pour vous !<br />
        Obtenez un diplôme à votre rythme sans interrompre votre activité
        professionnelle.
      </p>

      <AdmissibleSectorsInfoPanel className="mb-4" />

      <div className="flex flex-col items-center sm:items-start space-y-4">
        <TrackableButton
          eventTracked={{
            location: "Espace candidat",
            event: "Click sur 'Démarrez un parcours VAE'",
          }}
          priority="primary"
          className="!w-full sm:!w-auto justify-center"
          linkProps={{ href: "/app" }}
          size="large"
        >
          Démarrez un parcours VAE
        </TrackableButton>
      </div>
    </div>
    <div className="relative min-h-[300px] min-w-[300px] mt-16 w-1/2 lg:mr-0 lg:basis-2/5">
      <Image
        src="/candidate-space/image-accompagnement.png"
        alt=""
        width={1067}
        height={969}
      />
    </div>
  </section>
);
