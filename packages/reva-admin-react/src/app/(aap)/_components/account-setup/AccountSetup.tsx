"use client";
import Button from "@codegouvfr/react-dsfr/Button";
import { useAccountSetup } from "./accountSetup.hook";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { graphqlErrorToast } from "@/components/toast/toast";

export default function AccountSetup({
  maisonMereAAPId,
  headAgencyId,
}: {
  maisonMereAAPId: string;
  headAgencyId: string;
}) {
  const { updateAccount } = useAccountSetup();
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 mx-auto">
      <div className="col-span-2">
        <h1 className="">Bienvenue sur votre compte administrateur</h1>
        <p className="text-lg">
          Pour recevoir vos premières candidatures, commencez par paramétrer
          votre compte.{" "}
        </p>
        <ul className="text-lg ml-4 mb-8">
          <li>
            Définissez vos modalités d’accompagnement (présentiel ou à distance)
          </li>
          <li>Sélectionnez vos filières et vos niveaux de certification</li>
          <li>
            Ajoutez des lieux d’accueil et gérez leur visibilité dans les
            recherches
          </li>
        </ul>
        <p className="text-sm">
          💡 Quand vous ajoutez un nouveau lieu d’accueil, pensez à utiliser une
          nouvelle adresse mail. Sinon, vous rencontrerez des difficultés pour
          vous connecter.
        </p>
        <Button
          disabled={updateAccount.isPending}
          className="mt-4"
          onClick={() => {
            updateAccount.mutate(
              {
                showAccountSetup: false,
                maisonMereAAPId: maisonMereAAPId,
              },
              {
                onSuccess: () => {
                  // Needed to avoid race condition - Otherwise, candidacy list will render immediately, and because
                  // it performs a router.replace, it will highjack the router.push() below
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ["organisms"] });
                  }, 100);
                  router.push(
                    `/agencies-settings/organisms/${headAgencyId}/informations-generales/distance`,
                  );
                },
                onError: graphqlErrorToast,
              },
            );
          }}
        >
          Paramétrer mon compte
        </Button>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/account-setup.svg"
          alt="AAP logo"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
}
