import Head from "next/head";
import Image from "next/image";
import { redirect } from "next/navigation";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { SectionParagraph } from "@/components/section-content/SectionContent";
import { isFeatureActive } from "@/utils/featureFlipping";

const SuspendedCreationPage = async () => {
  const isAAPSubscriptionSuspended = await isFeatureActive(
    "AAP_SUBSCRIPTION_SUSPENDED",
  );

  if (!isAAPSubscriptionSuspended) {
    redirect("/espace-professionnel/inscription/");
  }

  return (
    <MainLayout className="py-20 gap-32 lg:gap-24 lg:pb-80">
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
            <h1>Service momentanément indisponible</h1>
          </header>
          <SectionParagraph className="lg:!text-[20px] lg:!leading-[28px]">
            Les inscriptions reprendront prochainement.
          </SectionParagraph>
          <SectionParagraph className="lg:!text-[14px] lg:!leading-[28px]">
            Nous prenons ce temps pour étudier la conformité des dossiers des
            professionnels déjà référencés. Nous vous invitons à revenir plus
            tard pour rejoindre la communauté France VAE.
          </SectionParagraph>
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

      <section className="fr-container">
        <div className="fr-callout flex flex-col items-start">
          <h4>Préparez votre inscription : </h4>
          <p>
            En attendant la réouverture des inscriptions, collectez toutes les
            pièces justificatives dont vous aurez besoin :
          </p>

          <br />

          <ul>
            <li>
              Une attestation de vigilance ou une attestation fiscale de
              l'URSSAF
            </li>
            <li>
              Une copie du justificatif d’identité du dirigeant faisant
              apparaître son nom et prénom, ainsi que la mention suivante :
              «J’atteste avoir fourni le présent justificatif d’identité.» Il
              devra également dater et signer le justificatif.
            </li>
          </ul>

          <br />

          <p>
            Si l'administrateur de la plateforme n'est pas le dirigeant, il vous
            faudra également fournir :
          </p>

          <br />

          <ul>
            <li>Une lettre de délégation signée par le dirigeant</li>
            <li>
              Une copie du justificatif d'identité de la personne ayant reçu
              délégation.
            </li>
          </ul>
        </div>
      </section>
    </MainLayout>
  );
};

export default SuspendedCreationPage;
