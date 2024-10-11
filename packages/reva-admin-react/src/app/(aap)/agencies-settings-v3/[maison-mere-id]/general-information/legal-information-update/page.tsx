"use client";
import { useParams } from "next/navigation";
import { LegalInformationUpdateForm } from "../_components/legal-information-update-block/LegalInformationUpdateForm";

export default function LegalInformationUpdateBlockPage() {
  const { "maison-mere-id": maisonMereAAPId }: { "maison-mere-id": string } =
    useParams();

  return (
    <div className="flex flex-col">
      <h1>Mise à jour du compte</h1>
      <LegalInformationUpdateForm
        backUrl={`/agencies-settings-v3/${maisonMereAAPId}/general-information/`}
        maisonMereAAPId={maisonMereAAPId}
      />
    </div>
  );
}
