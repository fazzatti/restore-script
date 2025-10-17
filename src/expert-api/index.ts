import {
  ContractDataResponse,
  ContractDataRecord,
  FetchEntriesOptions,
} from "./types.ts";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchEntries = async (
  contractId: string,
  options: FetchEntriesOptions = {}
): Promise<ContractDataRecord[]> => {
  const { limit = 100, maxRecords, delayMs = 1000, durability } = options;

  console.log(`Fetching entries for contractId: ${contractId}`);
  if (maxRecords) {
    console.log(`Max records limit: ${maxRecords}`);
  } else {
    console.log(`Fetching all available records`);
  }
  if (durability) {
    console.log(`Filtering by durability: ${durability}`);
  }

  const allRecords: ContractDataRecord[] = [];
  let cursor: string | undefined;
  let hasMore = true;
  let pageCount = 0;

  while (hasMore) {
    const url = new URL(
      `https://api.stellar.expert/explorer/public/contract-data/${contractId}`
    );
    url.searchParams.set("order", "desc");
    url.searchParams.set("limit", limit.toString());

    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

    if (durability) {
      url.searchParams.set("durability", durability);
    }

    console.log(`Fetching page with cursor: ${cursor || "initial"}`);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Failed to fetch entries: ${response.statusText}`);
    }

    const data: ContractDataResponse = await response.json();

    // Stop if no records returned
    if (data._embedded.records.length === 0) {
      console.log(`No more records found. Stopping.`);
      hasMore = false;
      break;
    }

    allRecords.push(...data._embedded.records);

    console.log(
      `Fetched ${data._embedded.records.length} records. Total: ${allRecords.length}`
    );

    // Check if we've reached the max records limit
    if (maxRecords && allRecords.length >= maxRecords) {
      console.log(`Reached max records limit: ${maxRecords}`);
      hasMore = false;
      // Trim to exact maxRecords if we went over
      return allRecords.slice(0, maxRecords);
    }

    // Check if there's a next page
    if (data._links.next) {
      // Extract cursor from next URL
      const nextUrl = new URL(data._links.next.href, url.origin);
      cursor = nextUrl.searchParams.get("cursor") || undefined;

      // Add delay before next request (not on the last page)
      pageCount++;
      console.log(`Waiting ${delayMs}ms before next request...`);
      await sleep(delayMs);
    } else {
      hasMore = false;
    }
  }

  console.log(`Completed fetching. Total records: ${allRecords.length}`);
  return allRecords;
};
