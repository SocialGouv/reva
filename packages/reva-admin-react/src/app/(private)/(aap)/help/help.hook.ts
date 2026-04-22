import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const getAapHelpPageItemsQuery = graphql(`
  query getAapHelpPageItems {
    aideAapQuestionsFrequente {
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

export const getAapHelp = async () => {
  const helpPageItems = await strapi.request(getAapHelpPageItemsQuery);
  const questionsFrequentesSection = helpPageItems?.aideAapQuestionsFrequente;

  return {
    questionsFrequentesSection,
  };
};

type GetAapHelpPageItems = Awaited<ReturnType<typeof getAapHelp>>;
export type GetAapHelpPageItemsQuestionsFrequentesSection =
  GetAapHelpPageItems["questionsFrequentesSection"];
