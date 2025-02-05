import Link from "next/link";

const PolygonFinancer = ({
  bgUrl,
  label,
}: {
  bgUrl: string;
  label: string;
}) => (
  <div
    className={`text-lg font-medium leading-snug ${bgUrl} bg-contain bg-no-repeat bg-center p-6 min-h-[248px] min-w-[222px] flex items-center justify-center w-44 text-center`}
  >
    {label}
  </div>
);

const CommentFinancerVotreParcoursHorsPlateforme = () => (
  <section
    id="comment-financer-votre-parcours"
    className="w-full bg-[#1B1B35] text-white py-14 lg:py-[88px]"
  >
    <div className="flex flex-col lg:flex-row justify-center items-center w-full lg:gap-20 fr-container">
      <div className="py-6 flex flex-col gap-14">
        <h2 className="text-white my-0">Comment financer votre parcours ?</h2>
        <p className="my-0 text-lg">
          À l’heure actuelle, il est possible de financer en partie ou
          intégralement un parcours VAE via votre Compte Personnel de Formation
          (CPF) ou par financement personnel. Pour en savoir plus, vous pouvez
          consulter notre article :{" "}
          <Link
            href="https://vae.gouv.fr/savoir-plus/articles/financer-son-accompagnement-vae/"
            target="_blank"
            className="text-[#8585F6]"
          >
            Comment financer son parcours VAE ?
          </Link>
        </p>
      </div>
      <div className="hidden lg:flex flex-col items-center relative">
        <div className="relative top-12">
          <PolygonFinancer
            bgUrl="bg-[url('/candidate-space/polygon-financer/polygon-financer-orange.svg')]"
            label="Mon Compte Formation"
          />
        </div>
        <div className="flex gap-2">
          <PolygonFinancer
            bgUrl="bg-[url('/candidate-space/polygon-financer/polygon-financer-blue.svg')]"
            label="Financement personnel"
          />
          <PolygonFinancer
            bgUrl="bg-[url('/candidate-space/polygon-financer/polygon-financer-pink.svg')]"
            label="Financements complémentaires au CPF (employeurs, régions ou France Travail, autres)"
          />
        </div>
      </div>
    </div>
  </section>
);

const CommentFinancerVotreParcours = () => (
  <CommentFinancerVotreParcoursHorsPlateforme />
);

export default CommentFinancerVotreParcours;
