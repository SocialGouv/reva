import { Button } from "@codegouvfr/react-dsfr/Button";
import Image from "next/image";

export const AccountsListEmptyState = ({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) => (
  <div className="w-full flex flex-col-reverse items-center justify-between md:flex-row">
    <div className="mt-6 md:mt-0 flex flex-col items-center md:items-start">
      <h2>Comptes collaborateurs</h2>
      <p className="text-xl mb-10 max-w-xl">
        Vous n’avez pas encore créé de compte collaborateur.
      </p>
      <Button
        className=""
        iconId="fr-icon-add-line"
        linkProps={{
          href: `/agencies-settings-v3/${maisonMereAAPId}/user-accounts/add-user-account`,
        }}
      >
        Créer un compte collaborateur
      </Button>
    </div>
    <Image
      src="/admin2/components/no-result.svg"
      alt="icône pas de résultat"
      width={282}
      height={319}
    />
  </div>
);
