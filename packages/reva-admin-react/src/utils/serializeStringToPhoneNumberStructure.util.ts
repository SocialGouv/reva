export function serializeStringToPhoneNumberStructure(phoneNumber: string) {
  // Check if phoneNumber is a valid string
  if (typeof phoneNumber !== "string") {
    return "Invalid input";
  }

  // Remove non-numeric characters except the plus sign at the beginning
  phoneNumber = phoneNumber.replace(/(?!^\+)[^0-9]/g, "");

  // Reformat the phone number dynamically
  let formattedNumber = phoneNumber
    .replace(/(\+\d{2})(\d?)(\d{0,2})/g, "$1 $2 $3")
    .trim();
  formattedNumber = formattedNumber.replace(/(\d{2})(?=\d)/g, "$1 ");

  return formattedNumber.trim();
}
