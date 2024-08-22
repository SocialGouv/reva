"use client";
import { useAuth } from "@/components/auth/auth";
import { useRouter } from "next/navigation";

const PostLoginPage = () => {
  const { isCertificationAuthority, isCertificationRegistryManager } =
    useAuth();
  const router = useRouter();

  if (isCertificationAuthority) {
    router.replace("/candidacies/feasibilities");
  } else if (isCertificationRegistryManager) {
    router.replace("/certifications");
  } else {
    router.replace("/candidacies");
  }
  return null;
};

export default PostLoginPage;
