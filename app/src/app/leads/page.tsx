import { listRecords } from "@/lib/airtable";
import Card from "@/components/Card";
import Table from "@/components/Table";
import LeadForm from "@/components/LeadForm";
import StatusBadge from "@/components/StatusBadge";

export default async function LeadsPage() {
  const records = await listRecords("Leads", { sortField: "Created", sortDirection: "desc" });

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card title="לידים" action={<span className="text-xs text-slate-400">{records.length} בסך הכל</span>}>
          <Table
            emptyLabel="אין עדיין לידים"
            rows={records}
            columns={[
              { header: "שם", cell: (r) => r.fields.Name ?? "-" },
              { header: "אימייל", cell: (r) => r.fields.Email ?? "-" },
              { header: "חברה", cell: (r) => r.fields.Company ?? "-" },
              { header: "סטטוס", cell: (r) => <StatusBadge status={r.fields.Status} /> },
            ]}
          />
        </Card>
      </div>
      <Card title="ליד חדש">
        <LeadForm />
      </Card>
    </div>
  );
}
