import {
  SectionParagraph,
  SectionSubHeader,
  SubSectionHeader,
} from "@/components/section-content/SectionContent";
import Button from "@codegouvfr/react-dsfr/Button";

export const CommentCaMarche = () => (
  <section
    id="comment-ca-marche"
    className="mt-20 pb-48 bg-[#1B1B35] text-white"
  >
    <div className="relative w-full mx-auto px-5 lg:space-x-12">
      <div className="w-full mt-[100px] mx-auto text-center">
        <header>
          <SectionSubHeader className="text-[#FEF7DA]">
            Le parcours Reva
          </SectionSubHeader>
          <h1 className="text-white lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px]">
            Comment ça marche ?
          </h1>
        </header>
        <SectionParagraph>
          Découvrez tout le chemin d’une certification Reva d’un candidat:
        </SectionParagraph>
      </div>
      <div className="flex flex-col lg:flex-row mt-[100px] justify-around lg:min-w-[1248px]">
        <section className="w-full lg:w-[450px] lg:h-[400px] lg:pl-[120px] lg:pt-[80px] lg:pr-[32px] lg:bg-[url('/candidate-space/hexa-group-1.svg')] bg-[url('/candidate-space/hexa-gp-sm-1.png')] bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]">
          <header>
            <SubSectionHeader>Confirmation de votre projet</SubSectionHeader>
          </header>
          <SectionParagraph className="!text-[18px] !leading-10 lg:!leading-8">
            Faites un point sur vos compétences et votre objectif professionnel
            avec un architecte accompagnateur de parcours.
          </SectionParagraph>
        </section>
        <section className="w-[360px] lg:w-[450px] lg:h-[400px] lg:pl-[128px] pr-[32px] lg:bg-left-top lg:bg-[url('/candidate-space/hexa-group-2.svg')] bg-[url('/candidate-space/hexa-gp-sm-2.png')] bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]">
          <header>
            <SubSectionHeader>
              Préparation du dossier d’expérience
            </SubSectionHeader>
          </header>
          <SectionParagraph className="!text-[18px] !leading-10 lg:!leading-8">
            Avec un architecte accompagnateur qui vous guidera dans toutes vos
            démarches
          </SectionParagraph>
        </section>
        <section className="w-[360px] lg:w-[450px] lg:h-[400px] lg:pl-[128px] pr-[36px] lg:bg-[url('/candidate-space/hexa-group-3.svg')] bg-[url('/candidate-space/hexa-gp-sm-3.png')]  bg-no-repeat bg-[top_left_20px] px-4 pt-[108px] mb-[50px]">
          <header>
            <SubSectionHeader>Entretien avec le jury</SubSectionHeader>
          </header>
          <SectionParagraph className="!text-[18px] !leading-10 lg:!leading-7">
            Rencontrez des professionnels et des enseignants pour échanger sur
            les compétences décrites dans votre dossier d'expérience. Recevez
            votre résultat dans les jours qui suivent.
          </SectionParagraph>
        </section>
      </div>
    </div>
    <div className="text-center mt-[100px]">
      <Button
        priority="primary"
        className="!bg-white !text-[#000091] mx-4"
        linkProps={{ href: "#" }}
        size="large"
      >
        Démarrez un parcours VAE
      </Button>
      {/* <Button
        priority="primary"
        className="!bg-transparent text-white border-white border-2 mx-4"
        linkProps={{ href: "#" }}
        size="large"
      >
        Tout voir en détails
      </Button> */}
    </div>
  </section>
);
