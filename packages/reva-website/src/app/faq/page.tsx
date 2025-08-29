import Accordion from "@codegouvfr/react-dsfr/Accordion";
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

const FaqPage = async () => {
  const { isEnabled: preview } = await draftMode();
  const sections = await strapi.request(sectionFaqs, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
    itemFilter: preview ? null : { publishedAt: { notNull: true } },
    sectionFilter: preview ? null : { publishedAt: { notNull: true } },
  });
  return (
    <MainLayout preview={preview}>
      <div className="flex flex-col w-full gap-8 fr-container p-32 pt-0 md:pt-16">
        <h1 className="text-4xl font-bold  bg-white mt-12 mb-0 md:mb-6 self-center">
          Questions fréquentes
        </h1>
        <div className="flex flex-wrap justify-start md:justify-center gap-6 md:gap-16">
          {sections.sectionFaqs?.map((s) => (
            <Tile
              key={s?.documentId}
              enlargeLinkOrButton
              orientation="horizontal"
              linkProps={{
                href: `#section-${s?.documentId}`,
              }}
              className="max-h-[100px]"
              title={
                <span className="flex items-center gap-8 -mt-5 mr-8">
                  {s?.pictogramme && <span>{PICTOGRAMS[s?.pictogramme]}</span>}
                  <span>{s?.titre}</span>
                </span>
              }
            />
          ))}
        </div>
        <div className="flex flex-col py-4 mt-0 md:mt-12">
          {sections.sectionFaqs?.map((s) => (
            <div
              key={s?.documentId}
              id={`section-${s?.documentId}`}
              className="font-bold text-3xl text-black mb-12"
            >
              {s?.titre}
              <ul className="list-none p-0">
                {s?.sous_section_faqs?.map((ss) => (
                  <li className="text-2xl mt-4" key={ss?.documentId}>
                    {(s?.sous_section_faqs?.length || 0) > 1 && ss?.titre}
                    <div className="mt-4">
                      {ss?.article_faqs?.map((a) => (
                        <span
                          key={a?.documentId}
                          id={`article-${a?.documentId}`}
                        >
                          <Accordion
                            label={
                              <p className="text-blue-900">{a?.question}</p>
                            }
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
