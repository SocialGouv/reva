import {
  Hexagon,
  SectionHeader,
  SectionParagraph,
  SectionSubHeader
} from "@/components/section-content/SectionContent";

export const Financement = () => (
  <section
    id="financement"
    className="w-full max-w-[1248px] mx-auto mt-[80px] overflow-x-hidden flex flex-wrap lg:flex-no-wrap lg:items-center"
  >
    <div className="px-5">
      <header>
        <SectionHeader>
          Le financement de votre parcours pris en charge
        </SectionHeader>
      </header>
      <SectionParagraph>
        Vous n’avez plus à vous préoccuper du financement de votre parcours.
        Pour faciliter l’accès à la VAE pour tous, France VAE rassemble ce
        financement auprès de différents acteurs publics et privés.
        <br/><br/>
        *hors dispositif particulier de la fonction publique
      </SectionParagraph>
    </div>
    <div className="relative mt-16 -mx-5 sm:mx-0 sm:flex-0 sm:w-2/5 sm:-mr-20 lg:mr-0 lg:flex-1">
      <ul className="flex-1 relative pl-8 lg:p-0 list-none mt-[100px]">
        <li className="mt-24 lg:mt-10">
          <section className="flex lg:space-x-6 space-x-2">
            <div className="-top-4 lg:flex-0 relative w-[60px] h-[60px] text-[#F95C5E]">
              <Hexagon className="absolute w-[55px]" />
            </div>
            <div className="lg: flex-1 text-[#1B1B35]">
              <header>
                <SectionSubHeader>Les frais administratifs</SectionSubHeader>
              </header>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
        <section className="flex lg:space-x-6 space-x-2">
            <div className="-top-4 flex-0 relative w-[60px] h-[60px] text-[#8BF8E7]">
              <Hexagon className="absolute w-[55px]" />
            </div>
            <div className="flex-1 text-[#1B1B35] align-middle">
              <header>
                <SectionSubHeader className="top">
                  Les frais d'accompagnement
                </SectionSubHeader>
              </header>
            </div>
          </section>
        </li>
        <li className="mt-24 lg:mt-10">
          <section className="lg:flex lg:space-x-6">
            <div className="-top-4 flex-0 relative w-[60px] h-[60px] text-[#FBB8F6]">
              <Hexagon className="absolute w-[55px]" />
            </div>
            <div className="flex-1 text-[#1B1B35]">
              <header> 
                <SectionSubHeader className="top">
                  Les actes formatifs complémentaires
                </SectionSubHeader>
              </header>
            </div>
          </section>
        </li>
      </ul>
    </div>
  </section>
);
