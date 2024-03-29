import { Alert } from "@codegouvfr/react-dsfr/Alert";
export const ErrorAlert = ({ message }: { message: string }) => (
  <div role="alert" className="my-8">
    <Alert
      description={message}
      severity="error"
      title="Une erreur est survenue"
    />
  </div>
);
