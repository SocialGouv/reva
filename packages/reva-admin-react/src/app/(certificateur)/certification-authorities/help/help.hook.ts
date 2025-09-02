import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const getCertificationAuthoritiesHelpPageItemsQuery = graphql(`
  query getCertificationAuthoritiesHelpPageItems {
    aideCertificateurQuestionsFrequente {
      lien_voir_plus
      faq_article_faqs(
        pagination: { page: 1, pageSize: 5 }
        sort: ["ordre:asc"]
      ) {
        question
        reponse
        ordre
        sous_section_faq {
          documentId
        }
      }
    }
  }
`);

export const getCertificationAuthoritiesHelp = async () => {
  const helpPageItems = await strapi.request(
    getCertificationAuthoritiesHelpPageItemsQuery,
  );
  const questionsFrequentesSection =
    helpPageItems?.aideCertificateurQuestionsFrequente;

  return {
    questionsFrequentesSection,
  };
};

type GetCertificationAuthoritiesHelpPageItems = Awaited<
  ReturnType<typeof getCertificationAuthoritiesHelp>
>;
export type GetCertificationAuthoritiesHelpPageItemsQuestionsFrequentesSection =
  GetCertificationAuthoritiesHelpPageItems["questionsFrequentesSection"];
