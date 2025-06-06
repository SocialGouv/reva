import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

const getArticleRegionByIdQuery = graphql(`
  query getArticleRegionsByIdForPreview($id: ID!) {
    articleRegion(documentId: $id) {
      titre
      regions {
        slug
      }
    }
  }
`);

const getArticleRegionById = async (id: string) => {
  return strapi.request(getArticleRegionByIdQuery, {
    id,
  });
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type");
  const slug = decodeURIComponent(searchParams.get("slug") || "");
  const id = searchParams.get("id");

  if (secret !== process.env.STRAPI_PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  let contentPath = "";

  switch (type) {
    case "article-d-aide":
      contentPath = `/savoir-plus/articles/${slug}`;
      break;
    case "article-faq":
      contentPath = "/faq/";
      break;
    case "article-region":
      contentPath = `/regions/${slug}`;
      const article = await getArticleRegionById(id as string);
      const region = article.articleRegion?.regions[0];
      contentPath = region?.slug
        ? `/regions/${region?.slug}/articles/${slug}`
        : "/regions/";
      break;
    case "region":
      contentPath = `/regions/${slug}`;
      break;
    case "legal":
      contentPath = `/legal/${slug}`;
      break;
    default:
      return new Response(
        "La preview n'est pas disponible pour ce type de contenu",
        { status: 401 },
      );
  }

  // Enable Draft Mode by setting the cookie
  const draft = await draftMode();
  draft.enable();

  redirect(encodeURI(contentPath));
}
