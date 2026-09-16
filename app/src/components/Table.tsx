import { PackageIcon } from "@/components/icons";

export type Column<Row> = {
  header: string;
  cell: (row: Row) => React.ReactNode;
};

export default function Table<Row extends { id: string }>({
  columns,
  rows,
  emptyLabel,
}: {
  columns: Column<Row>[];
  rows: Row[];
  emptyLabel: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-200 py-10 text-center">
        <PackageIcon className="h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm text-right border-separate border-spacing-0">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="sticky top-0 bg-slate-50 py-2.5 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500 first:rounded-s-lg last:rounded-e-lg"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className={`group ${i % 2 === 1 ? "bg-slate-50/60" : ""}`}>
              {columns.map((col) => (
                <td
                  key={col.header}
                  className="border-b border-slate-100 py-2.5 px-3 text-slate-700 transition-colors group-hover:bg-indigo-50/40"
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
