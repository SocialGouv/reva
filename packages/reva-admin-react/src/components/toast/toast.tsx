import Alert from "@codegouvfr/react-dsfr/Alert";
import toast from "react-hot-toast";

interface GraphQLError {
  response?: {
    errors?: Array<{ message?: string }>;
  };
  message?: string;
}

const genericToast = (props: {
  title: string;
  severity: "success" | "error" | "warning" | "info";
  description?: string;
  closable?: boolean;
}) => {
  const { title, severity, description = "", closable = false } = props;
  return toast.custom(
    () => (
      <Alert
        severity={severity}
        title={title}
        description={description}
        className="bg-white"
        closable={closable as true}
        onClose={() => {
          toast.dismiss();
        }}
        data-testid={`toast-${severity}`}
      />
    ),
    { duration: closable ? 10000 : 3000 },
  );
};

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
  return genericToast({ title, severity: "success", description, closable });
};

export const errorToast = (message: string) =>
  genericToast({ title: message, severity: "error" });

// eslint-disable-next-line import/no-unused-modules
export const infoToast = (message: string) =>
  genericToast({ title: message, severity: "info" });

// eslint-disable-next-line import/no-unused-modules
export const warningToast = (message: string) =>
  genericToast({ title: message, severity: "warning" });

export const graphqlErrorToast = (_error: unknown) => {
  const error = _error as GraphQLError;
  const message = error?.response?.errors
    ?.map((e: { message?: string }) => e?.message)
    ?.join(", ");
  errorToast(message ?? error?.message ?? JSON.stringify(error));
};
