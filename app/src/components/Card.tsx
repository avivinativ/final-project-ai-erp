export default function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
