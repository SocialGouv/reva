import {
  SectionHeader,
  SectionParagraph,
  SectionSubHeader,
} from "@/components/section-content/SectionContent";
import Image from "next/image";

export const QuestcequelaVae = () => (
  <section
    id="qu-est-ce-que-la-vae"
    className="relative fr-container max-w-[1248px] flex flex-col items-center lg:items-stretch lg:flex-row-reverse  mx-auto  mt-20 lg:mt-[200px]"
  >
    <div className="flex-1 px-5 mt-24 lg:basis-1/2">
      <header>
        <SectionSubHeader>VAE</SectionSubHeader>
        <SectionHeader>Qu'est-ce que la VAE ?</SectionHeader>
      </header>
      <SectionParagraph>
        C’est une démarche qui vous permet d’obtenir une certification grâce à
        votre expérience, sans retourner en formation. Cette certification peut
        être un diplôme, un titre ou un certificat de qualification
        professionnelle qui doit être inscrite au Répertoire national des
        certifications professionnelles (RNCP).
      </SectionParagraph>
      <SectionParagraph>
        Toutes vos activités passées pourront être prises en compte :
        expériences personnelles et professionnelles, bénévolat, participation à
        des activités de volontariats, activités sportives de haut niveau, etc..
        Ces expériences doivent être en rapport avec le diplôme visé.
      </SectionParagraph>
    </div>
    <div className="relative min-h-[300px] w-2/5 flex-1 lg:basis-1/2">
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
