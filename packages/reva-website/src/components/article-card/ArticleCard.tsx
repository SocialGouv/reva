import { ArticleDAide } from "@/graphql/generated/graphql";
import Card from "@codegouvfr/react-dsfr/Card";

export const ArticleCard = ({ article }: { article: ArticleDAide }) => {
  if (!article) return null;
  const { vignette, titre, description, slug } = article;
  return (
    <div className="container">
      <Card
        background
        border
        enlargeLink
        desc={description}
        imageAlt={vignette?.alternativeText as string}
        imageUrl={vignette?.url as string}
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
