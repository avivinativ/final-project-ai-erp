import { listRecords } from "@/lib/airtable";
import Card from "@/components/Card";
import Table from "@/components/Table";

function formatCurrency(value: number | undefined) {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(value);
}

export default async function ProductsPage() {
  const records = await listRecords("Products");

  return (
    <Card title="מוצרים" action={<span className="text-xs text-slate-400">{records.length} בסך הכל</span>}>
      <Table
        emptyLabel="אין עדיין מוצרים"
        rows={records}
        columns={[
          { header: "שם", cell: (r) => <span className="font-medium text-slate-900">{r.fields.Name ?? "-"}</span> },
          { header: "קטגוריה", cell: (r) => r.fields.Category ?? "-" },
          { header: "מחיר", cell: (r) => formatCurrency(r.fields.Price) },
          {
            header: "במלאי",
            cell: (r) => (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                  r.fields.InStock
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                    : "bg-rose-50 text-rose-700 ring-rose-600/20"
                }`}
              >
                {r.fields.InStock ? "כן" : "לא"}
              </span>
            ),
          },
        ]}
      />
    </Card>
  );
}
