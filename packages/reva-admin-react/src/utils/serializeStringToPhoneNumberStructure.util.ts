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
  const phoneNumberWithoutSpaces = phoneNumber.replace(/\s/g, "");

  if (phoneNumber.startsWith("00")) {
    phoneNumber = "+" + phoneNumber.slice(2);
  }

  phoneNumber = phoneNumber.replace(/(?!^\+)[^0-9]/g, "");

  const isThreeDigitCode = phoneCodesThreeDigits.includes(
    phoneNumberWithoutSpaces.match(/^\+\d{3}/)?.[0]?.split("+")[1] ?? "",
  );

  let formattedNumber = phoneNumber;
  if (isThreeDigitCode) {
    formattedNumber = phoneNumber.replace(
      /(\+\d{3})(\d?)(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})/,
      "$1 $2 $3 $4 $5 $6",
    );
  } else {
    formattedNumber = phoneNumber
      .replace(/(\+\d{2})(\d?)(\d{0,2})/g, "$1 $2 $3")
      .replace(/(\d{2})(?=\d)/g, "$1 ");
  }

  return formattedNumber.trim();
}
