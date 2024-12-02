"use client";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import {
  CertificationAuthority,
  CertificationAuthorityPaginated,
} from "@/graphql/generated/graphql";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  CertificationAuthoritySearchList,
  CertificationAuthorityValidation,
  EmptyStateCertificationSearch,
  useTransferCandidacy,
} from "./_components";

export default function TransferCandidacyPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";

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

  return (
    <div>
      <h1>Transfert de la candidature</h1>
      <p className="text-xl">
        {certificationAuthoritySelected
          ? `Vous vous apprêtez à transférer la candidature de ${candidacy?.candidate?.firstname} ${candidacy?.candidate?.lastname} visant la certification ${candidacy?.certification?.label} à un nouveau service.`
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
          <>
            <CertificationAuthoritySearchList
              certificationAuthorities={
                certificationAuthorities as CertificationAuthorityPaginated
              }
              searchFilter={searchFilter}
              setCertificationAuthoritySelected={
                setCertificationAuthoritySelected
              }
            />
            {certificationAuthorities?.rows?.length === 0 && (
              <EmptyStateCertificationSearch searchFilter={searchFilter} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
