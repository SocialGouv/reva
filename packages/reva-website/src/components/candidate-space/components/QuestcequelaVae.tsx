import {
  SectionHeader,
  SectionParagraph,
  SectionSubHeader,
} from "@/components/section-content/SectionContent";
import Image from "next/image";

export const QuestcequelaVae = () => (
  <section
    id="qu-est-ce-que-la-vae"
    className="w-full max-w-[1248px] mx-auto relative sm:flex sm:flex-row-reverse mt-20 lg:mt-[200px] overflow-y-visible overflow-x-hidden sm:mt-24"
  >
    <div className="flex-1 px-5 mt-24 sm:mt-0">
      <header>
        <SectionSubHeader className="text-[#000091]">VAE</SectionSubHeader>
        <SectionHeader>Qu'est-ce que la VAE ?</SectionHeader>
      </header>
      <SectionParagraph>
        C’est une démarche qui vous permet d’obtenir une certification grâce à
        votre expérience, sans retourner en formation. Cette certification peut
        être un diplôme, un titre ou un certificat de qualification
        professionnelle qui doit être inscrite au{" "}
        <u>Répertoire national des certifications professionnelles (RNCP)</u>.
      </SectionParagraph>
      <SectionParagraph>
        Toutes vos activités passées pourront être prises en compte :
        expériences personnelles et professionnelles, bénévolat, participation à
        des activités de volontariats, activités sportives de haut niveau, etc..
        Ces expériences doivent être en rapport avec le diplôme visé.
      </SectionParagraph>
    </div>
    <div className="absolute top-0 right-0 w-48 h-48 -mr-[72px] sm:relative sm:flex-0 sm:mr-0 sm:h-auto sm:w-2/5 sm:-ml-24 lg:ml-0 lg:flex-1 lg:w-auto">
      <Image
        src="/candidate-space/image-questcequelavae.png"
        alt=""
        fill={true}
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  </section>
);
