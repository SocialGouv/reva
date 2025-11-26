"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

const PostLoginPage = () => {
  const router = useRouter();
  const { isFeatureActive } = useFeatureflipping();
  const isCertificateurCandidaciesAnnuaireFeatureActive = isFeatureActive(
    "CERTIFICATEUR_CANDIDACIES_ANNUAIRE",
  );

  const certificationAuthorityDefaultPath =
    isCertificateurCandidaciesAnnuaireFeatureActive
      ? "/candidacies/annuaire"
      : "/candidacies/feasibilities";

  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  useEffect(() => {
    if (isCertificationAuthority) {
      router.replace(certificationAuthorityDefaultPath);
    } else if (isCertificationRegistryManager) {
      router.replace("/responsable-certifications");
    } else {
      router.replace("/candidacies");
    }
  }, [
    isCertificationAuthority,
    isCertificationRegistryManager,
    router,
    certificationAuthorityDefaultPath,
  ]);

  return null;
};

export default PostLoginPage;
