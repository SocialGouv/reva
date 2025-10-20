"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { graphqlErrorToast } from "@/components/toast/toast";

import { useAccountSetup } from "./accountSetup.hook";

export default function AccountSetup({
  maisonMereAAPId,
}: {
  maisonMereAAPId: string;
}) {
  const { updateAccount } = useAccountSetup();
  const queryClient = useQueryClient();
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 grid-rows-1 w-11/12 mx-auto">
      <div className="col-span-2">
        <h1 className="">Bienvenue dans votre espace professionnel</h1>
        <p className="text-lg">
          Ici, vous avez la main sur toute la gestion de votre structure. Un
          seul endroit pour :
        </p>
        <ul className="text-lg ml-4 mb-8">
          <li>Mettre à jour vos informations en un clic</li>
          <li>
            Ajouter et gérer de nouveaux lieux d'accueil en toute simplicité
          </li>
          <li>
            Passer en mode "invisible" pour ne plus recevoir de candidatures
            momentanément
          </li>
        </ul>
        <p className="text-sm">
          💡 Quand vous ajoutez un compte collaborateur, pensez à utiliser une
          nouvelle adresse électronique. Sinon, vous rencontrerez des
          difficultés pour vous connecter.
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
                  router.push(`/agencies-settings-v3/`);
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
