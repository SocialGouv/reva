export interface ExamInfo {
  id: string;
  examResult: ExamResult | null;
  estimatedExamDate: Date | null;
  actualExamDate: Date | null;
}

export type ExamResult =
  | "SUCCESS"
  | "PARTIAL_SUCCESS"
  | "PARTIAL_CERTIFICATION_SUCCESS"
  | "FAILURE";
