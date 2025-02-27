import Image from "next/image";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import Badge from "@codegouvfr/react-dsfr/Badge";

const Dashboard = () => {
  return (
    <div>
      <p className="text-xl">
        RNCP XXXXX : Titre ingénieur - Ingénieur diplômé du Conservatoire
        national des arts et métiers, spécialité Informatique et cybersécurité
      </p>
      <div className="flex flex-col bg-white lg:flex-row items-center relative text-start border-b-[4px] border-b-[#FFA180] shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)] py-8 px-8 pl-0 w-full mt-32 lg:mt-16 lg:h-[110px]">
        <Image
          src="/candidat/images/image-home-character-young-man-glasses.png"
          width={167}
          height={168}
          alt="Homme portant des lunettes"
          className="relative -top-28 lg:top-0 lg:-left-3"
        />
        <div className="pt-8 mt-[-120px] lg:mt-0 lg:p-0 text-justify">
          <p className="my-0 pl-8">
            Pour envoyer votre candidature, vous devez avoir complété, vos
            informations dans <b>“Mon profil”</b> et toutes les catégories de la
            section <b>“Compléter ma candidature”</b>.
          </p>
        </div>
      </div>
      <div className="grid grid-flow-row lg:grid-flow-col grid-cols-1 lg:grid-cols-3 grid-rows-2 gap-x-6 gap-y-8 mx-auto mt-20 w-full">
        <div className="col-span-1 lg:col-span-2 row-span-1 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
          <div className="bg-white p-4 pl-6">
            <p className="text-xl font-bold my-0 leading-loose">
              <span className="fr-icon-ball-pen-line" /> Compléter ma
              candidature
            </p>
          </div>
          <div className="grid grid-cols-3 grid-rows-2">
            <Tile
              start={<Badge severity="success">complété</Badge>}
              title="Diplôme visé"
              small
              linkProps={{
                href: "#",
              }}
              imageUrl="/candidat/images/pictograms/conclusion.svg"
            />
            <Tile
              start={<Badge severity="success">complété</Badge>}
              title="Diplôme visé"
              small
              linkProps={{
                href: "#",
              }}
              imageUrl="/candidat/images/pictograms/conclusion.svg"
            />
            <Tile
              start={<Badge severity="success">complété</Badge>}
              title="Diplôme visé"
              small
              linkProps={{
                href: "#",
              }}
              imageUrl="/candidat/images/pictograms/conclusion.svg"
            />
            <Tile
              start={<Badge severity="success">complété</Badge>}
              title="Diplôme visé"
              small
              linkProps={{
                href: "#",
              }}
              imageUrl="/candidat/images/pictograms/conclusion.svg"
            />
            <Tile
              start={<Badge severity="success">complété</Badge>}
              title="Diplôme visé"
              small
              linkProps={{
                href: "#",
              }}
              imageUrl="/candidat/images/pictograms/conclusion.svg"
            />
            <Tile
              start={<Badge severity="success">complété</Badge>}
              title="Diplôme visé"
              small
              linkProps={{
                href: "#",
              }}
              imageUrl="/candidat/images/pictograms/conclusion.svg"
            />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 row-span-1">
          <div className="bg-white p-4 pl-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
            <p className="text-xl font-bold my-0 leading-loose">
              <span className="fr-icon-ball-pen-line" /> Suivre mon parcours
            </p>
          </div>
        </div>
        <div className="col-span-1 row-span-2 row-start-1">
          <div className="bg-white p-4 pl-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
            <p className="text-xl font-bold my-0 leading-loose">
              <span className="fr-icon-ball-pen-line" /> Mes prochains
              rendez-vous
            </p>
          </div>
          <div className="bg-white p-4 pl-6 shadow-[0px_6px_18px_0px_rgba(0,0,18,0.16)]">
            <p className="text-xl font-bold my-0 leading-loose">
              <span className="fr-icon-ball-pen-line" /> Mes contacts
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
