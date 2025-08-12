import { useIsMutating } from "@tanstack/react-query";

import { Loader } from "@/components/legacy/atoms/Icons";
import { PageLayout } from "@/layouts/page.layout";

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
    return (
      <PageLayout
        data-test="loading-guard"
        className="flex-1 flex flex-col items-center justify-center"
      >
        <div className="w-8">
          <Loader />
        </div>
      </PageLayout>
    );
  }

  return children;
};
