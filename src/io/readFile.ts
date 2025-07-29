import { Entry } from "../entry/entry.ts";

export const loadKeysFromCsv = async (
  filePath: string = "keys.csv"
): Promise<Entry[]> => {
  try {
    const csvContent = await Deno.readTextFile(filePath);
    const lines = csvContent.trim().split("\n");

    const entries: Entry[] = lines.map((line, index) => {
      try {
        // Remove quotes from the XDR string
        const keyXdr = line.replace(/^"(.*)"$/, "$1").trim();
        return new Entry(keyXdr);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `Failed to create Entry for line ${index + 1}: ${errorMessage}`
        );
      }
    });

    console.log(`Loaded ${entries.length} entries from ${filePath}`);
    return entries;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load CSV file: ${errorMessage}`);
  }
};
