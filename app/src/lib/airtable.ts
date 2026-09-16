import "server-only";

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const PAT = process.env.AIRTABLE_PAT!;

const TABLE_IDS = {
  Invoices: "tbliF2WhmHvgKHlMg",
  Leads: "tbl5JEP9PGG8aYuHx",
  Products: "tblVjWivxnLAsVvEc",
  Tasks: "tblTDaEyaCVsg4Iul",
} as const;

export type TableName = keyof typeof TABLE_IDS;

export type InvoiceFields = {
  InvoiceNumber?: string;
  CustomerId?: string;
  Amount?: number;
  VatAmount?: number;
  Total?: number;
  Status?: string;
  PdfUrl?: string;
  Created?: string;
};

export type LeadFields = {
  Name?: string;
  Email?: string;
  Company?: string;
  Status?: string;
  Created?: string;
};

export type ProductFields = {
  Name?: string;
  Category?: string;
  Price?: number;
  Description?: string;
  InStock?: boolean;
};

export type TaskFields = {
  Title?: string;
  Status?: string;
};

export type AirtableRecord<F> = {
  id: string;
  createdTime: string;
  fields: F;
};

type FieldsFor<T extends TableName> = T extends "Invoices"
  ? InvoiceFields
  : T extends "Leads"
    ? LeadFields
    : T extends "Products"
      ? ProductFields
      : TaskFields;

export async function listRecords<T extends TableName>(
  table: T,
  options?: { sortField?: string; sortDirection?: "asc" | "desc"; maxRecords?: number },
): Promise<AirtableRecord<FieldsFor<T>>[]> {
  const params = new URLSearchParams();
  params.set("maxRecords", String(options?.maxRecords ?? 100));
  if (options?.sortField) {
    params.set("sort[0][field]", options.sortField);
    params.set("sort[0][direction]", options?.sortDirection ?? "desc");
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_IDS[table]}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${PAT}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Airtable ${table} fetch failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.records as AirtableRecord<FieldsFor<T>>[];
}
