"use client";

import Tile from "@codegouvfr/react-dsfr/Tile";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";

export default function TransferCandidacyPage() {
  const router = useRouter();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  return (
    <div>
      <h1>Transfert de la candidature</h1>
      <p className="text-xl">
        Choisissez le type de compte vers lequel vous souhaitez transférer la
        candidature.
      </p>

      <div className="my-12 flex flex-row gap-6">
        <Tile
          className="w-1/2 h-[344px]"
          title={
            <div className="flex flex-col gap-3 px-8">
              <p className="text-xl">
                Vers un autre gestionnaire de candidature
              </p>
              <p className="text-dsfrGray-labelGrey text-s font-normal">
                Retrouvez tous les certificateurs hors de votre structure.
              </p>
              <p className="text-dsfrGray-mentionGrey text-xs font-normal">
                Tous les certificateurs proposés sont déjà en charge de la
                certification sélectionnée.
              </p>
            </div>
          }
          start={
            <Image
              src="/admin2/components/transfer-certification-authority.svg"
              alt="AAP logo"
              width={80}
              height={80}
            />
          }
          small
          buttonProps={{
            onClick: () => {
              router.push(
                `/candidacies/${candidacyId}/transfer-to-certification-authority?page=1`,
              );
            },
          }}
        />

        <Tile
          className="w-1/2 h-[344px]"
          title={
            <div className="flex flex-col gap-3 px-8">
              <p className="text-xl">Vers un autre compte collaborateur</p>
              <p className="text-dsfrGray-labelGrey text-s font-normal">
                Retrouvez tous les comptes collaborateurs de votre structure.
              </p>
              <p className="text-dsfrGray-mentionGrey text-xs font-normal">
                Tous les collaborateurs proposés sont déjà en charge de la
                certification sélectionnée.
              </p>
            </div>
          }
          start={
            <Image
              src="/admin2/components/transfer-certification-authority-local-account.svg"
              alt="AAP logo"
              width={80}
              height={80}
            />
          }
          small
          buttonProps={{
            onClick: () => {
              router.push(
                `/candidacies/${candidacyId}/transfer-to-certification-authority-local-account?page=1`,
              );
            },
          }}
        />
      </div>
    </div>
  );
}
