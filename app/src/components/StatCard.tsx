import type { IconProps } from "@/components/icons";

const TONES = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
} as const;

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "indigo",
}: {
  label: string;
  value: string | number;
  icon?: (props: IconProps) => React.ReactElement;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${TONES[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}
