export function formatStringToSocialSecurityNumberStructure(
  inputString: string,
) {
  if (typeof inputString !== "string") {
    return "Invalid input";
  }

  let result = "";
  let segmentLengths = [1, 2, 2, 2, 3, 3, 2];
  let currentIndex = 0;

  // Iterate over the segment lengths
  for (let length of segmentLengths) {
    // Get the next segment based on the segment length
    let segment = inputString.substring(currentIndex, currentIndex + length);

    // Append the segment to the result string
    result += segment;

    // Add a space if we are not at the end of the input string
    if (currentIndex + length < inputString.length) {
      result += " ";
    }

    // Move to the next segment
    currentIndex += length;
  }

  return result;
}
