import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const helpPageItemsQuery = graphql(`
  query getHelpPageItems {
    aideCandidatQuestionsFrequente {
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
    aideCandidatRessourcesUtile {
      lien_voir_plus
      aide_article_d_aides(
        pagination: { page: 1, pageSize: 3 }
        sort: ["ordre:asc"]
      ) {
        description
        documentId
        titre
        ordre
        slug
      }
    }
  }
`);

export const getHelpPageItems = async () => {
  const helpPageItems = await strapi.request(helpPageItemsQuery);
  const questionsFrequentesSection =
    helpPageItems?.aideCandidatQuestionsFrequente;
  const ressourcesUtileSection = helpPageItems?.aideCandidatRessourcesUtile;

  return {
    questionsFrequentesSection,
    ressourcesUtileSection,
  };
};

type HelpPageItems = Awaited<ReturnType<typeof getHelpPageItems>>;
export type HelpPageItemsQuestionsFrequentesSection =
  HelpPageItems["questionsFrequentesSection"];
export type HelpPageItemsRessourcesUtileSection =
  HelpPageItems["ressourcesUtileSection"];
