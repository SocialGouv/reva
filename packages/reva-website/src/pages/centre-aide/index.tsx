import { MainLayout } from "@/components/layout/main-layout/MainLayout";
import { STRAPI_GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";
import { truncate } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

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

const HelpSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div>
    <h3 className="text-4xl font-bold mb-8">{title}</h3>
    <div className="flex flex-col lg:flex-row flex-wrap gap-8 items-center lg:items-start">
      {children}
    </div>
  </div>
);

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
    <div className="grid grid-rows-2 w-[267px] lg:w-[535px] h-[400px] lg:h-[585px] rounded-[32px] bg-white shadow-[0px_8px_24px_0px_rgba(11,11,248,0.16)]">
      <div className="flex">
        <Image
          src={thumbnailUrl}
          alt={thumbnailAlt}
          width={535}
          height={292}
          className="object-cover w-full rounded-t-[32px]"
        />
      </div>
      <div className="flex flex-col p-8">
        <h4 className="text-4xl font-bold">{title}</h4>
        <div className="hidden lg:block overflow-hidden">{description}</div>
      </div>
    </div>
  </Link>
);

const CentreAidePage = () => {
  const sections = useQuery({
    queryKey: ["sections"],
    queryFn: async () => request(STRAPI_GRAPHQL_API_URL, sectionsQuery),
  });

  return (
    <MainLayout>
      <div className="flex flex-col bg-dsfrGray-altblueFrance">
        <div className="flex flex-col min-h-[440px] items-center justify-center bg-white bg-[url('/centre-aide/polygons-section2.svg')] bg-cover bg-no-repeat p-4">
          <h1 className="text-7xl font-bold">Centre d’aide France VAE</h1>
          <h2 className="text-2xl font-bold">
            Trouvez des réponses à vos questions à propos de votre VAE.
          </h2>
        </div>
        <div className="mt-20 flex flex-col gap-20 p-4 lg:p-32 lg:pt-16 ">
          {sections.data?.sectionDAides?.data?.map((sa) => (
            <HelpSection key={sa.id} title={sa.attributes?.titre || ""}>
              {sa.attributes?.article_d_aides?.data?.map((aa) => (
                <HelpArticle
                  key={aa.id}
                  title={aa.attributes?.titre || ""}
                  description={truncate(aa.attributes?.description || "", {
                    length: 300,
                  })}
                  thumbnailUrl={
                    aa.attributes?.vignette?.data?.attributes?.url || ""
                  }
                  thumbnailAlt={
                    aa.attributes?.vignette?.data?.attributes
                      ?.alternativeText || ""
                  }
                  url={"/centre-aide/articles/" + aa.id}
                />
              ))}
            </HelpSection>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CentreAidePage;
