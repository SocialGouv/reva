import { draftMode } from "next/headers";

import { StrapiBlocksRenderer } from "@/app/_components/blocks-renderer/StrapiBlocksRenderer";
import { MainLayout } from "@/app/_components/layout/main-layout/MainLayout";
import { NeutralBackground } from "@/components/layout/neutral-background/NeutralBackground";

import { graphql } from "@/graphql/generated";
import { strapi } from "@/graphql/strapi";

export const revalidate = 3600;

const getPrivacyPolicy = graphql(`
  query getPrivacyPolicy($publicationState: PublicationStatus!) {
    legals(
      filters: { nom: { eq: "confidentialite" } }
      status: $publicationState
    ) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

export async function generateMetadata() {
  const { isEnabled: preview } = await draftMode();
  const getPrivacyPolicyResponse = await strapi.request(getPrivacyPolicy, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  const privacyPolicy = getPrivacyPolicyResponse?.legals[0] ?? null;
  return {
    title: `${privacyPolicy?.titre} - France VAE | Prenez votre avenir professionnel en main`,
  };
}

const PrivacyPolicyPage = async () => {
  const { isEnabled: preview } = await draftMode();
  const getPrivacyPolicyResponse = await strapi.request(getPrivacyPolicy, {
    publicationState: preview ? "DRAFT" : "PUBLISHED",
  });
  const privacyPolicy = getPrivacyPolicyResponse?.legals[0] ?? null;

  if (!privacyPolicy) {
    return null;
  }

  return (
    <MainLayout>
      <NeutralBackground>
        <h1>{privacyPolicy?.titre}</h1>
        {privacyPolicy.chapo &&
          !(
            privacyPolicy.chapo.length === 1 &&
            privacyPolicy.chapo[0].children[0].text === ""
          ) && (
            <>
              <StrapiBlocksRenderer content={privacyPolicy.chapo} />
              <hr className="mt-12 mb-6" />
            </>
          )}
        <div
          dangerouslySetInnerHTML={{
            __html: privacyPolicy?.contenu ?? "",
          }}
        />
      </NeutralBackground>
    </MainLayout>
  );
};
export default PrivacyPolicyPage;
