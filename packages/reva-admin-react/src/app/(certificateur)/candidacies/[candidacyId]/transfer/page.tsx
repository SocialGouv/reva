"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  CertificationAuthority,
  CertificationAuthorityPaginated,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  CertificationAuthoritySearchList,
  CertificationAuthorityValidation,
  useTransferCandidacy,
} from "./_components";

export default function TransferCandidacyPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [searchFilter, setSearchFilter] = useState("");
  const [certificationAuthoritySelected, setCertificationAuthoritySelected] =
    useState<CertificationAuthority | null>(null);

  const {
    certificationAuthorities,
    certificationAuthoritiesStatus,
    certificationAuthoritiesIsLoading,
    transferCandidacyToAnotherCertificationAuthorityMutation,
    candidacy,
    candidacyIsLoading,
  } = useTransferCandidacy({ searchFilter });

  const updateSearchFilter = (newSearchFilter: string) => {
    setSearchFilter(newSearchFilter);
    router.push(pathname);
  };

  const handleTransferCandidacy = async ({
    certificationAuthorityId,
    transferReason,
  }: {
    certificationAuthorityId: string;
    transferReason: string;
  }) => {
    try {
      await transferCandidacyToAnotherCertificationAuthorityMutation({
        certificationAuthorityId,
        transferReason,
      });

      successToast({
        title: "La candidature a été transférée avec succès",
        description:
          "Le nouveau service recevra un mail pour prendre connaissance de ce transfert.",
        closable: true,
      });
      router.push("/candidacies/feasibilities");
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  if (
    certificationAuthoritiesIsLoading ||
    candidacyIsLoading ||
    certificationAuthoritiesStatus !== "success"
  ) {
    return null;
  }

  if (!certificationAuthorities?.rows.length) {
    return (
      <Alert
        title={`Nous n'avons trouvé aucun certificateur disponible pour la certification ${candidacy?.certification?.label ?? ""}.`}
        severity="info"
      />
    );
  }
  return (
    <div>
      <h1>Transfert de la candidature</h1>
      <p className="text-xl">
        {certificationAuthoritySelected
          ? `Vous vous apprêtez à transférer la candidature de ${candidacy?.firstname} ${candidacy?.lastname} visant la certification ${candidacy?.certification?.label} à un nouveau service.`
          : "Recherchez le service régional auquel vous souhaitez transférer cette candidature."}
      </p>

      <div className="my-12">
        {certificationAuthoritySelected ? (
          <CertificationAuthorityValidation
            certificationAuthority={certificationAuthoritySelected}
            setCertificationAuthoritySelected={
              setCertificationAuthoritySelected
            }
            onTransferCandidacy={(transferReason: string) =>
              handleTransferCandidacy({
                certificationAuthorityId: certificationAuthoritySelected.id,
                transferReason,
              })
            }
          />
        ) : (
          <CertificationAuthoritySearchList
            certificationAuthorities={
              certificationAuthorities as CertificationAuthorityPaginated
            }
            updateSearchFilter={updateSearchFilter}
            searchFilter={searchFilter}
            setCertificationAuthoritySelected={
              setCertificationAuthoritySelected
            }
          />
        )}
      </div>
    </div>
  );
}
