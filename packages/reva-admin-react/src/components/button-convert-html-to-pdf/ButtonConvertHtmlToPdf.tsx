import { Button } from "@codegouvfr/react-dsfr/Button";
// @ts-ignore
import html2pdf from "html2pdf.js";
import { useState } from "react";
export const ButtonConvertHtmlToPdf = ({
  label,
  elementId,
  filename,
}: {
  label: string;
  elementId: string;
  filename: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const handleConvertHtmlToPdf = () => {
    setIsLoading(true);
    const element = document.getElementById(elementId);
    if (element) {
      const elementsToHide = document.querySelectorAll(".hide-bg-for-pdf");
      elementsToHide.forEach((el) => {
        (el as HTMLElement).classList.add("bg-transparent");
      });

      const options = {
        margin: [0.3, 0.5, 0.2, 0.5],
        filename,
        image: { type: "jpeg", quality: 0.8 },
        pagebreak: {
          mode: "avoid-all",
        },
        html2canvas: {
          scale: 3,
          logging: false,
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
          compress: true,
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
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <Button
      data-html2canvas-ignore="true"
      priority="secondary"
      size="small"
      onClick={handleConvertHtmlToPdf}
      disabled={isLoading}
    >
      {label}
    </Button>
  );
};
