const nlToBr = (input: string) => input.replace(/\n/g, "<br/>");
const escapeHtml = (input: string) =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const formatFreeText = (input: string): string =>
  nlToBr(escapeHtml(input));
