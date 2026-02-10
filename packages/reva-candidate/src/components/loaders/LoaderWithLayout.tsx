import { DefaultLoader } from "./DefaultLoader";

export const LoaderWithLayout = () => (
  <div
    data-testid="loading-guard"
    className="flex-1 flex flex-col items-center justify-center"
  >
    <div className="w-8">
      <DefaultLoader />
    </div>
  </div>
);
