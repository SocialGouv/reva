import Card from "@codegouvfr/react-dsfr/Card";

import { ArticleDAide } from "@/graphql/generated/graphql";

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
        imageUrl={vignette?.formats?.small?.url as string}
        nativeImgProps={{
          loading: "lazy",
        }}
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
