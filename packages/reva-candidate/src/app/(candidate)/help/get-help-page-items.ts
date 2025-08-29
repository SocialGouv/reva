import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const helpPageItemsQuery = graphql(`
  query getHelpPageItems {
    aideCandidatTutoriel {
      titre
      sous_titre
      aide_candidat_section_tutoriel_cartes(
        pagination: { page: 1, pageSize: 3 }
        sort: ["ordre:asc"]
      ) {
        documentId
        titre
        lien
        icone_svg {
          url
          alternativeText
          formats
        }
        updatedAt
      }
    }
    aideCandidatQuestionsFrequente {
      titre
      sous_titre
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
      titre
      sous_titre
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
  const tutorielSection = helpPageItems?.aideCandidatTutoriel;
  const questionsFrequentesSection =
    helpPageItems?.aideCandidatQuestionsFrequente;
  const ressourcesUtileSection = helpPageItems?.aideCandidatRessourcesUtile;

  return {
    tutorielSection,
    questionsFrequentesSection,
    ressourcesUtileSection,
  };
};

type HelpPageItems = Awaited<ReturnType<typeof getHelpPageItems>>;
export type HelpPageItemsTutorielSection = HelpPageItems["tutorielSection"];
export type HelpPageItemsQuestionsFrequentesSection =
  HelpPageItems["questionsFrequentesSection"];
export type HelpPageItemsRessourcesUtileSection =
  HelpPageItems["ressourcesUtileSection"];
