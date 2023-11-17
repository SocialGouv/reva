import { Alert } from "@codegouvfr/react-dsfr/Alert";

export const NotImplementedPage = ({ title }: { title: string }) => (
  <div className="flex flex-col">
    <h1 className="leading-6 font-bold text-2xl mb-8">{title}</h1>
    <Alert
      severity="info"
      title=""
      description="Cette fonctionnalité sera bientôt disponible."
    />
  </div>
);
