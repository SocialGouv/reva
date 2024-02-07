import { SmallNotice } from "@/components/small-notice/SmallNotice";
import { errorToast, successToast } from "@/components/toast/toast";
import {
  CreateOrUpdateOrganismWithMaisonMereAapInput,
  Organism,
  UpdateMaisonMereAapInput,
} from "@/graphql/generated/graphql";
import { useDepartementsOnRegions } from "@/hooks";
import { ZoneInterventionList } from "@/types";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import {
  MaisonMereAAPFormData,
  maisonMereAAPFormSchema,
} from "./maisonMereFormSchema";
import ZoneIntervention from "@/components/zone-intervention/ZoneIntervention";
import { graphql } from "@/graphql/generated";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMutation } from "@tanstack/react-query";
import { TreeSelectItem } from "@/components/tree-select";

const modalCreateAgence = createModal({
  id: "modal-create-agence",
  isOpenedByDefault: false,
});

const adminUpdateMaisonMereAAPMutation = graphql(`
  mutation adminUpdateMaisonMereAAP(
    $maisonMereAAPId: ID!
    $data: UpdateMaisonMereAAPInput!
  ) {
    organism_adminUpdateMaisonMereAAP(
      maisonMereAAPId: $maisonMereAAPId
      maisonMereAAPData: $data
    ) {
      id
    }
  }
`);

function MaisonMereAAPForm({
  maisonMereAAPId,
  onSiteDepartmentsOnRegions,
  remoteDepartmentsOnRegions,
}: {
  maisonMereAAPId: string;
  onSiteDepartmentsOnRegions: TreeSelectItem[];
  remoteDepartmentsOnRegions: TreeSelectItem[];
}) {
  const router = useRouter();

  const { graphqlClient } = useGraphQlClient();

  const adminUpdateMaisonMereAAP = useMutation({
    mutationFn: (params: {
      maisonMereAAPId: string;
      data: UpdateMaisonMereAapInput;
    }) => graphqlClient.request(adminUpdateMaisonMereAAPMutation, params),
  });

  const methods = useForm<MaisonMereAAPFormData>({
    resolver: zodResolver(maisonMereAAPFormSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = methods;

  useEffect(() => {
    setValue("zoneInterventionPresentiel", onSiteDepartmentsOnRegions);
    setValue("zoneInterventionDistanciel", remoteDepartmentsOnRegions);
  });

  const handleFormSubmit = handleSubmit(async (data) => {
    const zoneInterventionPresentiel = data.zoneInterventionPresentiel;
    const zoneInterventionDistanciel = data.zoneInterventionDistanciel;

    const departmentsWithOrganismMethodUnfiltered: Record<
      string,
      { isOnSite: boolean; isRemote: boolean }
    > = {};

    if (zoneInterventionPresentiel) {
      zoneInterventionPresentiel.forEach((region) => {
        region.children?.forEach((departement) => {
          if (departement.selected) {
            if (!departmentsWithOrganismMethodUnfiltered[departement.id]) {
              departmentsWithOrganismMethodUnfiltered[departement.id] = {
                isOnSite: true,
                isRemote: false,
              };
            } else {
              departmentsWithOrganismMethodUnfiltered[departement.id].isOnSite =
                true;
            }
          }
        });
      });
    }

    if (zoneInterventionDistanciel) {
      zoneInterventionDistanciel.forEach((region) => {
        region.children?.forEach((departement) => {
          if (departement.selected) {
            if (!departmentsWithOrganismMethodUnfiltered[departement.id]) {
              departmentsWithOrganismMethodUnfiltered[departement.id] = {
                isOnSite: false,
                isRemote: true,
              };
            } else {
              departmentsWithOrganismMethodUnfiltered[departement.id].isRemote =
                true;
            }
          }
        });
      });
    }

    const departmentsWithOrganismMethod = Object.entries(
      departmentsWithOrganismMethodUnfiltered,
    )
      .filter(([, { isOnSite, isRemote }]) => isOnSite || isRemote)
      .map(([departmentId, { isOnSite, isRemote }]) => ({
        departmentId,
        isOnSite,
        isRemote,
      }));

    if (!departmentsWithOrganismMethod.length) {
      errorToast("Veuillez sélectionner au moins un département");
      return;
    }
    const organismData = {
      departmentsWithOrganismMethods: departmentsWithOrganismMethod,
    };

    try {
      await adminUpdateMaisonMereAAP.mutateAsync({
        maisonMereAAPId,
        data: { zoneIntervention: departmentsWithOrganismMethod },
      });

      router.push("/subscriptions/validated");
    } catch (e) {
      console.log(e);
      errorToast("Une erreur est survenue");
    }
  });

  return (
    <>
      <div className="w-full flex flex-col items-center justify-center p-8">
        <FormProvider {...methods}>
          <form onSubmit={handleFormSubmit}>
            <div className="flex flex-col gap-16 mb-6">
              <div className="w-full">
                <ZoneIntervention />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-end justify-between">
              <div></div>
              <div className="flex flex-col md:flex-row gap-4 self-center md:self-end mt-8 md:mt-0">
                <Button disabled={isSubmitting}>Enregistrer</Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </>
  );
}

export default MaisonMereAAPForm;
