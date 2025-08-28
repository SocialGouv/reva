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
      aide_candidat_section_questions_frequentes_questions(
        pagination: { page: 1, pageSize: 5 }
        sort: ["ordre:asc"]
      ) {
        question
        reponse
        ordre
      }
    }
    aideCandidatRessourcesUtile {
      titre
      sous_titre
      lien_voir_plus
      aide_candidat_section_ressources_utiles_cartes(
        pagination: { page: 1, pageSize: 3 }
        sort: ["ordre:asc"]
      ) {
        description
        documentId
        titre
        lien
        ordre
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
