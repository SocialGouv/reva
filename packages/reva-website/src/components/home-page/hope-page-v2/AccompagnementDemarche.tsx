import Button from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";
import Link from "next/link";

const AapStepBlock = ({
  description,
  title,
  imageUrl,
  imageAlt,
}: {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
}) => (
  <div className="flex flex-col w-[296px] lg:w-[384px] text-start">
    <Image src={imageUrl} alt={imageAlt} width={384} height={216} />
    <div className="p-6 flex flex-col gap-4">
      <h6 className="text-lg lg:text-xl m-0">{title}</h6>
      <p className="m-0">{description}</p>
    </div>
  </div>
);

const AccompagnementDemarche = () => (
  <section
    id="accompagnement-demarche"
    className="w-full fr-container pb-20 lg:mb-0 mx-auto lg:text-center flex flex-col items-center justify-center gap-8 lg:gap-16"
  >
    <h2 className="text-[28px] lg:text-[32px] leading-9 my-0">
      Un accompagnement dès le début de votre démarche
    </h2>
    <p className="my-0 text-[20px] leading-8">
      Avec France VAE, un architecte-accompagnateur de parcours (professionnel
      spécialisé dans l'accompagnement VAE) vous aide tout au long de votre VAE,
      depuis le diagnostic de vos compétences en début de parcours jusqu'au
      bilan après le passage devant le jury.
    </p>
    <div className="flex flex-col lg:flex-row gap-6 pt-8 w-full items-center lg:items-start">
      <AapStepBlock
        title="Diagnostic de compétences"
        description="Identification des compétences issues de vos expériences en fonction de votre projet."
        imageUrl="/home-page/aap-step-characters/aap-step-character-diagnostic.svg"
        imageAlt="Une femme avec une malette validée"
      />
      <AapStepBlock
        title="Conception du parcours"
        description="Définition des besoins en accompagnement individuel ou collectif, module de formation et périodes d'immersion éventuelles."
        imageUrl="/home-page/aap-step-characters/aap-step-character-conception.svg"
        imageAlt="Deux personnes qui discutent"
      />
      <AapStepBlock
        title="Accompagnement"
        description="Suivi régulier pour vous aider à rédiger votre dossier de validation, puis pour vous préparer à le présenter devant le jury."
        imageUrl="/home-page/aap-step-characters/aap-step-character-accompagnement.svg"
        imageAlt="Deux personnes qui discutent"
      />
    </div>
    <div className="flex flex-col lg:flex-row items-center relative lg:ml-10 text-start  border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 w-full mt-14 lg:mt-0 lg:h-[132px]">
      <Image
        src="/home-page/image-home-character-young-man-glasses.svg"
        width={181}
        height={211}
        alt="Homme portant des lunettes"
        className="relative -top-28 lg:top-0 lg:-left-10"
      />
      <div className="flex flex-col justify-center px-8 pt-8 mt-[-120px] lg:mt-0 lg:p-0 text-justify">
        <h6 className="mb-4 text-lg lg:text-xl">Gestion de l'administratif</h6>
        <p className="my-0">
          Prise en charge administrative de votre dossier, de son financement et
          de la programmation du jury.
        </p>
      </div>
    </div>
    <Link
      href="/savoir-plus/articles/qui-accompagne-a-la-vae"
      className="!bg-none"
    >
      <Button priority="secondary">Qui accompagne à la VAE ?</Button>
    </Link>
  </section>
);

export default AccompagnementDemarche;
