import {
  SectionHeader,
  SectionParagraph,
  SectionSubHeader
} from "@/components/section-content/SectionContent";
import Image from "next/image";

export const Accompagnement = () => (
  <section id="acompagnement" className="mt-20 pb-48 bg-[#F8F8F8]">
    <div className="relative w-full px-5 lg:flex-no-wrap lg:space-x-12">
      <div className="px-5 sm:flex-1 mx-auto max-w-[1208px] text-center mt-[100px]">
        <header>
          <SectionSubHeader className="text-[#000091]">
            Accompagnement
          </SectionSubHeader>
          <SectionHeader>
            Vous êtes guidé dès le début de votre démarche
          </SectionHeader>
        </header>
        <SectionParagraph className="lg:text-justify text-left">
          Un architecte accompagnateur de parcours vous aidera dans la gestion
          administrative de votre dossier VAE dès le début de votre parcours. Ce
          sont des professionnels sélectionnés spécialement par France VAE pour
          leur expertise en développement de compétences.
        </SectionParagraph>
      </div>
      <div className="mx-auto px-10 mt-4 lg:flex lg:flex-no-wrap gap-x-5 text-center lg:text-left">
        <div className="flex-no-wrap lg:flex lg:basis-1/3">
          <div className="min-w-[130px] lg:pt-[24px]">
            <Image className=""
              src="/candidate-space/icon-conception.png"
              alt="image bloc note"
              width={130}
              height={121} />
          </div>
          <div className="ml-3">
            <header>
              <SectionSubHeader className="mb-2">Conception</SectionSubHeader>
            </header>
            <SectionParagraph className="!text-base">
              d’un parcours VAE adapté à votre besoin: accompagnement individuel
              ou collectif, module de formation et période d'immersion
              éventuelles.
            </SectionParagraph>
          </div>
        </div>
        <div className="flex-no-wrap lg:flex lg:basis-1/3">
          <div className="min-w-[130px]">
            <Image
              src="/candidate-space/icon-gestion.png"
              alt="image dossier"
              width={130}
              height={121} />
          </div>
          <div className="ml-3">
            <header>
              <SectionSubHeader className="mb-2">Gestion</SectionSubHeader>
            </header>
            <SectionParagraph className="!text-base">
              de la recevabilité de votre dossier avec le certificateur et de la
              demande de financement.
            </SectionParagraph>
          </div>
        </div>
        <div className="flex-no-wrap lg:flex lg:basis-1/3">
          <div className="min-w-[130px]">
            <Image
              src="/candidate-space/icon-plannification.png"
              alt="image bloc note"
              width={130}
              height={121} />
          </div>
          <div className="ml-3">
            <header>
              <SectionSubHeader className="mb-2">
                Planification
              </SectionSubHeader>
            </header>
            <SectionParagraph className="!text-base">
              de la date de votre passage devant le jury.
            </SectionParagraph>
          </div>
        </div>
      </div>
    </div>
  </section>
);
