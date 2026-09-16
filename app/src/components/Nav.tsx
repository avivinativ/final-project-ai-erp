"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, ReceiptIcon, UsersIcon, CheckSquareIcon, PackageIcon, ChatIcon } from "@/components/icons";

const LINKS = [
  { href: "/", label: "דשבורד", icon: GridIcon },
  { href: "/invoices", label: "חשבוניות", icon: ReceiptIcon },
  { href: "/leads", label: "לידים", icon: UsersIcon },
  { href: "/tasks", label: "משימות", icon: CheckSquareIcon },
  { href: "/products", label: "מוצרים", icon: PackageIcon },
  { href: "/chat", label: "צ׳אט עם הסוכן", icon: ChatIcon },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-sm font-bold text-white shadow-sm shadow-indigo-600/30">
            AI
          </span>
          <span className="font-bold text-slate-900 hidden sm:inline">AI-ERP</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm overflow-x-auto">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
