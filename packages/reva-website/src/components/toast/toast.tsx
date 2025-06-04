import Alert from "@codegouvfr/react-dsfr/Alert";
import toast from "react-hot-toast";

// eslint-disable-next-line import/no-unused-modules
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

const errorToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="error" title={message} className="bg-white" />
  ));

// eslint-disable-next-line import/no-unused-modules
export const infoToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="info" title={message} className="bg-white" />
  ));

// eslint-disable-next-line import/no-unused-modules
export const warningToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="warning" title={message} className="bg-white" />
  ));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const graphqlErrorToast = (error: any) => {
  const message = error?.response?.errors
    ?.map((e: { message?: string }) => e?.message)
    ?.join(", ");
  errorToast(message ?? error?.message ?? JSON.stringify(error));
};
