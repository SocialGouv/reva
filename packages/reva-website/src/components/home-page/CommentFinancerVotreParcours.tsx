import Link from "next/link";

const PolygonFinancer = ({
  bgUrl,
  label,
}: {
  bgUrl: string;
  label: string;
}) => (
  <div
    className={`text-lg font-medium ${bgUrl} bg-contain bg-no-repeat bg-center p-6 min-h-[248px] min-w-[222px] flex items-center justify-center w-44 text-center`}
  >
    {label}
  </div>
);

const CommentFinancerVotreParcours = () => (
  <section
    id="comment-financer-votre-parcours"
    className="w-full bg-[#1B1B35] text-white py-14 lg:py-[88px]"
  >
    <div className="flex flex-col lg:flex-row justify-center items-center w-full lg:gap-20 fr-container">
      <div className="py-6 flex flex-col gap-14">
        <h2 className="text-white my-0">Comment financer votre parcours ?</h2>
        <p className="my-0 text-lg">
          Le Ministère du Travail peut financer l'
          <b>ensemble des frais de parcours</b>* d’un des 24 diplômes
          disponibles pour les candidats passant par la plateforme{" "}
          <Link href="https://vae.gouv.fr/" target="_blank">
            vae.gouv.fr
          </Link>{" "}
          et dans la limite du budget disponible. Aucune démarche administrative
          ne sera demandée au candidat pour obtenir ce financement. Aucun
          architecte accompagnateur de parcours ne peut démarrer
          l’accompagnement (dossier de recevabilité inclus) sans l’accord
          express de France VAE de l’accord de financement.
        </p>
      </div>
      <div className="hidden lg:flex flex-col items-center relative">
        <div className="relative top-12">
          <PolygonFinancer
            bgUrl="bg-[url('/home-page/polygon-financer/polygon-financer-orange.svg')]"
            label="*Les frais d'accompagnement"
          />
        </div>
        <div className="flex gap-2">
          <PolygonFinancer
            bgUrl="bg-[url('/home-page/polygon-financer/polygon-financer-blue.svg')]"
            label="*Les frais administratifs"
          />
          <PolygonFinancer
            bgUrl="bg-[url('/home-page/polygon-financer/polygon-financer-pink.svg')]"
            label="*Les actions de formations complémentaires de courte durée"
          />
        </div>
      </div>
      <p className="block lg:hidden my-0 text-lg">
        *Les frais d'accompagnement, administratifs et les actions de formations
        complémentaires de courte durée
      </p>
    </div>
  </section>
);

export default CommentFinancerVotreParcours;
