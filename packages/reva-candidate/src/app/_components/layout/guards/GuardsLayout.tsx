import { AuthGuard } from "./AuthGuard";
import { CandidacyGuard } from "./CandidacyGuard";
import { LoadingGuard } from "./LoadingGuard";

export const GuardsLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <LoadingGuard>
      <CandidacyGuard>{children}</CandidacyGuard>
    </LoadingGuard>
  </AuthGuard>
);
