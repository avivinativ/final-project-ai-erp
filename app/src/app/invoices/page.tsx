import { listRecords } from "@/lib/airtable";
import Card from "@/components/Card";
import Table from "@/components/Table";
import InvoiceForm from "@/components/InvoiceForm";
import StatusBadge from "@/components/StatusBadge";
import { ExternalLinkIcon } from "@/components/icons";

function formatCurrency(value: number | undefined) {
  if (value === undefined) return "-";
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(value);
}

export default async function InvoicesPage() {
  const records = await listRecords("Invoices", { sortField: "Created", sortDirection: "desc" });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card title="חשבוניות" action={<span className="text-xs text-slate-400">{records.length} בסך הכל</span>}>
          <Table
            emptyLabel="אין עדיין חשבוניות"
            rows={records}
            columns={[
              { header: "מספר", cell: (r) => <span className="font-medium text-slate-900">{r.fields.InvoiceNumber ?? "-"}</span> },
              { header: "לקוח", cell: (r) => r.fields.CustomerId ?? "-" },
              { header: "סה״כ", cell: (r) => formatCurrency(r.fields.Total ?? r.fields.Amount) },
              { header: "סטטוס", cell: (r) => <StatusBadge status={r.fields.Status} /> },
              {
                header: "מסמך",
                cell: (r) =>
                  r.fields.PdfUrl ? (
                    <a
                      href={r.fields.PdfUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      פתיחה
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    "-"
                  ),
              },
            ]}
          />
        </Card>
      </div>
      <Card title="חשבונית חדשה">
        <InvoiceForm />
      </Card>
    </div>
  );
}
