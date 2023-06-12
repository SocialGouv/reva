import { TrackableButton } from "@/components/analytics/trackable-button/TrackableButton";
import {
  SectionSubHeader,
  SubSectionHeader,
} from "@/components/section-content/SectionContent";
import { ReactNode } from "react";

const HexagonTile = ({
  title,
  largeBgClass,
  smallBgClass,
  children,
}: {
  title: string;
  largeBgClass: string;
  smallBgClass: string;
  children: ReactNode;
}) => (
  <section
    className={`w-[360px] lg:w-[450px] lg:h-[400px] lg:pl-[128px] pr-[32px] lg:bg-left-top ${largeBgClass} ${smallBgClass}  bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]`}
  >
    <div className="flex flex-col  lg:text-white">
      <header>
        <SubSectionHeader className="!text-black lg:!text-white">
          {title}
        </SubSectionHeader>
      </header>
      <div className="lg:-mt-2 lg:pr-4">{children}</div>
    </div>
  </section>
);

export const CommentCaMarche = () => (
  <section
    id="comment-ca-marche"
    className="mt-20 lg:mt-[200px] pb-48 bg-dsfrGray-altblueFrance"
  >
    <div className="relative w-full mx-auto">
      <div className="w-full mt-[100px] mx-auto text-center">
        <header className="flex flex-col items-center">
          <SectionSubHeader>Le parcours France VAE</SectionSubHeader>
          <h1 className=" lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px] max-w-screen-xl">
            Des démarches simplifiées pour les candidats
          </h1>
        </header>
      </div>
      <div className="flex flex-col md:items-center xl:items-start xl:flex-row mt-[100px] justify-around xl:min-w-[1248px]">
        <HexagonTile
          title="Confirmation de votre projet"
          largeBgClass="lg:bg-[url('/candidate-space/hexa-group-1.svg')]"
          smallBgClass="bg-[url('/candidate-space/hexa-gp-sm-1.png')]"
        >
          <p className="text-sm">
            Faites un point sur vos compétences et votre objectif professionnel
            avec un architecte accompagnateur de parcours.
          </p>
        </HexagonTile>
        <HexagonTile
          title="Préparation du dossier d’expérience"
          largeBgClass="lg:bg-[url('/candidate-space/hexa-group-2.svg')]"
          smallBgClass="bg-[url('/candidate-space/hexa-gp-sm-2.png')]"
        >
          <p className="text-sm">
            Avec un architecte accompagnateur qui vous guidera dans toutes vos
            démarches
          </p>
        </HexagonTile>
        <HexagonTile
          title="Entretien avec le jury"
          largeBgClass="lg:bg-[url('/candidate-space/hexa-group-3.svg')]"
          smallBgClass="bg-[url('/candidate-space/hexa-gp-sm-3.png')]"
        >
          <p className="text-sm">
            Rencontrez des professionnels et des enseignants pour échanger sur
            les compétences décrites dans votre dossier d'expérience. Recevez
            votre résultat dans les jours qui suivent.
          </p>
        </HexagonTile>
      </div>
    </div>
    <div className="text-center mt-[100px]">
      <TrackableButton
        eventTracked={{
          location: "Espace candidat",
          event: "Click sur 'Démarrez un parcours VAE'",
        }}
        priority="secondary"
        className="mx-4"
        linkProps={{ href: "/app" }}
        size="large"
      >
        Démarrez un parcours VAE
      </TrackableButton>
    </div>
  </section>
);
