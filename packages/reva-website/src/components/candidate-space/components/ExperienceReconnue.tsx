import {
  SectionHeader,
  SectionParagraph
} from "@/components/section-content/SectionContent";
import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export const ExperienceReconnue = () => (
  <section
    id="avenir-professionnel"
    className="w-full max-w-[1248px] mx-auto !mt-[200px] overflow-x-hidden sm:flex lg:items-center"
  >
    <div className="px-5 sm:flex-1">
      <header>
        <SectionHeader>Votre expérience reconnue par un diplôme</SectionHeader>
      </header>
      <SectionParagraph className="font-bold">
        La VAE ou Validation des Acquis de l’Expérience, est la troisième voie
        d’accès à un diplôme en France depuis 2002.
      </SectionParagraph>

      <div className="flex flex-col items-center sm:items-start space-y-4">
        <Button
          priority="primary"
          className="!w-full sm:!w-auto justify-center"
          linkProps={{ href: "/app" }}
          size="large"
        >
          Démarrez un parcours VAE
        </Button>
      </div>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <Image
        src="/candidate-space/image-prof.png"
        className=""
        alt="image compte validé"
        width={1067}
        height={969} />
    </div>
  </section>
);
