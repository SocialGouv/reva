import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { PICTOGRAMS } from "@/components/pictograms";
import { GetSectionFaqsQuery } from "@/graphql/generated/graphql";
import { getSectionFaqs } from "@/utils/strapiQueries";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import Head from "next/head";

const FaqPage = ({
  sections,
  preview,
}: {
  sections: GetSectionFaqsQuery;
  preview: boolean;
}) => (
  <>
    <Head>
      <title>France VAE | FAQ </title>
      <meta charSet="UTF-8" />
      <meta
        name="description"
        content="Retrouvez les questions les plus fréquentes sur la VAE en France. Trouvez des réponses à vos questions sur la Validation des Acquis de l'Expérience"
      />
      <meta name="keywords" content="Gouvernement, France, VAE, France VAE" />
      <meta name="author" content="France VAE" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </Head>
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
  </>
);

export async function getServerSideProps({ preview = false }) {
  const sections = await getSectionFaqs(preview);
  return { props: { sections, preview } };
}

export default FaqPage;
