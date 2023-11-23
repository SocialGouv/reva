import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { ArticleDAideEntity } from "@/graphql/generated/graphql";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { truncate } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const ArrowRight = () => (
  <span className="fr-icon-arrow-right-line" aria-hidden="true" />
);

const sectionsQuery = graphql(`
  query getSectionDAides {
    sectionDAides(sort: "ordre") {
      data {
        id
        attributes {
          titre
          article_d_aides(sort: "ordre") {
            data {
              id
              attributes {
                titre
                vignette {
                  data {
                    attributes {
                      url
                      alternativeText
                    }
                  }
                }
                description
              }
            }
          }
        }
      }
    }
  }
`);

const HelpSection = ({ articles }: { articles: ArticleDAideEntity[] }) => {
  const numberOfArticlesToDisplayInitially = 4;
  const [showMore, setShowMore] = useState(false);
  const articlesToDisplay = useMemo(
    () =>
      showMore
        ? articles
        : articles.slice(0, numberOfArticlesToDisplayInitially),
    [showMore, articles]
  );
  const displayMoreButton =
    articles.length > numberOfArticlesToDisplayInitially && !showMore;

  return (
    <div>
      <div className="flex flex-col lg:flex-row flex-wrap gap-8 items-center lg:items-start">
        {articlesToDisplay.map(({ id, attributes }) => (
          <HelpArticle
            key={id}
            title={attributes?.titre || ""}
            description={truncate(attributes?.description || "", {
              length: 300,
            })}
            thumbnailUrl={attributes?.vignette?.data?.attributes?.url || ""}
            thumbnailAlt={
              attributes?.vignette?.data?.attributes?.alternativeText || ""
            }
            url={`/savoir-plus/articles/${id}`}
          />
        ))}
        {displayMoreButton && (
          <div className="flex w-full justify-center lg:justify-end lg:pr-16">
            <Button
              priority="secondary"
              onClick={() => {
                setShowMore(true);
              }}
            >
              <span className="mr-2">Voir tous les articles...</span>
              <ArrowRight />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const HelpArticle = ({
  title,
  description,
  thumbnailUrl,
  thumbnailAlt,
  url,
}: {
  title: string;
  description: string;
  thumbnailUrl: string;
  thumbnailAlt: string;
  url: string;
}) => (
  <Link href={url} className="!bg-none">
    <div className="grid grid-rows-2 w-[267px]  h-[400px] lg:h-[585px] rounded-[32px] bg-white shadow-[0px_8px_24px_0px_rgba(11,11,248,0.16)]">
      <div className="flex">
        <Image
          src={thumbnailUrl}
          alt={thumbnailAlt}
          width={267}
          height={292}
          className="object-cover w-full rounded-t-[32px] max-w-[267px]"
        />
      </div>
      <div className="flex flex-col p-6">
        <h4 className="text-2xl font-bold">{title}</h4>
        <div className="hidden lg:block overflow-hidden">{description}</div>
      </div>
    </div>
  </Link>
);

const SavoirPlusPage = () => {
  const sections = useQuery({
    queryKey: ["sections"],
    queryFn: async () => request(STRAPI_GRAPHQL_API_URL, sectionsQuery),
  });

  return (
    <MainLayout>
      <div className="flex flex-col bg-dsfrGray-altblueFrance">
        <div className="flex flex-col min-h-[440px] items-center justify-center bg-white bg-[url('/savoir-plus/polygons-section2.svg')] bg-cover bg-no-repeat p-4">
          <h1 className="text-7xl font-bold">En savoir plus sur la VAE</h1>
          <h2 className="text-2xl font-bold">
            Trouvez des réponses à vos questions à propos de votre VAE.
          </h2>
          <div className="flex gap-4">
            <Button>
              <a href="https://reva.crisp.help/fr/category/candidat-rhr5rx/">
                Questions fréquentes
              </a>
            </Button>
            <Button priority="secondary">
              <a href="https://vae.gouv.fr/nous-contacter/">Nous contacter</a>
            </Button>
          </div>
        </div>
        <div className="mt-16 flex flex-col p-4 lg:p-32 lg:pt-16 ">
          {sections.data?.sectionDAides?.data?.map((sa, index) => {
            const articles = sa.attributes?.article_d_aides?.data;
            if (!articles?.length) return null;

            return (
              <Accordion
                label={sa.attributes?.titre || ""}
                defaultExpanded={!index}
                key={sa.id}
              >
                <HelpSection articles={articles as ArticleDAideEntity[]} />
              </Accordion>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default SavoirPlusPage;
