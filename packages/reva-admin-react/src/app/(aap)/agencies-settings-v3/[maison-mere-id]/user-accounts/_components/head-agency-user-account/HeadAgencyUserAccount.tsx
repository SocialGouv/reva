"use client";

import { FormOptionalFieldsDisclaimer } from "@/components/form-optional-fields-disclaimer/FormOptionalFieldsDisclaimer";
import { graphqlErrorToast, successToast } from "@/components/toast/toast";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { useUpdateUserAccountPage } from "./updateUserAccount.hook";
import { UserAccountForm, UserAccountFormData } from "./UserAccountForm";
import { DisableAccount } from "@/components/disable-account";

const HeadAgencyUserAccount = () => {
  const { userAccountId } = useParams<{ userAccountId: string }>();
  const router = useRouter();
  const {
    userAccount,
    remoteOrganism,
    onsiteOrganisms,
    agenciesInfoIsSuccess,
    updateUserAccount,
    isAdmin,
    maisonMereAAPId,
  } = useUpdateUserAccountPage({ userAccountId });

  const backUrl = isAdmin
    ? `/maison-mere-aap/${maisonMereAAPId}`
    : `/agencies-settings-v3`;

  const handleFormSubmit = async (data: UserAccountFormData) => {
    try {
      await updateUserAccount.mutateAsync({
        accountId: userAccountId,
        accountEmail: data.email,
        accountFirstname: data.firstname,
        accountLastname: data.lastname,
        organismId: data.organismId,
      });
      successToast("Modification enregistrées");
      router.push(backUrl);
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const defaultValues = useMemo(
    () => ({
      email: userAccount?.email || "",
      firstname: userAccount?.firstname || "",
      lastname: userAccount?.lastname || "",
      organismId: userAccount?.organism?.id,
      modalitesAccompagnement:
        userAccount?.organism?.modaliteAccompagnement === "A_DISTANCE"
          ? ("REMOTE" as const)
          : ("ONSITE" as const),
    }),
    [
      userAccount?.email,
      userAccount?.firstname,
      userAccount?.lastname,
      userAccount?.organism?.id,
      userAccount?.organism?.modaliteAccompagnement,
    ],
  );

  if (!agenciesInfoIsSuccess) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      <h1 className="mb-12">
        {userAccount?.firstname} {userAccount?.lastname}
      </h1>
      <FormOptionalFieldsDisclaimer />
      <UserAccountForm
        disabled={!!userAccount?.disabledAt}
        onSubmit={handleFormSubmit}
        defaultValues={defaultValues}
        remoteAgency={{
          id: remoteOrganism?.id,
          label:
            remoteOrganism?.informationsCommerciales?.nom ||
            remoteOrganism?.label ||
            "",
        }}
        onSiteAgencies={onsiteOrganisms.map((o) => ({
          id: o.id,
          label: o.informationsCommerciales?.nom || o.label,
        }))}
        backUrl={backUrl}
        FooterComponent={
          !userAccount?.disabledAt && (
            <DisableAccount accountId={userAccountId} />
          )
        }
      />
    </div>
  );
};

export default HeadAgencyUserAccount;
