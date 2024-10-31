import { Cgu } from "@/app/(aap)/cgu/_components/Cgu";
import { CguForm } from "./_components/CguForm";
import { graphql } from "@/graphql/generated";
import request from "graphql-request";

const getCguQuery = graphql(`
  query getCgu {
    legals(filters: { nom: { eq: "CGU" } }) {
      data {
        id
        attributes {
          titre
          contenu
          chapo
          dateDeMiseAJour
        }
      }
    }
  }
`);

export default async function CguPage() {
  const getCguResponse = await request(
    (process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL ?? "") + "/graphql",
    getCguQuery,
  );
  return (
    <div>
      <h1>Conditions générales d'utilisation</h1>
      <Cgu
        cguHtml={getCguResponse?.legals?.data[0]?.attributes?.contenu ?? ""}
        chapo={getCguResponse?.legals?.data[0]?.attributes?.chapo ?? ""}
        updatedAt={getCguResponse?.legals?.data[0]?.attributes?.dateDeMiseAJour}
      />
      <CguForm />
    </div>
  );
}
