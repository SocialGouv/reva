"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SearchList } from "@/components/search/search-list/SearchList";
import { successToast, graphqlErrorToast } from "@/components/toast/toast";

import { CertificationAuthorityCard } from "./_components/CertificationAuthorityCard";
import { useMultipleCertificationAuthoritiesListPage } from "./multipleCertificationAuthoritiesList.hooks";

const confirmModal = createModal({
  id: "confirm-update-certification-authority",
  isOpenedByDefault: false,
});

const MultipleCertificationAuthoritiesListPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const router = useRouter();

  const searchParams = useSearchParams();
  const searchParamsPage = searchParams.get("page");
  const currentPage = searchParamsPage ? Number(searchParamsPage) : 1;
  const searchFilter = searchParams.get("search") ?? "";

  const {
    certificationAuthoritiesPage,
    currentCertificationAuthority,
    certification,
    candidate,
    updateCertificationAuthority,
  } = useMultipleCertificationAuthoritiesListPage({
    candidacyId,
    currentPage,
    searchFilter,
  });

  const [pendingCertificationAuthority, setPendingCertificationAuthority] =
    useState<{ id: string; label: string } | null>(null);

  const submitUpdate = async (certificationAuthorityId: string) => {
    try {
      await updateCertificationAuthority.mutateAsync({
        certificationAuthorityId,
      });
      successToast("Le certificateur a été mis à jour");
      router.push(
        `/candidacies/${candidacyId}/summary/certification-authority-details`,
      );
    } catch (error) {
      graphqlErrorToast(error);
    }
  };

  const handleCardClick = ({
    certificationAuthorityId,
    certificationAuthorityLabel,
  }: {
    certificationAuthorityId: string;
    certificationAuthorityLabel: string;
  }) => {
    if (currentCertificationAuthority) {
      setPendingCertificationAuthority({
        id: certificationAuthorityId,
        label: certificationAuthorityLabel,
      });
      confirmModal.open();
    } else {
      submitUpdate(certificationAuthorityId);
    }
  };

  return (
    <div className="flex flex-col">
      <h1>Certificateur</h1>
      <p>
        Le certificateur sélectionné devra étudier les dossiers de faisabilité
        et de validation de cette candidature. Vous devez en choisir un parmi
        les certificateurs couvrant la certification sélectionnée.
      </p>

      <SearchList
        searchResultsPage={certificationAuthoritiesPage}
        searchFilter={searchFilter}
      >
        {(certificationAuthority) => (
          <CertificationAuthorityCard
            key={certificationAuthority.id}
            label={certificationAuthority.label}
            contactEmail={certificationAuthority.contactEmail}
            contactPhone={certificationAuthority.contactPhone}
            onClick={() =>
              handleCardClick({
                certificationAuthorityId: certificationAuthority.id,
                certificationAuthorityLabel: certificationAuthority.label,
              })
            }
          />
        )}
      </SearchList>

      <Button
        priority="secondary"
        linkProps={{ href: `/candidacies/${candidacyId}/summary` }}
      >
        Retour
      </Button>

      <confirmModal.Component
        title={
          <span className="flex gap-2">
            <span className="fr-icon-arrow-left-right-line fr-icon--lg hidden md:block" />
            <span> Confirmation du choix du certificateur</span>
          </span>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            onClick: () => {
              if (pendingCertificationAuthority) {
                submitUpdate(pendingCertificationAuthority.id);
              }
            },
            children: "Confirmer",
          },
        ]}
      >
        <p>
          Vous êtes sur le point de changer de certificateur pour la candidature
          de {candidate?.lastname} {candidate?.firstname} sur la certification :{" "}
          {certification?.codeRncp} - {certification?.label}.
        </p>
        <div className="grid grid-rows-[1fr_100px_1fr] md:grid-rows-1 md:grid-cols-[1fr_100px_1fr] mb-10">
          <Rectangle>{currentCertificationAuthority?.label}</Rectangle>
          <Arrow />
          <Rectangle>{pendingCertificationAuthority?.label}</Rectangle>
        </div>
        <p>Confirmez vous ce changement ?</p>
      </confirmModal.Component>
    </div>
  );
};

export default MultipleCertificationAuthoritiesListPage;

const Rectangle = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="border border-gray-200 p-2 h-[160px] flex items-center justify-center font-bold text-xl">
      {children}
    </span>
  );
};

const Arrow = () => (
  <>
    <span className="fr-icon-arrow-right-line fr-icon--lg items-center justify-center hidden md:flex" />
    <span className="fr-icon-arrow-down-line fr-icon--lg items-center justify-center flex md:hidden" />
  </>
);
