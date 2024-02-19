import Image from "next/image";

const BlockCompetence = ({
  imageUrl,
  imageAlt,
  label,
}: {
  imageUrl: string;
  imageAlt: string;
  label: string;
}) => (
  <div className="flex lg:flex-col items-center gap-4 lg:gap-0 w-full">
    <Image
      src={imageUrl}
      width={88}
      height={88}
      alt={imageAlt}
      className="max-w-14 max-h-14 lg:max-w-none lg:max-h-none"
    />
    <h5 className="text-xl text-[22px] leading-[28px] font-bold lg:w-2/3 mt-2 mb-0">
      {label}
    </h5>
  </div>
);

const QuiPeutFaireUneVAE = () => (
  <section
    id="qui-peut-faire-une-vae"
    className="w-full pt-14 lg:pt-20 pb-20 lg:pb-40 lg:mb-0 mx-auto flex flex-col items-center lg:text-center fr-container"
  >
    <h2 className="text-[28px] leading-9 lg:text-[32px] mb-8 mt-0 text-justify">
      Qui peut faire une VAE sur France VAE ?
    </h2>
    <span className="text-[20px] leading-8 text-justify lg:text-center">
      Le parcours France VAE est accessible à toute personne ayant des
      compétences liées au diplôme visé :
    </span>
    <div className="py-12 flex flex-col sm:flex-row gap-4 lg:gap-[88px] w-full">
      <BlockCompetence
        label="Salariés du secteur privé"
        imageUrl="/home-page/blocks-competences/image-block-competence-salaries-du-secteur-prive.svg"
        imageAlt="Document avec un stylo plume"
      />
      <BlockCompetence
        label="Demandeurs d'emploi"
        imageUrl="/home-page/blocks-competences/image-block-competence-demandeurs-demplois.svg"
        imageAlt="logiciel de recherche d'emploi avec une loupe"
      />
      <BlockCompetence
        label="Volontaires et bénévoles"
        imageUrl="/home-page/blocks-competences/image-block-competence-volontaires-et-benevoles.svg"
        imageAlt="Mains réunies en signe de solidarité"
      />
      <BlockCompetence
        label="Proches aidants"
        imageUrl="/home-page/blocks-competences/image-block-competence-proches-aidants.svg"
        imageAlt="Une main soutenant un coeur en signe de solidarité"
      />
    </div>
    <div className="lg:flex flex-col text-[20px] leading-8 lg:text-xl">
      <span>
        Pour les autres cas, la VAE n'est pas encore possible via France VAE.
      </span>
      <span>
        {" "}
        Renseignez-vous auprès d'un des organismes listés ci-dessous.
      </span>
    </div>
  </section>
);

export default QuiPeutFaireUneVAE;
