export function formatStringToPhoneNumberStructure(phoneNumber: string) {
  // Check if phoneNumber is a valid string
  if (typeof phoneNumber !== "string") {
    return "Invalid input";
  }

  let result = "";
  let currentIndex = 0;

  // Iterate over the phoneNumber string
  while (currentIndex < phoneNumber.length) {
    // Get the next two characters
    let segment = phoneNumber.substring(currentIndex, currentIndex + 2);

    // Append the segment to the result string
    result += segment;

    // Add a space if we are not at the end of the phoneNumber string
    if (currentIndex + 2 < phoneNumber.length) {
      result += " ";
    }

    // Move to the next segment
    currentIndex += 2;
  }

  return result;
}
