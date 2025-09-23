import { DossierDeValidationDecision } from "@/graphql/generated/graphql";

export interface DossierDeValidationFixture {
  id: string;
  decision: DossierDeValidationDecision;
  decisionSentAt?: number;
  decisionComment?: string;
  dossierDeValidationSentAt: number;
  dossierDeValidationFile: {
    name: string;
    previewUrl?: string | null;
  };
  dossierDeValidationOtherFiles: Array<{
    name: string;
    previewUrl?: string | null;
  }>;
  history: Array<{
    id: string;
    decisionSentAt?: number;
    decisionComment?: string;
  }>;
}
