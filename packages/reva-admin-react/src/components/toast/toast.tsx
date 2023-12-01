import Alert from "@codegouvfr/react-dsfr/Alert";
import toast from "react-hot-toast";

export const successToast = (message: string) =>
  toast.custom(() => (
    <Alert severity="success" title={message} className="bg-white" />
  ));
