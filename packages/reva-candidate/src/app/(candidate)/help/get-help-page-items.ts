import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

const helpPageItemsQuery = graphql(`
  query getHelpPageItems {
    aideCandidatSectionTutoriels {
      titre
      sous_titre
      aide_candidat_section_tutoriel_cartes {
        documentId
        titre
        lien
        icone_svg {
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
  const tutorielSection = helpPageItems.aideCandidatSectionTutoriels[0];

  return { tutorielSection };
};

type HelpPageItems = Awaited<ReturnType<typeof getHelpPageItems>>;
export type HelpPageItemsTutorielSection = HelpPageItems["tutorielSection"];
