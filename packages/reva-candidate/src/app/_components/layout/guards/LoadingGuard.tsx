import { Loader } from "@/components/legacy/atoms/Icons";
import { PageLayout } from "@/layouts/page.layout";

import { useLayout } from "../layout.hook";

export const LoadingGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useLayout();

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
