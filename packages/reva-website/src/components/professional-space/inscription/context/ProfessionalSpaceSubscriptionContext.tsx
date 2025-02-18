import { graphqlErrorToast } from "@/components/toast/toast";
import { GRAPHQL_API_URL } from "@/config/config";
import { graphql } from "@/graphql/generated";
import { CreateSubscriptionRequestInput } from "@/graphql/generated/graphql";
import { useRouter } from "next/router";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Client, fetchExchange } from "urql";

const createSubscriptionRequest = graphql(`
  mutation createSubscriptionRequest(
    $createSubscriptionRequestInput: CreateSubscriptionRequestInput!
  ) {
    subscription_createSubscriptionRequest(
      createSubscriptionRequestInput: $createSubscriptionRequestInput
    )
  }
`);

type LegalStatus =
  | "EI"
  | "EURL"
  | "SARL"
  | "SAS"
  | "SASU"
  | "SA"
  | "EIRL"
  | "ASSOCIATION_LOI_1901"
  | "ETABLISSEMENT_PUBLIC"
  | "FONDATION"
  | "AUTRE"
  | "NC";

interface ProfessionalSpaceInfo {
  isCguCheckboxChecked: boolean;
  companySiret: string;
  companyLegalStatus: LegalStatus;
  companyName: string;

  managerFirstname: string;
  managerLastname: string;
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
  | "companyWebsite"
  | "managerFirstname"
  | "managerLastname"
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
    submitCompanyDocumentsStep: (
      stepData: CompanyDocumentsStep,
    ) => Promise<void>;
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.currentStep]);

  const goBackToPreviousStep = useCallback(() => {
    const newCurrentStep = state.currentStep;

    const previousStepOf = {
      cguStep: "cguStep" as Step,
      companySiretStep: "cguStep" as Step,
      accountInfoStep: "companySiretStep" as Step,
      companyDocumentsStep: "accountInfoStep" as Step,
    };

    setState({ ...state, currentStep: previousStepOf[newCurrentStep] });
  }, [state]);

  const submitCguStep = useCallback(
    (stepData: CguStepData) => {
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
          accountLastname: stepData.managerLastname,
          accountFirstname: stepData.managerFirstname,
          delegataire: false,
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
      const newState = {
        currentStep: "companyDocumentsStep",
        professionalSpaceInfos: {
          ...state.professionalSpaceInfos,
          ...stepData,
        },
      } as const;

      setState(newState);

      const client = new Client({
        url: GRAPHQL_API_URL,
        exchanges: [fetchExchange],
      });

      const { isCguCheckboxChecked, ...mutationParameters } =
        newState.professionalSpaceInfos;
      try {
        const result = await client.mutation(createSubscriptionRequest, {
          createSubscriptionRequestInput:
            mutationParameters as CreateSubscriptionRequestInput,
        });
        if (result.error) {
          throw new Error(result.error.graphQLErrors[0].message);
        }
        router.push("/espace-professionnel/inscription/confirmation");
      } catch (e) {
        graphqlErrorToast(e);
      }
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
