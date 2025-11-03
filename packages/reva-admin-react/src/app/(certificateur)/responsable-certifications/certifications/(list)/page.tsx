"use client";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { format } from "date-fns";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";
import { SearchList } from "@/components/search/search-list/SearchList";

import { CertificationStatus } from "@/graphql/generated/graphql";

import { useCertifications } from "../../certifications.hooks";

const NoCertificationsToValidate = () => {
  return (
    <div
      className="grid grid-cols-3 grid-rows-1 w-11/12 m-auto"
      data-testid="no-certifications-to-validate"
    >
      <div className="col-span-2 m-auto">
        <h1 className="">Aucune certification à valider</h1>
        <p className="text-lg">
          Pour le moment, vous n’avez rien à valider. Si vous avez demandé
          l’ajout d’une ou de plusieurs certifications, elles s’afficheront ici
          très prochainement !
        </p>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/information.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

const NoVisibleCertifications = () => {
  return (
    <div
      className="grid grid-cols-3 grid-rows-1 w-11/12 m-auto"
      data-testid="no-visible-certifications"
    >
      <div className="col-span-2 m-auto">
        <h1 className="">Aucune certification visible</h1>
        <p className="text-lg mb-0">
          Pour être visible, la certification doit être validée par vos soins et
          active sur France compétences.
        </p>
        <Button
          linkProps={{
            href: "/responsable-certifications/certifications?CATEGORY=TO_VALIDATE",
          }}
          priority="tertiary"
          className="mt-10"
        >
          Voir les certifications à valider
        </Button>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/warning.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

const NoInvisibleCertifications = () => {
  return (
    <div
      className="grid grid-cols-3 grid-rows-1 w-11/12 m-auto"
      data-testid="no-invisible-certifications"
    >
      <div className="col-span-2 m-auto">
        <h1 className="">Aucune certification invisible</h1>
        <p className="text-lg mb-0">
          Retrouvez ici les certifications qui ne sont pas ou plus visibles sur
          la plateforme France VAE.
        </p>
      </div>
      <div className="m-auto">
        <Image
          src="/admin2/components/information.svg"
          alt="Success pictogram"
          width={282}
          height={319}
        />
      </div>
    </div>
  );
};

const getSearchTitle = (status: string, visible?: boolean) => {
  if (status === "A_VALIDER_PAR_CERTIFICATEUR") {
    return "Certifications à valider";
  }
  if (visible) {
    return "Certifications visibles";
  }
  return "Certifications invisibles";
};

const getSearchHint = (status: string, visible?: boolean) => {
  if (status === "A_VALIDER_PAR_CERTIFICATEUR") {
    return "Suite à votre demande d'intégration, vous trouverez ici toutes les certifications pré-remplies par les administrateurs France VAE. Vous devez les relire, les compléter, les modifier avant de les valider.";
  }
  if (visible) {
    return "Vous trouverez ici toutes les certifications visibles sur la plateforme France VAE.";
  }
  return "Vous trouverez ici toutes les certifications invisibles sur la plateforme France VAE.";
};

export default function RegistryManagerHomepage() {
  const searchParams = useSearchParams();
  const currentPathname = usePathname();
  const searchFilter = searchParams.get("search") || "";
  const page = searchParams.get("page");
  const currentPage = page ? Number.parseInt(page) : 1;
  const status = searchParams.get("status") as CertificationStatus;
  const stringParam = searchParams.get("visible");
  const visible =
    stringParam === "true" ? true : stringParam === "false" ? false : undefined;

  const { replace } = useRouter();

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", status || "A_VALIDER_PAR_CERTIFICATEUR");
    params.set("page", page || "1");

    if (!page || !status) {
      replace(`${currentPathname}?${params.toString()}`);
    }
  }, [replace, page, status, currentPathname]);

  const { certificationPage, getCertificationsQueryStatus } = useCertifications(
    {
      searchFilter,
      currentPage,
      status: status as CertificationStatus,
      visible,
    },
  );

  if (getCertificationsQueryStatus === "pending" || !certificationPage) {
    return null;
  }

  if (
    status === "A_VALIDER_PAR_CERTIFICATEUR" &&
    certificationPage.rows.length === 0 &&
    searchFilter === ""
  ) {
    return <NoCertificationsToValidate />;
  }

  if (
    status === "VALIDE_PAR_CERTIFICATEUR" &&
    visible &&
    certificationPage.rows.length === 0 &&
    searchFilter === ""
  ) {
    return <NoVisibleCertifications />;
  }

  if (
    status === "VALIDE_PAR_CERTIFICATEUR" &&
    !visible &&
    certificationPage.rows.length === 0 &&
    searchFilter === ""
  ) {
    return <NoInvisibleCertifications />;
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="mb-0">{getSearchTitle(status, visible)}</h1>
      <p className="mt-6 mb-12 text-xl">{getSearchHint(status, visible)}</p>
      {getCertificationsQueryStatus === "success" && (
        <SearchList
          searchFilter={searchFilter}
          searchResultsPage={certificationPage}
        >
          {(c) => (
            <WhiteCard key={c.id} className="gap-2">
              <div className="flex flex-row justify-between items-center">
                <span className="text-gray-500 text-sm">
                  Code RNCP : {c.codeRncp}
                </span>
                <BadgeCertificationStatus
                  status={c.status}
                  visible={c.visible}
                />
              </div>
              <span className="text-lg font-bold">{c.label}</span>
              <span>{c.certificationAuthorityStructure?.label}</span>
              <span>
                Date d'échéance : {format(c.rncpExpiresAt, "dd/MM/yyyy")}
              </span>
              <Button
                data-testid="access-certification-button"
                className="mt-2 ml-auto"
                linkProps={{
                  href: `/responsable-certifications/certifications/${c.id}`,
                }}
              >
                Accéder à la certification
              </Button>
            </WhiteCard>
          )}
        </SearchList>
      )}
    </div>
  );
}

const BadgeCertificationStatus = ({
  status,
  visible,
}: {
  status: CertificationStatus;
  visible: boolean;
}) => (
  <>
    {status == "A_VALIDER_PAR_CERTIFICATEUR" && (
      <Badge
        noIcon
        severity="new"
        data-testid="certification-timeline-element-envoye-pour-validation-badge"
      >
        à valider
      </Badge>
    )}

    {((status == "VALIDE_PAR_CERTIFICATEUR" && !visible) ||
      status == "INACTIVE") && (
      <Badge
        noIcon
        severity="warning"
        data-testid="certification-timeline-element-invisible-badge"
      >
        INVISIBLE
      </Badge>
    )}

    {status == "VALIDE_PAR_CERTIFICATEUR" && visible && (
      <Badge
        noIcon
        severity="success"
        data-testid="certification-timeline-element-visible-badge"
      >
        VISIBLE
      </Badge>
    )}
  </>
);
