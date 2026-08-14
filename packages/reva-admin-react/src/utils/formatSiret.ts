export const formatSiret = (value?: string | null) =>
  value ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4") : "";
