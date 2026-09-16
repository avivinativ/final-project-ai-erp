const TONES = {
  slate: "bg-slate-100 text-slate-600 ring-slate-500/10",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rose: "bg-rose-50 text-rose-700 ring-rose-600/20",
  sky: "bg-sky-50 text-sky-700 ring-sky-600/20",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/20",
} as const;

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  New: "sky",
  Duplicate: "slate",
  Interested: "emerald",
  "Not Interested": "rose",
  Question: "amber",
  "Needs Review": "amber",
  Contacted: "violet",
  Done: "emerald",
  Open: "sky",
  ValidatedQueued: "violet",
  Invoiced: "emerald",
  Draft: "slate",
};

export default function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">-</span>;
  const tone = TONES[STATUS_TONE[status] ?? "slate"];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${tone}`}
    >
      {status}
    </span>
  );
}
