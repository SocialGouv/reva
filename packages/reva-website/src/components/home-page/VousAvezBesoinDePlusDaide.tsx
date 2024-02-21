import Image from "next/image";
import Link from "next/link";

const ArrowRight = ({ className }: { className?: string }) => (
  <span
    className={`fr-icon-arrow-right-line fr-icon--lg ${className || ""}`}
    aria-hidden="true"
  />
);

const PolygonService = ({
  imageUrl,
  imageAlt,
  label,
  urlLink,
}: {
  imageUrl: string;
  imageAlt: string;
  label: string;
  urlLink: string;
}) => (
  <Link
    href={urlLink}
    target="_"
    style={{ backgroundImage: "none" }}
    className="w-full"
  >
    <div className="flex flex-col items-center lg:flex-row ">
      <div className="w-full h-[136px] lg:max-w-none lg:max-h-none flex lg:flex-col justify-center items-center lg:w-[240px] lg:h-[248px] bg-[url('/home-page/polygons-services/polygon-service-background.svg')] hover:bg-[url('/home-page/polygons-services/polygon-service-background-hover.svg')] bg-contain bg-no-repeat lg:bg-cover bg-center">
        <Image
          src={imageUrl}
          width={147}
          height={48}
          alt={imageAlt}
          className="min-h-6  max-w-[72px] max-h-6 lg:max-w-none lg:max-h-12 lg:h-12"
        />
        <span className="hidden lg:block text-base font-bold px-4 mt-2 text-center">
          {label}
        </span>
      </div>
      <span className="block lg:hidden text-sm font-bold mt-2 text-center">
        {label}
      </span>
    </div>
  </Link>
);

const VousAvezBesoinDePlusDaide = () => (
  <section
    id="vous-avez-besoin-de-plus-daide"
    className="w-full pb-14 lg:pb-36 lg:mb-0 flex flex-col sm:flex-row justify-between gap-10 fr-container"
  >
    <div className="flex flex-col py-4 gap-6 lg:gap:0 mb-6 lg:mb-0 lg:w-[368px]">
      <h3 className="text-2xl lg:text-[28px] leading-9 text-center lg:text-start my-0">
        Vous avez besoin de plus d'aide pour vous orienter ?
      </h3>
      <ArrowRight className="text-right self-center rotate-90 lg:rotate-0 lg:self-end" />
    </div>
    <div className="flex flex-col lg:flex-row gap-y-6 lg:gap-6 w-full lg:w-auto">
      <div className="flex w-full lg:gap-6">
        <PolygonService
          imageAlt="Bâtiment public"
          imageUrl="/home-page/polygons-services/polygon-service-point-relais-conseil.svg"
          label="Point-relais conseil"
          urlLink="https://airtable.com/appQT21E7Sy70YfSB/shrgvhoKYW1EsXUu5/tblQgchiTKInxOqqr"
        />
        <PolygonService
          imageAlt="Mon conseil en évolution professionnelle"
          imageUrl="/home-page/polygons-services/polygon-service-conseil-evolution-professionnelle.svg"
          label="Conseiller en évolution professionnelle"
          urlLink="https://mon-cep.org/"
        />
      </div>
      <div className="w-1/2 lg:w-full self-center">
        <PolygonService
          imageAlt="Logo transition professionnelle"
          imageUrl="/home-page/polygons-services/polygon-service-association-de-transition-professionnelle.svg"
          label="Association de transition professionnelle"
          urlLink="https://www.transitionspro.fr/"
        />
      </div>
    </div>
  </section>
);

export default VousAvezBesoinDePlusDaide;
