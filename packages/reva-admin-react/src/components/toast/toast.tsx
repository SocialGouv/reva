import Alert from "@codegouvfr/react-dsfr/Alert";
import toast from "react-hot-toast";

export const successToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="success" title={message} className="bg-white" />
  ));

export const errorToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="error" title={message} className="bg-white" />
  ));

export const infoToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="info" title={message} className="bg-white" />
  ));

export const warningToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="warning" title={message} className="bg-white" />
  ));

export const graphqlErrorToast = (error: any) => {
  const message = error?.response?.errors
    ?.map((e: { message?: string }) => e?.message)
    ?.join(", ");
  errorToast(message ?? error?.message ?? JSON.stringify(error));
};
