import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { SectionParagraph } from "@/components/section-content/SectionContent";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Head from "next/head";
import Image from "next/image";

const SuspendedCreationPage = () => {
  return (
    <MainLayout className="py-20 gap-32 lg:gap-64 lg:pb-80">
      <Head>
        <title>
          France VAE | L’outil qui facilite le suivi des candidats à la VAE
        </title>
        <meta
          name="description"
          content="L’espace professionnel centralise le suivi de vos candidats depuis leur inscription jusqu’à leur passage devant le jury."
        />
      </Head>
      <section className="fr-container flex flex-col gap-10 lg:flex-row lg:gap-10">
        <div className="flex flex-col basis-3/5">
          <header>
            <h1>Service indisponible</h1>
          </header>
          <SectionParagraph className="lg:!text-[20px] lg:!leading-[28px]">
            Les inscriptions reprendront courant juin 2024.
          </SectionParagraph>
          <SectionParagraph className="lg:!text-[14px] lg:!leading-[28px]">
            Nous prenons ce temps pour étudier la conformité des dossiers des
            professionnels déjà inscrits. Nous vous invitons à revenir plus tard
            pour rejoindre la communauté France VAE.
          </SectionParagraph>

          <Button
            priority="secondary"
            className="justify-center !w-full lg:!w-fit mt-4"
            linkProps={{ href: "/nous-contacter" }}
            size="large"
          >
            Nous contacter
          </Button>
        </div>

        <div className="relative min-h-[282px] mt-10 lg:mt-0 basis-2/5">
          <Image
            src="/professional-space/creation-suspendue/illustration.svg"
            alt=""
            fill
            style={{
              objectFit: "contain",
            }}
          />
        </div>
      </section>
    </MainLayout>
  );
};

export default SuspendedCreationPage;
