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
            Le parcours France VAE
          </SectionSubHeader>
          <h1 className="text-white lg:text-[40px] lg:leading-[44px] xl:text-[80px] xl:leading-[88px]">
            Comment ça marche ?
          </h1>
        </header>
        <SectionParagraph>
          Découvrez tout le chemin d’une certification France VAE d’un candidat:
        </SectionParagraph>
      </div>
      <div className="flex flex-row mt-[100px] justify-around min-w-[1248px]">
        <section className="w-[450px] h-[400px] pl-[120px] pt-[80px] pr-[32px] bg-[url('/candidate-space/hexa-group-1.svg')]">
          <header>
            <SubSectionHeader>Confirmation de votre projet</SubSectionHeader>
          </header>
          <SectionParagraph className="!text-[18px] !leading-8">
            Faites le bilan des compétences acquises au cours de votre vie,
            ainsi que le parcours professionnel envisagé
          </SectionParagraph>
        </section>
        <section className="w-[450px] h-[400px] pl-[120px] pt-[80px] pr-[32px] bg-[url('/candidate-space/hexa-group-2.svg')]">
          <header>
            <SubSectionHeader>Envoi du dossier de faisabilité</SubSectionHeader>
          </header>
          <SectionParagraph className="!text-[18px] !leading-8">
            Avec un accompagnateur qui vous aidera dans toutes vos démarches
          </SectionParagraph>
        </section>
        <section className="w-[450px] h-[400px] pl-[120px] pt-[80px] pr-[32px] bg-[url('/candidate-space/hexa-group-3.svg')]">
          <header>
            <SubSectionHeader>Entretien avec le jury</SubSectionHeader>
          </header>
          <SectionParagraph className="!text-[18px] !leading-7">
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
