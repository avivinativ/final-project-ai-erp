import { listRecords } from "@/lib/airtable";
import Card from "@/components/Card";
import Table from "@/components/Table";
import TaskForm from "@/components/TaskForm";
import StatusBadge from "@/components/StatusBadge";

export default async function TasksPage() {
  const records = await listRecords("Tasks");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Card title="משימות" action={<span className="text-xs text-slate-400">{records.length} בסך הכל</span>}>
          <Table
            emptyLabel="אין עדיין משימות"
            rows={records}
            columns={[
              { header: "כותרת", cell: (r) => r.fields.Title ?? "-" },
              { header: "סטטוס", cell: (r) => <StatusBadge status={r.fields.Status} /> },
            ]}
          />
        </Card>
      </div>
      <Card title="משימה חדשה">
        <TaskForm />
      </Card>
    </div>
  );
}
