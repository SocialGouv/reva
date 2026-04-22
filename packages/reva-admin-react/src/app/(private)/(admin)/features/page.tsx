"use client";

import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

import { graphqlErrorToast, successToast } from "@/components/toast/toast";

import { useFeaturesPage } from "./featuresPage.hook";

const FeaturesPage = () => {
  const { features, getFeaturesStatus, toggleFeature } = useFeaturesPage();

  const handleFeatureActivationChange = async ({
    featureKey,
    isActive,
  }: {
    featureKey: string;
    isActive: boolean;
  }) => {
    try {
      await toggleFeature.mutateAsync({ featureKey, isActive });
      successToast("modifications enregistrées");
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className="flex flex-col">
      <h1>Features actives</h1>

      {getFeaturesStatus === "success" && (
        <div className="flex flex-col mt-6 ml-6">
          <Checkbox
            options={features.map((f) => ({
              label: f.label,
              hintText: f.key,
              nativeInputProps: {
                value: f.key,
                defaultChecked: f.isActive,
                onChange: (e) =>
                  handleFeatureActivationChange({
                    featureKey: f.key,
                    isActive: e.target.checked,
                  }),
              },
            }))}
          />
        </div>
      )}
    </div>
  );
};

export default FeaturesPage;
