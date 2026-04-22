"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth";

const PostLoginPage = () => {
  const router = useRouter();

  const certificationAuthorityDefaultPath = "/candidacies/annuaire";

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
