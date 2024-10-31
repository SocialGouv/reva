"use client";
import { Cgu } from "@/app/(aap)/cgu/_components/Cgu";
import { CguForm } from "./_components/CguForm";
import { useAppCgu } from "./page.hooks";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { HardCodedCgu } from "./_components/HardCodedCGU";

export default function CguPage() {
  const { cguResponse } = useAppCgu();
  const { isFeatureActive } = useFeatureflipping();
  const loadFromStrapi = isFeatureActive("CGU_FROM_STRAPI");
  if (!cguResponse && loadFromStrapi) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>Conditions générales d'utilisation</h1>
      {loadFromStrapi ? (
        <>
          <Cgu
            cguHtml={cguResponse?.contenu ?? ""}
            chapo={cguResponse?.chapo ?? ""}
            updatedAt={cguResponse?.dateDeMiseAJour}
          />
          <CguForm />
        </>
      ) : (
        <>
          <HardCodedCgu />
          <CguForm />
        </>
      )}
    </div>
  );
}
