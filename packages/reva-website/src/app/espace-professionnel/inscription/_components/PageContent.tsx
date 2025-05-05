"use client";
import { useProfessionalSpaceSubscriptionContext } from "@/components/professional-space/inscription/context/ProfessionalSpaceSubscriptionContext";
import { AccountInfoStepForm } from "@/components/professional-space/inscription/form/AccountInfoStepForm";
import { CguStep } from "@/components/professional-space/inscription/form/CguStep";
import { CompanyDocumentsStepForm } from "@/components/professional-space/inscription/form/CompanyDocumentsStepForm";
import { CompanySiretStepForm } from "@/components/professional-space/inscription/form/CompanySiretStepForm";
import { GetCguQuery } from "@/graphql/generated/graphql";

const PageContent = ({ getCguResponse }: { getCguResponse: GetCguQuery }) => {
  const { currentStep } = useProfessionalSpaceSubscriptionContext();
  switch (currentStep) {
    case "cguStep":
      return <CguStep getCguResponse={getCguResponse} />;
    case "companySiretStep":
      return <CompanySiretStepForm />;
    case "accountInfoStep":
      return <AccountInfoStepForm />;
    case "companyDocumentsStep":
      return <CompanyDocumentsStepForm />;
    default:
      return <div>unknown step</div>;
  }
};

export default PageContent;
