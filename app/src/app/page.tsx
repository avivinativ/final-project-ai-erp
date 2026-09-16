import { listRecords } from "@/lib/airtable";
import StatCard from "@/components/StatCard";
import { TrendingUpIcon, ReceiptIcon, UsersIcon, CheckSquareIcon, PackageIcon } from "@/components/icons";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(value);
}

export default async function DashboardPage() {
  const [invoices, leads, tasks, products] = await Promise.all([
    listRecords("Invoices"),
    listRecords("Leads"),
    listRecords("Tasks"),
    listRecords("Products"),
  ]);

  const revenue = invoices.reduce((sum, r) => sum + (r.fields.Total ?? r.fields.Amount ?? 0), 0);
  const openTasks = tasks.filter((t) => t.fields.Status !== "Done").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">דשבורד ניהול</h1>
        <p className="mt-1 text-sm text-slate-500">תמונת מצב מהירה על המכירות, הלידים והמשימות</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="הכנסות (סה״כ)" value={formatCurrency(revenue)} icon={TrendingUpIcon} tone="emerald" />
        <StatCard label="חשבוניות" value={invoices.length} icon={ReceiptIcon} tone="indigo" />
        <StatCard label="לידים" value={leads.length} icon={UsersIcon} tone="sky" />
        <StatCard label="משימות פתוחות" value={openTasks} icon={CheckSquareIcon} tone="amber" />
        <StatCard label="מוצרים במאגר" value={products.length} icon={PackageIcon} tone="violet" />
      </div>
    </div>
  );
}
