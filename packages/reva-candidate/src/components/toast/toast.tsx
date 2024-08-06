import Alert from "@codegouvfr/react-dsfr/Alert";
import toast from "react-hot-toast";

interface GraphQLError {
  response?: {
    errors?: Array<{ message?: string }>;
  };
  message?: string;
}

export const successToast = (
  props:
    | {
        title: string;
        description?: string;
        closable?: boolean;
      }
    | string,
) => {
  const {
    title,
    description = "",
    closable = false,
  } = typeof props === "string" ? { title: props } : props;
  return toast.custom(
    () => (
      <Alert
        severity="success"
        title={title}
        description={description}
        className="bg-white"
        closable={closable as true}
        onClose={() => {
          toast.dismiss();
        }}
      />
    ),
    { duration: closable ? 10000 : 3000 },
  );
};

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

export const graphqlErrorToast = (error: GraphQLError) => {
  const message = error?.response?.errors
    ?.map((e: { message?: string }) => e?.message)
    ?.join(", ");
  errorToast(message ?? error?.message ?? JSON.stringify(error));
};
