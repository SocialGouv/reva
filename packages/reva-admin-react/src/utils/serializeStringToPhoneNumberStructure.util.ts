const phoneCodesThreeDigits = [
  "590",
  "596",
  "594",
  "262",
  "508",
  "681",
  "689",
  "687",
];

export function serializeStringToPhoneNumberStructure(phoneNumber: string) {
  if (typeof phoneNumber !== "string") {
    return "Invalid input";
  }

  // Remove spaces and non-digit characters from the phone number, except the leading +
  let formattedNumber = phoneNumber.replace(/(?!^\+)\s+|[^\d+]/g, "");

  // If the phone number starts with 00, replace it with +
  if (formattedNumber.startsWith("00")) {
    formattedNumber = "+" + formattedNumber.slice(2);
  }

  // Check if the phone number has a three-digit code in list of DOM TOM codes
  const isThreeDigitCode = phoneCodesThreeDigits.includes(
    formattedNumber.match(/^\+\d{3}/)?.[0]?.split("+")[1] ?? "",
  );

  // Slice the phone number to 10, 13 or 12 digits depending on the format
  if (!formattedNumber.startsWith("+")) {
    formattedNumber = formattedNumber.slice(0, 10);
  } else if (isThreeDigitCode) {
    formattedNumber = formattedNumber.slice(0, 13);
  } else {
    formattedNumber = formattedNumber.slice(0, 12);
  }

  // Format the phone number with spaces
  if (isThreeDigitCode) {
    formattedNumber = formattedNumber.replace(
      /(\+\d{3})(\d?)(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})/,
      "$1 $2 $3 $4 $5 $6",
    );
  } else {
    formattedNumber = formattedNumber
      .replace(/(\+\d{2})(\d?)(\d{0,2})/g, "$1 $2 $3")
      .replace(/(\d{2})(?=\d)/g, "$1 ");
  }

  return formattedNumber.trim();
}
