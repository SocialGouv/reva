export function deserializeStringToPhoneNumberStructure(phoneNumber: string) {
  return phoneNumber.replace(/(?!^\+)[^0-9]/g, "");
}
