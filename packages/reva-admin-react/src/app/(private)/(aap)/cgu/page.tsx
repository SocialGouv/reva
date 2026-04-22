"use client";

import { Cgu } from "@/components/cgu/Cgu";

import { CguForm } from "./_components/CguForm";
import { useAppCgu } from "./page.hooks";

export default function CguPage() {
  const { cguResponse } = useAppCgu();
  if (!cguResponse) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1>{cguResponse.titre}</h1>
      <Cgu
        cguHtml={cguResponse?.contenu ?? ""}
        chapo={cguResponse?.chapo ?? ""}
        updatedAt={cguResponse?.dateDeMiseAJour}
      />
      <CguForm />
    </div>
  );
}
