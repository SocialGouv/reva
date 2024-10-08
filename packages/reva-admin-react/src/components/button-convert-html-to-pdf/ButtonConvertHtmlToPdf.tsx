import { Button } from "@codegouvfr/react-dsfr/Button";
// @ts-ignore
import html2pdf from "html2pdf.js";
export const ButtonConvertHtmlToPdf = ({
  label,
  elementId,
  filename,
}: {
  label: string;
  elementId: string;
  filename: string;
}) => {
  const handleConvertHtmlToPdf = () => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementsToHide = document.querySelectorAll(".hide-bg-for-pdf");
      elementsToHide.forEach((el) => {
        (el as HTMLElement).classList.add("bg-transparent");
      });

      const options = {
        margin: 0.8,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
      };
      html2pdf()
        .from(element)
        .set(options)
        .save()
        .then(() => {
          elementsToHide.forEach((el) => {
            (el as HTMLElement).classList.remove("hide-bg-for-pdf");
          });
        });
    }
  };

  return (
    <Button
      data-html2canvas-ignore="true"
      priority="secondary"
      size="small"
      onClick={handleConvertHtmlToPdf}
    >
      {label}
    </Button>
  );
};
