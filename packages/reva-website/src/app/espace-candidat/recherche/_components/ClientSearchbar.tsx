"use client";
import { useRouter } from "next/navigation";

import { CertificateAutocompleteDsfr } from "@/components/candidate-registration/certificate-autocomplete-dsfr/CertificateAutocompleteDsfr";

export const ClientSearchbar = ({ searchText }: { searchText: string }) => {
  const router = useRouter();
  return (
    <CertificateAutocompleteDsfr
      defaultLabel=""
      defaultValue={searchText}
      onSubmit={({ label }) => {
        router.push(
          `/espace-candidat/recherche?searchText=${encodeURIComponent(label)}`,
        );
      }}
      onOptionSelection={(o) => router.push(`/certifications/${o.value}`)}
    />
  );
};
