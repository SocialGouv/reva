import { ArticleDAideEntity } from "@/graphql/generated/graphql";
import Card from "@codegouvfr/react-dsfr/Card";

export const ArticleCard = ({ article }: { article: ArticleDAideEntity }) => {
  if (!article.attributes) return null;
  const { vignette, titre, description, slug } = article.attributes;
  return (
    <div className="container">
      <Card
        background
        border
        enlargeLink
        desc={description}
        imageAlt={vignette?.data?.attributes?.alternativeText as string}
        imageUrl={vignette?.data?.attributes?.url as string}
        linkProps={{
          href: `/savoir-plus/articles/${slug}`,
        }}
        size="large"
        title={titre}
        classes={{
          title: "!text-dsfrBlue-franceSun",
        }}
      />
    </div>
  );
};
