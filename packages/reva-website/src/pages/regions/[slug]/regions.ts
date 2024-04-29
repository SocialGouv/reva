export interface RegionPageContent {
  title: string;
  slug: string;
  logoUrl: string;
  articles: RegionPageArticle[];
}

export interface RegionPageArticle {
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string;
}

export const regionPageContents: RegionPageContent[] = [
  {
    title: "La VAE en Normandie",
    slug: "normandie",
    logoUrl: "/regions/normandie/logo.png",
    articles: [
      {
        title:
          "Articuler le Projet de transition professionnelle et la VAE, c’est possible !",
        slug: "article-1",
        thumbnailUrl: "/regions/normandie/articles/article-1/thumbnail.png",
        summary:
          "La validation des acquis de l'expérience (VAE) permet à toute personne engagée dans la vie active de faire valider son expérience professionnelle et d'obtenir un diplôme, un titre professionnel ou un certificat de qualification.",
      },
    ],
  },
];
