import {
  SectionHeader,
  SectionParagraph,
  SectionSubHeader
} from "@/components/section-content/SectionContent";
import Image from "next/image";

export const QuestcequelaVae = () => (
  <section
    id="valorisation-competences"
    className="w-full max-w-[1248px] mx-auto relative sm:flex sm:flex-row-reverse !mt-[200px] overflow-y-visible overflow-x-hidden sm:mt-24"
  >
    <div className="flex-1 px-5 mt-24 sm:mt-0">
      <header>
        <SectionSubHeader className="text-[#000091]">
          France VAE
        </SectionSubHeader>
        <SectionHeader>Qu'est-ce que la VAE ?</SectionHeader>
      </header>
      <SectionParagraph>
        Elle vous permet d’obtenir une certification grâce à votre expérience,
        sans retourner en formation. Cette certification peut être un diplôme,
        un titre ou un certificat de qualification professionnelle qui doit être
        inscrite au{" "}
        <strong>Répertoire national des certifications professionnelles</strong>
        .
      </SectionParagraph>
      <SectionParagraph>
        Toutes vos activités passées pourront être prises en compte :
        personnelles et professionnelles, bénévolat, participation à des
        activités d’économie solidaire, etc. Ces expériences doivent être en
        rapport avec la certification visée.
      </SectionParagraph>
    </div>
    <div className="absolute top-0 right-0 w-48 h-48 -mr-[72px] sm:relative sm:flex-0 sm:mr-0 sm:h-auto sm:w-2/5 sm:-ml-24 lg:ml-0 lg:flex-1 lg:w-auto">
      <Image
        src="/candidate-space/image-red-cap.png"
        className=""
        alt="Illustration VAE"
        fill={true}
        style={{
          objectFit: "contain",
        }} />
    </div>
  </section>
);
