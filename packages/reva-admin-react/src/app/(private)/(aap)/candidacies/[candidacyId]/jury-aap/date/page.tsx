"use client";
import Alert from "@codegouvfr/react-dsfr/Alert";

import { DateDeJuryCard } from "./DateDeJuryCard";
import { useJuryAAP } from "./jury-aap.hook";

export default function DateDeJuryPage() {
  const { candidacy } = useJuryAAP();

  if (!candidacy) {
    return null;
  }

  const { jury } = candidacy;

  if (!jury || !jury.dateOfSession) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="mb-12">Passage devant le jury </h1>
        <Alert
          description={
            <div className="ml-2 mt-3 mb-4">
              <h6>En attente de la date de jury</h6>
              <dd>
                Dès qu’il l’aura définie, le certificateur vous communiquera la
                date de passage devant le jury de votre candidat.
              </dd>
            </div>
          }
          severity="info"
          small
        />
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6">Passage devant le jury </h1>
      <p className="mb-12 text-xl">
        Les informations de passage devant le jury sont renseignées par le
        certificateur. France VAE n'assure pas ce cette fonction.
      </p>
      <div className="flex flex-col gap-8">
        <DateDeJuryCard
          jury={{
            id: jury.id,
            dateOfSession: jury.dateOfSession,
            timeSpecified: jury.timeSpecified,
            addressOfSession: jury.addressOfSession,
            informationOfSession: jury.informationOfSession,
          }}
          candidacy={{
            certificationAuthorityLocalAccounts:
              candidacy.certificationAuthorityLocalAccounts,
            certificationAuthority:
              candidacy.feasibility?.certificationAuthority,
          }}
        />
      </div>
    </>
  );
}
