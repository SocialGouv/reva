"use client";

import { redirect } from "next/navigation";

import Button from "@codegouvfr/react-dsfr/Button";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";

import Link from "next/link";
import { useCertificationAuthorityQueries } from "./certificationAuthorityQueries";

export default function Page() {
  const { certifictionAuthority, certifictionAuthorityStatus: status } =
    useCertificationAuthorityQueries();

  const localAccounts =
    certifictionAuthority?.certificationAuthorityLocalAccounts || [];

  if (status == "success" && localAccounts.length == 0) {
    redirect("/certification-authorities/local-accounts/empty-local-account");
  }

  return (
    <>
      {status == "pending" && (
        <div className="flex-shrink-0 md:w-[298px] pt-8 border-r">
          <Skeleton />
          <Skeleton />
        </div>
      )}
      {status == "success" && (
        <div className="flex">
          <SideMenu
            className="flex-shrink-0 md:w-[330px] side-bar-menu-add-button"
            align="left"
            classes={{ inner: "h-full" }}
            burgerMenuButtonText="Comptes locaux"
            title="Comptes locaux"
            items={
              [
                ...localAccounts.map((item) => ({
                  isActive: false,
                  linkProps: {
                    href: `/certification-authorities/local-accounts/${item.id}`,
                    target: "_self",
                  },
                  text: `${item.account.firstname} ${item.account.lastname}`,
                })),
                {
                  isActive: false,
                  linkProps: {
                    href: "/certification-authorities/local-accounts/add-local-account/",
                    target: "_self",
                  },
                  text: (
                    <div className="w-full h-full bg-white">
                      <Button size="small" priority="secondary">
                        Ajouter un compte local
                      </Button>
                    </div>
                  ),
                },
              ] || []
            }
          />
          <div className="w-full flex flex-col items-center justify-center px-4 sm:px-10 text-gray-500">
            <span>
              <Link href="/certification-authorities/local-accounts/add-local-account/">
                Ajoutez un compte local
              </Link>{" "}
              ou sélectionnez un compte existant.
            </span>
          </div>
        </div>
      )}
      {status == "error" && (
        <div className="md:w-[330px] text-red-500">
          Une erreur est survenue lors de la récupération de vos comptes locaux
        </div>
      )}
    </>
  );
}

const Skeleton = () => (
  <div className="ml-5 mt-6 h-8 animate-pulse bg-gray-100 w-64" />
);
