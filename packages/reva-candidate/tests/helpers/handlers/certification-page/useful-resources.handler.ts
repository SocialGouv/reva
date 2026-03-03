import { graphql } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";

const strapi = graphql.link("https://strapi.vae.gouv.fr/graphql");

const articleDAides = [
  {
    documentId: "y0qlgrno9xs9fr588l7806ie",
    titre: "Comment financer son accompagnement VAE ?",
    slug: "financer-son-accompagnement-vae",
    description:
      "Découvrez comment financer son accompagnement VAE avec France VAE et les droits CPF.",
  },
  {
    documentId: "jorukunnafy4ko96eolx26b7",
    titre: "Dans quels cas est-il pertinent de faire une VAE ?",
    slug: "quand-faire-une-vae",
    description:
      "Quels sont les critères pour assurer la réussite de son projet ? Et comment savoir si c’est le bon moment de démarrer ? Voici un aperçu des questions importantes à se poser avant de se lancer.",
  },
  {
    documentId: "smok96d8r73weybh3lbippxf",
    titre: "Comment bien choisir son diplôme ?",
    slug: "comment-bien-choisir-son-diplome",
    description:
      "Il peut être complexe de choisir le diplôme qui correspond le mieux à son projet. Voici un résumé des questions à se poser pour faire le bon choix.",
  },
];

export function getArticlesForCertificationPageUsefulResourcesHandler() {
  return strapi.query(
    "getArticlesForCertificationPageUsefulResources",
    graphQLResolver({
      articleDAides,
    }),
  );
}
