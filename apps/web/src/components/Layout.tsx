import {
  Activity,
  Blocks,
  BookOpenCheck,
  ClipboardCheck,
  CloudCog,
  FileQuestion,
  Gauge,
  Network
} from "lucide-react";
import type { ReactNode } from "react";

export type PageKey =
  | "overview"
  | "presales"
  | "onboarding"
  | "blueprints"
  | "policy"
  | "operations"
  | "support"
  | "architecture";

const navItems: Array<{ key: PageKey; label: string; icon: ReactNode }> = [
  { key: "overview", label: "Executive Overview", icon: <Gauge size={18} /> },
  { key: "presales", label: "Pre-Sales Assistant", icon: <FileQuestion size={18} /> },
  { key: "onboarding", label: "Onboarding Factory", icon: <ClipboardCheck size={18} /> },
  { key: "blueprints", label: "Deployment Blueprints", icon: <Blocks size={18} /> },
  { key: "policy", label: "Policy Operator", icon: <CloudCog size={18} /> },
  { key: "operations", label: "Environment Operations", icon: <Activity size={18} /> },
  { key: "support", label: "Support Runbooks", icon: <BookOpenCheck size={18} /> },
  { key: "architecture", label: "Architecture", icon: <Network size={18} /> }
];

export function Layout({
  activePage,
  setActivePage,
  children
}: {
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-200 px-6 py-6">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Customer Cloud</p>
          <h1 className="mt-2 text-xl font-bold leading-tight text-slate-950">Policy Operator PoC</h1>
        </div>
        <nav className="space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-semibold transition ${
                activePage === item.key
                  ? "bg-slate-950 text-white shadow-soft"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <select
          value={activePage}
          onChange={(event) => setActivePage(event.target.value as PageKey)}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
        >
          {navItems.map((item) => (
            <option value={item.key} key={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </header>
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
