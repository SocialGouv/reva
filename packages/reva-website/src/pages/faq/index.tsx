import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { GetSectionFaqsQuery } from "@/graphql/generated/graphql";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import request from "graphql-request";
const sectionFaqs = graphql(`
  query getSectionFaqs {
    sectionFaqs(sort: "ordre") {
      data {
        id
        attributes {
          titre
          sous_section_faqs(sort: "ordre") {
            data {
              id
              attributes {
                titre
                article_faqs(sort: "ordre") {
                  data {
                    id
                    attributes {
                      question
                      reponse
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

const FaqPage = ({ sections }: { sections: GetSectionFaqsQuery }) => (
  <MainLayout>
    <div className="flex flex-col w-full gap-8 fr-container p-32 pt-16">
      <h1 className="text-4xl font-bold  bg-white mt-12 mb-6 self-center">
        Questions fréquentes
      </h1>
      <div className="flex flex-wrap justify-start md:justify-center gap-16">
        {sections.sectionFaqs?.data?.map((s) => (
          <Tile
            key={s.id}
            enlargeLink
            linkProps={{
              href: `#section-${s.id}`,
            }}
            title={s.attributes?.titre}
          />
        ))}
      </div>
      <div className="flex flex-col py-4 mt-12">
        {sections.sectionFaqs?.data?.map((s) => (
          <div
            key={s.id}
            id={`section-${s.id}`}
            className="font-bold text-3xl text-black mb-12"
          >
            {s.attributes?.titre}
            <ul className="list-none p-0">
              {s.attributes?.sous_section_faqs?.data?.map((ss) => (
                <li className="text-2xl mt-4" key={ss.id}>
                  {(s.attributes?.sous_section_faqs?.data?.length || 0) > 1 &&
                    ss.attributes?.titre}
                  <div className="fr-accordions-group mt-4">
                    {ss.attributes?.article_faqs?.data?.map((a) => (
                      <span key={a.id} id={`article-${s.id}`}>
                        <Accordion
                          label={
                            <p className="text-blue-900">
                              {a.attributes?.question}
                            </p>
                          }
                          className="text-gray-700 font-normal"
                        >
                          <div
                            className="ck-content"
                            dangerouslySetInnerHTML={{
                              __html:
                                a.attributes?.reponse?.replaceAll(
                                  "<a",
                                  "<a target='_'"
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

export async function getServerSideProps() {
  const sections = await request(STRAPI_GRAPHQL_API_URL, sectionFaqs);
  return { props: { sections } };
}

export default FaqPage;
