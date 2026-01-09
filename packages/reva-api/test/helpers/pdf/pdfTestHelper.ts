import { PDFExtract } from "pdf.js-extract";

type ExtractedContentItem = {
  str?: string;
};

type ExtractedPage = {
  content?: ExtractedContentItem[];
};

type ExtractedPdf = {
  pages: ExtractedPage[];
};

export type SectionDefinition = {
  name: string;
  title: string;
};

export type StructuredSection = SectionDefinition & {
  lines: string[];
  startIndex: number;
};

const normalizeText = (value: string) =>
  value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");

const canonicalizeText = (value: string) =>
  normalizeText(value).replace(/BLOC-[A-Z0-9]+/g, "BLOC-CODE");

const getCanonicalLines = (value: string) =>
  canonicalizeText(value)
    .split("\n")
    .filter((line) => line.length > 0);

export const buildPdfTestHelper = async ({
  pdfBuffer,
  sectionDefinitions,
}: {
  pdfBuffer: Buffer;
  sectionDefinitions: readonly SectionDefinition[];
}) => {
  const pdfExtract = new PDFExtract();

  const extracted = await new Promise<ExtractedPdf>((resolve, reject) => {
    pdfExtract.extractBuffer(pdfBuffer, {}, (error, data) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(data as ExtractedPdf);
    });
  });

  const textContent = extracted.pages
    .flatMap((page) => (page.content ?? []).map((item) => item.str ?? ""))
    .join("\n");

  const canonicalPdfLines = canonicalizeText(textContent)
    .split("\n")
    .filter((line) => line.length > 0);

  const sectionStartIndices: number[] = [];
  let searchIndex = 0;

  sectionDefinitions.forEach(({ title }) => {
    let foundIndex = -1;

    for (
      let index = searchIndex;
      index < canonicalPdfLines.length;
      index += 1
    ) {
      if (canonicalPdfLines[index] === title) {
        foundIndex = index;
        break;
      }
    }

    if (foundIndex === -1) {
      throw new Error(
        `Titre de section "${title}" introuvable dans le PDF extrait.`,
      );
    }

    sectionStartIndices.push(foundIndex);
    searchIndex = foundIndex + 1;
  });

  const structuredSections: StructuredSection[] = sectionDefinitions.map(
    (definition, index) => {
      const startIndex = sectionStartIndices[index];
      const endIndex =
        index === sectionDefinitions.length - 1
          ? canonicalPdfLines.length
          : sectionStartIndices[index + 1];

      return {
        ...definition,
        startIndex,
        lines: canonicalPdfLines.slice(startIndex, endIndex),
      };
    },
  );

  const getSection = (sectionName: string) => {
    const section = structuredSections.find(({ name }) => name === sectionName);

    if (!section) {
      throw new Error(
        `Section "${sectionName}" introuvable dans la structure.`,
      );
    }

    return section;
  };

  const expectSectionText = (sectionName: string, expected: string) => {
    const section = getSection(sectionName);

    const actualLines = getCanonicalLines(section.lines.join("\n"));
    const expectedLines = getCanonicalLines(expected);

    if (actualLines.length === 0 || expectedLines.length === 0) {
      throw new Error(`La section "${sectionName}" ne contient aucune ligne.`);
    }

    const [actualTitle, ...actualBody] = actualLines;
    const [expectedTitle, ...expectedBody] = expectedLines;

    expect(actualTitle).toEqual(expectedTitle);
    expect({
      section: section.title,
      lines: [actualTitle, ...actualBody],
    }).toEqual({
      section: section.title,
      lines: [expectedTitle, ...expectedBody],
    });
  };

  return { expectSectionText, structuredSections };
};
