import { TrackableButton } from "@/components/analytics/trackable-button/TrackableButton";
import {
  SectionParagraph,
  SectionSubHeader,
  SubSectionHeader,
} from "@/components/section-content/SectionContent";

export const CommentCaMarche = () => (
  <section
    id="comment-ca-marche"
    className="mt-20 lg:mt-[200px] pb-48 bg-dsfrGray-altblueFrance"
  >
    <div className="relative w-full mx-auto px-5 lg:space-x-12">
      <div className="w-full mt-[100px] mx-auto text-center">
        <header className="flex flex-col items-center">
          <SectionSubHeader>Le parcours Reva</SectionSubHeader>
          <h1 className=" lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px] max-w-screen-xl">
            Des démarches simplifiées pour les candidats
          </h1>
        </header>
      </div>
      <div className="flex flex-col lg:flex-row mt-[100px] justify-around lg:min-w-[1248px]">
        <section className="w-full lg:w-[450px] lg:h-[400px] lg:pl-[120px] lg:pt-[80px] lg:pr-[32px] lg:bg-[url('/candidate-space/hexa-group-1.svg')] bg-[url('/candidate-space/hexa-gp-sm-1.png')] bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]">
          <div className="flex flex-col lg:ml-6 text-white">
            <header>
              <SubSectionHeader>Confirmation de votre projet</SubSectionHeader>
            </header>
            <SectionParagraph className="!text-base !leading-10 lg:!leading-8  lg:-mt-2">
              Faites un point sur vos compétences et votre objectif
              professionnel avec un architecte accompagnateur de parcours.
            </SectionParagraph>
          </div>
        </section>
        <section className="w-[360px] lg:w-[450px] lg:h-[400px] lg:pl-[128px] pr-[32px] lg:bg-left-top lg:bg-[url('/candidate-space/hexa-group-2.svg')] bg-[url('/candidate-space/hexa-gp-sm-2.png')] bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]">
          <div className="flex flex-col lg:-mt-6 text-white">
            <header>
              <SubSectionHeader>
                Préparation du dossier d’expérience
              </SubSectionHeader>
            </header>
            <SectionParagraph className="!text-base !leading-10 lg:!leading-8  lg:-mt-2">
              Avec un architecte accompagnateur qui vous guidera dans toutes vos
              démarches
            </SectionParagraph>
          </div>
        </section>
        <section className="w-[360px] lg:w-[450px] lg:h-[400px] lg:pl-[128px] pr-[36px] lg:bg-[url('/candidate-space/hexa-group-3.svg')] bg-[url('/candidate-space/hexa-gp-sm-3.png')]  bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]">
          <div className="flex flex-col lg:-mt-9 lg:ml-5 text-white">
            <header>
              <SubSectionHeader>Entretien avec le jury</SubSectionHeader>
            </header>
            <SectionParagraph className="!text-base !leading-10 lg:!leading-7 lg:-mt-2">
              Rencontrez des professionnels et des enseignants pour échanger sur
              les compétences décrites dans votre dossier d'expérience. Recevez
              votre résultat dans les jours qui suivent.
            </SectionParagraph>
          </div>
        </section>
      </div>
    </div>
    <div className="text-center mt-[100px]">
      <TrackableButton
        eventTracked={{
          location: "Espace candidat",
          event: "Click sur 'Démarrez un parcours VAE'",
        }}
        priority="primary"
        className="!bg-white !text-[#000091] mx-4"
        linkProps={{ href: "/app" }}
        size="large"
      >
        Démarrez un parcours VAE
      </TrackableButton>
    </div>
  </section>
);
