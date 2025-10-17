export type ContractDataResponse = {
  _links: {
    self: {
      href: string;
    };
    prev: {
      href: string;
    };
    next: {
      href: string;
    };
  };
  _embedded: {
    records: Array<ContractDataRecord>;
  };
};
export type ContractDataRecord = {
  durability: "temporary" | "persistent" | "instance";
  key: string;
  ttl: number;
  updated: number;
  value: string;
  paging_token: string;
  expired: boolean;
};

export type FetchEntriesOptions = {
  limit?: number; // limit per request
  maxRecords?: number; // maximum records to fetch
  delayMs?: number; // delay between requests in milliseconds (default: 1000ms)
  durability?: "temporary" | "persistent" | "instance"; // filter by durability type
};
