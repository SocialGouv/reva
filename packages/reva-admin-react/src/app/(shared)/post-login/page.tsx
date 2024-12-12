"use client";
import { useAuth } from "@/components/auth/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PostLoginPage = () => {
  const router = useRouter();

  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();

  useEffect(() => {
    if (isCertificationAuthority) {
      router.replace("/candidacies/feasibilities");
    } else if (isCertificationRegistryManager) {
      router.replace("/responsable-certifications");
    } else {
      router.replace("/candidacies");
    }
  }, [isCertificationAuthority, isCertificationRegistryManager, router]);

  return null;
};

export default PostLoginPage;
