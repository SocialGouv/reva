import {
  Hexagon,
  SectionHeader,
  SectionParagraph,
  SectionSubHeader,
} from "@/components/section-content/SectionContent";

export const Financement = () => (
  <section
    id="financement"
    className="w-full max-w-[1248px] mx-auto mt-20 lg:mt-[200px] overflow-x-hidden flex flex-col gap-x-24 lg:flex-row lg:items-center"
  >
    <div className="px-5">
      <header>
        <SectionHeader>
          Le financement de votre parcours pris en charge*
        </SectionHeader>
      </header>
      <SectionParagraph>
        Vous n’avez plus à vous préoccuper du financement de votre parcours.
        Pour faciliter l’accès à la VAE pour tous, Reva rassemble ce financement
        auprès de différents acteurs publics et privés.
        <br />
        <br />
        *hors dispositif particulier de la fonction publique
      </SectionParagraph>
    </div>
    <div className="relative mt-10 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <ul className="flex-1 relative pl-8 lg:p-0 list-none lg:mt-[100px]">
        <li className="flex gap-x-2 items-center">
          <div className="text-[#F95C5E]">
            <Hexagon className="w-[55px]" />
          </div>
          <div className="lg:flex-1 text-[#1B1B35]">
            <SectionSubHeader className="mb-0">
              Les frais administratifs
            </SectionSubHeader>
          </div>
        </li>
        <li className="mt-10 flex gap-x-2 items-center">
          <div className="text-[#8BF8E7]">
            <Hexagon className="w-[55px]" />
          </div>
          <div className="flex-1 text-[#1B1B35]">
            <header>
              <SectionSubHeader className="mb-0">
                Les frais d'accompagnement
              </SectionSubHeader>
            </header>
          </div>
        </li>
        <li className="mt-10 flex gap-x-2 items-center">
          <div className="text-[#FBB8F6]">
            <Hexagon className="w-[55px]" />
          </div>
          <div className="flex-1 text-[#1B1B35]">
            <header>
              <SectionSubHeader className="mb-0 pr-2">
                Les actes formatifs complémentaires: de courte durée
              </SectionSubHeader>
            </header>
          </div>
        </li>
      </ul>
    </div>
  </section>
);
