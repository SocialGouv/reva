import { useIsMutating } from "@tanstack/react-query";

import { LoaderWithLayout } from "@/components/loaders/LoaderWithLayout";

import { useLayout } from "../layout.hook";

export const LoadingGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLayoutLoading } = useLayout();
  const isLoginWithTokenMutating = useIsMutating({
    mutationKey: ["candidate_loginWithToken"],
  });

  const isLoginWithCredentialsMutating = useIsMutating({
    mutationKey: ["candidate_loginWithCredentials"],
  });

  const isLoading =
    isLayoutLoading ||
    isLoginWithTokenMutating ||
    isLoginWithCredentialsMutating;

  if (isLoading) {
    return <LoaderWithLayout />;
  }

  return children;
};
