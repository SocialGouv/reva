import { useRouter } from "next/router";
import { useCallback, useContext, useState } from "react";
import { ReactNode, createContext } from "react";

type LegalStatus =
  | "ASSOCIATION_LOI_1901"
  | "EI"
  | "EIRL"
  | "ETABLISSEMENT_PUBLIC"
  | "EURL"
  | "SARL"
  | "SAS"
  | "SASU"
  | "SA";

interface ProfessionalSpaceInfo {
  isCguCheckboxChecked: boolean;
  companySiret: string;
  companyLegalStatus: LegalStatus;
  companyName: string;
  companyAddress: string;
  companyZipCode: string;
  companyCity: string;
  presidentFirstname: string;
  presidentLastname: string;
  accountFirstname: string;
  accountLastname: string;
  accountEmail: string;
  accountPhoneNumber: string;
  companyWebsite: string;
  hasQualiopiVAE: boolean;
  delegataire: boolean;
  attestationURSSAF: File;
  justificatifIdentiteDirigeant: File;
  lettreDeDelegation?: File;
  justificatifIdentiteDelegataire?: File;
}

type Step =
  | "cguStep"
  | "companySiretStep"
  | "accountInfoStep"
  | "companyDocumentsStep";

interface ProfessionalSpaceSubscriptionState {
  currentStep: Step;
  professionalSpaceInfos: Partial<ProfessionalSpaceInfo>;
}

type CguStepData = Pick<ProfessionalSpaceInfo, "isCguCheckboxChecked">;

type CompanySiretStepData = Pick<
  ProfessionalSpaceInfo,
  | "companySiret"
  | "companyLegalStatus"
  | "companyName"
  | "companyAddress"
  | "companyZipCode"
  | "companyCity"
  | "companyWebsite"
  | "presidentFirstname"
  | "presidentLastname"
>;

type AccountInfoStepData = Pick<
  ProfessionalSpaceInfo,
  | "accountFirstname"
  | "accountLastname"
  | "accountEmail"
  | "accountPhoneNumber"
  | "delegataire"
>;

type CompanyDocumentsStep = Pick<
  ProfessionalSpaceInfo,
  | "attestationURSSAF"
  | "justificatifIdentiteDirigeant"
  | "lettreDeDelegation"
  | "justificatifIdentiteDelegataire"
>;

type ProfessionalSpaceSubscriptionContext =
  ProfessionalSpaceSubscriptionState & {
    goBackToPreviousStep: () => void;
    submitCguStep: (stepData: CguStepData) => void;
    submitCompanySiretStep: (stepData: CompanySiretStepData) => void;
    submitAccountInfoStep: (stepData: AccountInfoStepData) => void;
    submitCompanyDocumentsStep: (stepData: CompanyDocumentsStep) => void;
  };

const ProfessionalSpaceSubscriptionContext =
  createContext<ProfessionalSpaceSubscriptionContext>(
    {} as ProfessionalSpaceSubscriptionContext,
  );

export const ProfessionalSpaceSubscriptionProvider = (props: {
  children?: ReactNode;
}) => {
  const router = useRouter();

  const [state, setState] = useState<ProfessionalSpaceSubscriptionState>({
    currentStep: "cguStep",
    professionalSpaceInfos: {},
  });

  const goBackToPreviousStep = useCallback(() => {
    let newCurrentStep = state.currentStep;

    let previousStepOf = {
      cguStep: "cguStep" as Step,
      companySiretStep: "cguStep" as Step,
      accountInfoStep: "companySiretStep" as Step,
      companyDocumentsStep: "accountInfoStep" as Step,
    };

    setState({ ...state, currentStep: previousStepOf[newCurrentStep] });
  }, [state]);

  const submitCguStep = useCallback(
    (stepData: CguStepData) => {
      console.log(stepData);
      setState({
        currentStep: "companySiretStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state],
  );

  const submitCompanySiretStep = useCallback(
    (stepData: CompanySiretStepData) => {
      setState({
        currentStep: "accountInfoStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state],
  );

  const submitAccountInfoStep = useCallback(
    (stepData: AccountInfoStepData) => {
      setState({
        currentStep: "companyDocumentsStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      });
    },
    [state],
  );

  const submitCompanyDocumentsStep = useCallback(
    async (stepData: CompanyDocumentsStep) => {
      setState({
        currentStep: "companyDocumentsStep",
        professionalSpaceInfos: state.professionalSpaceInfos,
      });

      await router.push("/espace-professionnel/creation/confirmation");
    },
    [router, state.professionalSpaceInfos],
  );

  return (
    <ProfessionalSpaceSubscriptionContext.Provider
      value={{
        ...state,
        goBackToPreviousStep,
        submitCguStep,
        submitAccountInfoStep,
        submitCompanySiretStep,
        submitCompanyDocumentsStep,
      }}
    >
      {props.children}
    </ProfessionalSpaceSubscriptionContext.Provider>
  );
};

export const useProfessionalSpaceSubscriptionContext = () =>
  useContext(ProfessionalSpaceSubscriptionContext);
