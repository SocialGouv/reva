"use client";
import Link from "next/link";

import { Tabs } from "@codegouvfr/react-dsfr/Tabs";

import { DateDeJury } from "./DateDeJury";
import { Resultat } from "./Resultat";

interface Props {
  params: {
    candidacyId: string;
    juryId?: string[];
  };
}

const JuryPage = (_props: Props) => {
  return (
    <div className="flex flex-col w-full">
      <Link
        href="/candidacies/juries"
        className="fr-icon-arrow-left-line fr-link--icon-left text-blue-900 text-lg mr-auto"
      >
        Tous les dossiers
      </Link>
      <h1 className="text-3xl font-bold my-8">Jury</h1>
      <Tabs
        tabs={[
          {
            label: "Date de jury",
            isDefault: true,
            content: <DateDeJury />,
          },
          {
            label: "Résultat",
            content: <Resultat />,
          },
        ]}
      />
    </div>
  );
};

export default JuryPage;
