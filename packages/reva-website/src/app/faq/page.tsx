import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";

import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { PICTOGRAMS } from "@/components/pictograms";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

export const metadata: Metadata = {
  title: "France VAE | FAQ",
  description:
    "Retrouvez les questions les plus fréquentes sur la VAE en France. Trouvez des réponses à vos questions sur la Validation des Acquis de l'Expérience",
  openGraph: {
    title: "France VAE | FAQ",
    description:
      "Retrouvez les questions les plus fréquentes sur la VAE en France. Trouvez des réponses à vos questions sur la Validation des Acquis de l'Expérience",
  },
  keywords: ["Gouvernement", "France", "VAE", "France VAE"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const revalidate = 600;

const FaqPage = async () => {
  const { isEnabled: preview } = await draftMode();
  const sections = await strapi.request(sectionFaqs, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
    itemFilter: preview ? null : { publishedAt: { notNull: true } },
    sectionFilter: preview ? null : { publishedAt: { notNull: true } },
  });
  return (
    <MainLayout preview={preview}>
      <div className="flex flex-col w-full gap-10 fr-container p-10 md:p-32 pt-0 md:pt-12">
        <h1 className="text-4xl font-bold  bg-white mt-10 md:mt-0 mb-0 self-center">
          Questions fréquentes
        </h1>
        <div className="flex flex-wrap justify-start md:justify-center gap-6 lg:gap-16">
          {sections.sectionFaqs?.map((s) => (
            <Tile
              key={s?.documentId}
              enlargeLinkOrButton
              orientation="horizontal"
              linkProps={{
                href: `#section-${s?.documentId}`,
              }}
              className="max-h-[100px] flex-auto"
              title={
                <span className="flex items-center gap-8 -mt-5 mr-8">
                  {s?.pictogramme && <span>{PICTOGRAMS[s?.pictogramme]}</span>}
                  <span>{s?.titre}</span>
                </span>
              }
            />
          ))}
        </div>
        <div className="flex flex-col gap-10 mt-0">
          {sections.sectionFaqs?.map((s) => (
            <div
              key={s?.documentId}
              id={`section-${s?.documentId}`}
              className="flex flex-col gap-8"
            >
              <h2 className="m-0 font-bold text-[2rem] text-black">
                {s?.titre}
              </h2>
              <ul className="list-none p-0 m-0 flex flex-col gap-8">
                {s?.sous_section_faqs?.map((ss) => (
                  <li key={ss?.documentId}>
                    <h3 className="leading-none text-[1.75rem]">
                      {(s?.sous_section_faqs?.length || 0) > 1 && ss?.titre}
                    </h3>
                    <div className="mt-6">
                      {ss?.article_faqs?.map((a) => (
                        <span
                          key={a?.documentId}
                          id={`article-${a?.documentId}`}
                        >
                          <Accordion
                            label={<p>{a?.question}</p>}
                            className="text-gray-700 font-normal"
                          >
                            <div
                              className="ck-content"
                              dangerouslySetInnerHTML={{
                                __html:
                                  a?.reponse?.replaceAll(
                                    "<a",
                                    "<a target='_'",
                                  ) || "",
                              }}
                            />
                          </Accordion>
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
              <CallOut
                title="Vous n’avez pas trouvé de réponse à votre question ? Vous rencontrez un blocage technique ?"
                className="m-0 mt-2"
                classes={{
                  title: "mb-0",
                }}
              >
                <Button
                  linkProps={{
                    href: "/nous-contacter",
                  }}
                >
                  Contactez-nous
                </Button>
              </CallOut>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

const sectionFaqs = graphql(`
  query getSectionFaqs(
    $publicationState: PublicationStatus!
    $itemFilter: ArticleFaqFiltersInput
    $sectionFilter: SousSectionFaqFiltersInput
  ) {
    sectionFaqs(sort: "ordre", status: $publicationState) {
      documentId
      titre
      pictogramme
      sous_section_faqs(sort: "ordre", filters: $sectionFilter) {
        documentId
        titre
        article_faqs(sort: "ordre", filters: $itemFilter) {
          documentId
          question
          reponse
        }
      }
    }
  }
`);

export default FaqPage;
