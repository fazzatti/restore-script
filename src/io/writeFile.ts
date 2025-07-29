import { Entry } from "../entry/entry.ts";

export const writeEntriesToCsv = async (
  entries: Entry[],
  filePath: string = "output.csv"
): Promise<void> => {
  try {
    // Create CSV header
    const csvHeader = "key_xdr,status\n";

    // Create CSV rows
    const csvRows = entries
      .map((entry) => {
        const keyXdr = entry.getKey().toXDR("base64");
        const status = entry.getStatus();

        // Wrap XDR in quotes to handle any special characters
        return `"${keyXdr}",${status}`;
      })
      .join("\n");

    // Combine header and rows
    const csvContent = csvHeader + csvRows;

    // Write to file
    await Deno.writeTextFile(filePath, csvContent);

    console.log(`Wrote ${entries.length} entries to ${filePath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to write CSV file: ${errorMessage}`);
  }
};

export const writeEntriesWithStatusesToCsv = async (
  entries: Entry[],
  filePath: string = "entries_status.csv"
): Promise<void> => {
  try {
    console.log(`Updating status for ${entries.length} entries...`);

    // Update status for all entries
    for (let i = 0; i < entries.length; i++) {
      try {
        await entries[i].updateStatus();
        console.log(`Updated entry ${i + 1}/${entries.length}`);
      } catch (error) {
        console.warn(`Failed to update status for entry ${i + 1}: ${error}`);
      }
    }

    // Write to CSV
    await writeEntriesToCsv(entries, filePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to write entries with statuses: ${errorMessage}`);
  }
};
