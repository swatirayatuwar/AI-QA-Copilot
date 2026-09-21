import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  Bug,
  CheckSquare2,
  ChevronDown,
  CircleHelp,
  FileText,
  FolderKanban,
  Gauge,
  GitBranch,
  LayoutDashboard,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Settings,
  ShieldCheck,
  Sparkles,
  TestTube2,
  X,
} from "lucide-react";

const navSections = [
  { label: "Control room", items: [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/requirements", label: "Requirements", icon: FileText },
    { href: "/test-design", label: "Test design", icon: Boxes },
    { href: "/test-cases", label: "Test cases", icon: CheckSquare2 },
    { href: "/defects", label: "Defects", icon: Bug },
  ]},
  { label: "Intelligence", items: [
    { href: "/coverage", label: "Coverage", icon: Network },
    { href: "/reports", label: "Reports", icon: BarChart3 },
    { href: "/ai-copilot", label: "AI Copilot", icon: Bot },
  ]},
  { label: "Workspace", items: [
    { href: "/projects", label: "Projects", icon: FolderKanban },
    { href: "/integrations", label: "Integrations", icon: Plug },
    { href: "/activity", label: "Activity log", icon: Activity },
    { href: "/settings", label: "Settings", icon: Settings },
  ]},
];

export function QAShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:translate-x-0 ${collapsed ? "md:w-[76px]" : ""} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[72px] items-center justify-between border-b border-sidebar-border px-5">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_0_5px_hsl(var(--sidebar-primary)/.12)]"><ShieldCheck size={19} strokeWidth={2.5}/></span>
            {!collapsed && <span className="font-display text-[18px] font-semibold tracking-[-.03em] text-white">QA / copilot</span>}
          </Link>
          <button className="hidden rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent md:block" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" data-testid="button-toggle-sidebar">{collapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}</button>
          <button className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent md:hidden" onClick={closeMobile} aria-label="Close navigation" data-testid="button-close-navigation"><X size={18}/></button>
        </div>
        <div className="border-b border-sidebar-border px-4 py-4">
          <button className={`flex w-full items-center gap-3 rounded-lg bg-sidebar-accent/70 p-2.5 text-left hover:bg-sidebar-accent ${collapsed ? "justify-center" : ""}`} data-testid="button-project-switcher">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#d9e2ff] text-[11px] font-bold text-[#25376b]">SH</span>
            {!collapsed && <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold text-white">Smart Home IoT</span><span className="block truncate text-[10px] text-sidebar-foreground/70">SHP · active workspace</span></span>}
            {!collapsed && <ChevronDown size={14} className="text-sidebar-foreground/60"/>}
          </button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {navSections.map((section) => <div key={section.label}>
            {!collapsed && <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/45">{section.label}</p>}
            <div className="space-y-1">{section.items.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
              return <Link key={item.href} href={item.href} onClick={closeMobile} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-medium ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white"} ${collapsed ? "justify-center" : ""}`} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(" ","-")}`}>
                <Icon size={17} strokeWidth={active ? 2.4 : 1.8}/>{!collapsed && <span>{item.label}</span>}{!collapsed && item.label === "AI Copilot" && <span className="ml-auto rounded-full bg-sidebar-primary/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-sidebar-primary">demo</span>}
              </Link>;
            })}</div>
          </div>)}
        </nav>
        <div className={`border-t border-sidebar-border p-4 ${collapsed ? "px-3" : ""}`}>
          {!collapsed && <div className="mb-3 flex items-center gap-2 px-1 text-[10px] text-sidebar-foreground/60"><span className="h-1.5 w-1.5 rounded-full bg-[#5bd6b0]"/><span>Workspace healthy</span><span className="ml-auto font-mono-ui">v0.1</span></div>}
          <Link href="/settings" className={`flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent ${collapsed ? "justify-center" : ""}`} data-testid="link-profile">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e7cb75] text-[11px] font-bold text-[#453b20]">AR</span>
            {!collapsed && <span className="min-w-0"><span className="block text-[12px] font-semibold text-white">Alex Rivera</span><span className="block text-[10px] text-sidebar-foreground/60">QA lead</span></span>}
          </Link>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-[#13182b]/45 md:hidden" onClick={closeMobile} aria-label="Close menu overlay" data-testid="button-menu-overlay"/>}
      <div className={`min-h-[100dvh] transition-[padding] duration-200 ${collapsed ? "md:pl-[76px]" : "md:pl-[258px]"}`}>
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md md:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-border p-2 hover:bg-muted md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={18}/></button>
            <div className="hidden items-center gap-2 text-[11px] text-muted-foreground sm:flex"><span className="font-mono-ui text-[10px]">SHP</span><span>/</span><span className="text-foreground">{navSections.flatMap(s => s.items).find(i => i.href === location || (i.href !== "/" && location.startsWith(i.href)))?.label ?? "Overview"}</span></div>
            <div className="flex items-center gap-2 sm:hidden"><Gauge size={16} className="text-primary"/><span className="font-display text-[16px] font-semibold">QA / copilot</span></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-[#b7d9cf] bg-[#eef9f5] px-2.5 py-1.5 text-[10px] font-semibold text-[#287763] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#3aae91]"/>Demo workspace</span>
            <Link href="/ai-copilot" className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[11px] font-semibold hover:border-primary/50 hover:bg-muted" data-testid="link-header-copilot"><Sparkles size={14} className="text-[#bd9216]"/> Ask Copilot</Link>
            <button className="grid h-8 w-8 place-items-center rounded-full bg-[#e7cb75] text-[10px] font-bold text-[#453b20]" aria-label="Account menu" data-testid="button-account-menu">AR</button>
          </div>
        </header>
        <main className="page-grid min-h-[calc(100dvh-72px)]">{children}</main>
      </div>
    </div>
  );
}