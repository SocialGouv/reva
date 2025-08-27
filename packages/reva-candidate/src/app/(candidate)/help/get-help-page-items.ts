import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const helpPageItemsQuery = graphql(`
  query getHelpPageItems {
    aideCandidatTutoriel {
      titre
      sous_titre
      aide_candidat_section_tutoriel_cartes(
        pagination: { limit: -1 }
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
  }
`);

export const getHelpPageItems = async () => {
  const helpPageItems = await strapi.request(helpPageItemsQuery);
  const tutorielSection = helpPageItems?.aideCandidatTutoriel;

  return { tutorielSection };
};

type HelpPageItems = Awaited<ReturnType<typeof getHelpPageItems>>;
export type HelpPageItemsTutorielSection = HelpPageItems["tutorielSection"];
