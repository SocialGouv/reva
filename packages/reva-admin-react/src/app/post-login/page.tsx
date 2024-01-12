"use client";
import { useAuth } from "@/components/auth/auth";
import { ADMIN_ELM_URL } from "@/config/config";
import { useRouter } from "next/navigation";

const PostLoginPage = () => {
  const { isCertificationAuthority } = useAuth();
  const router = useRouter();

  if (isCertificationAuthority) {
    router.replace("/feasibilities?CATEGORY=ALL");
  } else {
    router.replace(ADMIN_ELM_URL + "/candidacies");
  }
  return null;
};

export default PostLoginPage;
