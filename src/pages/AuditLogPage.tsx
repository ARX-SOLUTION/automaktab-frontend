import { useState } from "react";
import { format } from "date-fns";
import { useAuditLogs } from "@/services/auditService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, CalendarIcon, X, ShieldCheck, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const formatDate = (d: string) => {
  try {
    if (!d) return "—";
    return format(new Date(d), "dd.MM.yyyy HH:mm");
  } catch {
    return d;
  }
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Yaratildi",
  UPDATE: "Yangilandi",
  DELETE: "O'chirildi",
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: "text-success",
  UPDATE: "text-primary",
  DELETE: "text-destructive",
};

const ENTITY_LABELS: Record<string, string> = {
  student: "Talaba",
  payment: "To'lov",
  user: "Foydalanuvchi",
  branch: "Filial",
  group: "Guruh",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Egasi",
  manager: "Menejer",
  operator: "Operator",
  teacher: "O'qituvchi",
};

const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const weekAgo = () => { const d = today(); d.setDate(d.getDate()-6); return d; };
const monthStart = () => { const d = today(); d.setDate(1); return d; };
const lastMonthStart = () => { const d = today(); d.setMonth(d.getMonth()-1,1); return d; };
const lastMonthEnd = () => { const d = today(); d.setDate(0); return d; };

const AuditLogPage = () => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  // Sort state
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const { data, isLoading } = useAuditLogs({
    entity: entityFilter !== "all" ? entityFilter : undefined,
    action: actionFilter !== "all" ? actionFilter : undefined,
    startDate: dateFrom,
    endDate: dateTo,
    page,
    limit: LIMIT,
  });

  const logs = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Client-side search filter + sort
  const filtered = logs.filter((l) => {
    const name = l.user?.name?.toLowerCase() || "";
    return !search || name.includes(search.toLowerCase());
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: unknown, vb: unknown;
    if (sortField === "userName") { va = a.user?.name || ""; vb = b.user?.name || ""; }
    else if (sortField === "createdAt") { va = a.createdAt; vb = b.createdAt; }
    else { va = (a as Record<string,unknown>)[sortField]; vb = (b as Record<string,unknown>)[sortField]; }
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === "asc" ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
  });

  const hasAnyFilter = !!dateFrom || !!dateTo || entityFilter !== "all" || actionFilter !== "all" || !!search;

  const setPreset = (preset: "today"|"week"|"month"|"lastMonth"|"all") => {
    const now = new Date(); now.setHours(23,59,59,999);
    switch(preset) {
      case "today": setDateFrom(today()); setDateTo(now); break;
      case "week": setDateFrom(weekAgo()); setDateTo(now); break;
      case "month": setDateFrom(monthStart()); setDateTo(now); break;
      case "lastMonth": setDateFrom(lastMonthStart()); setDateTo(lastMonthEnd()); break;
      case "all": setDateFrom(undefined); setDateTo(undefined); break;
    }
    setPage(1);
  };

  const clearAll = () => {
    setDateFrom(undefined); setDateTo(undefined);
    setEntityFilter("all"); setActionFilter("all");
    setSearch(""); setPage(1);
  };

  const SortTh = ({ field, label, align = "left" }: { field: string; label: string; align?: string }) => (
    <th className={`px-4 py-3 text-${align} font-medium text-muted-foreground`}>
      <button onClick={() => toggleSort(field)} className="flex items-center gap-1 hover:text-foreground transition-colors">
        {label}
        {sortField === field ? (
          sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
        ) : <ChevronsUpDown className="h-3 w-3 text-muted-foreground/50" />}
      </button>
    </th>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6" /> Audit log
        </h1>
        <p className="text-sm text-muted-foreground">
          Tizimda amalga oshirilgan barcha o'zgarishlar
        </p>
      </div>

      {/* Filters */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filterlash</h2>
          {hasAnyFilter && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 gap-1 text-xs">
              <X className="h-3 w-3" /> Hammasini tozalash
            </Button>
          )}
        </div>

        {/* Date presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          {(["today","week","month","lastMonth","all"] as const).map((p) => (
            <Button key={p} variant="outline" size="sm" onClick={() => setPreset(p)}>
              {p === "today" ? "Bugun" : p === "week" ? "So'nggi 7 kun" : p === "month" ? "Bu oy" : p === "lastMonth" ? "O'tgan oy" : "Barcha vaqt"}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha obyekt</SelectItem>
              <SelectItem value="student">Talaba</SelectItem>
              <SelectItem value="payment">To'lov</SelectItem>
              <SelectItem value="user">Foydalanuvchi</SelectItem>
              <SelectItem value="branch">Filial</SelectItem>
              <SelectItem value="group">Guruh</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1); }}>
            <SelectTrigger className="w-44 bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Barcha amal</SelectItem>
              <SelectItem value="CREATE">Yaratildi</SelectItem>
              <SelectItem value="UPDATE">Yangilandi</SelectItem>
              <SelectItem value="DELETE">O'chirildi</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("min-w-[200px] justify-start text-left font-normal bg-secondary border-border", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {!dateFrom ? "Sana tanlang" : dateTo && dateTo.getTime() !== dateFrom.getTime()
                  ? `${format(dateFrom,"dd.MM.yyyy")} → ${format(dateTo,"dd.MM.yyyy")}`
                  : format(dateFrom,"dd.MM.yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={{ from: dateFrom, to: dateTo }}
                onSelect={(range) => { if (!range) { setDateFrom(undefined); setDateTo(undefined); } else { setDateFrom(range.from); setDateTo(range.to ?? range.from); } setPage(1); }}
                numberOfMonths={2} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>

          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Foydalanuvchi ismi bo'yicha..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 bg-secondary border-border" />
          </div>
        </div>
      </section>

      {/* Table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">O'zgarishlar ro'yxati</h2>
          <span className="text-xs text-muted-foreground">{total} ta yozuv</span>
        </div>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">#</th>
                  <SortTh field="userName" label="Foydalanuvchi" />
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
                  <SortTh field="action" label="Amal" />
                  <SortTh field="entity" label="Obyekt" />
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tafsilot</th>
                  <SortTh field="createdAt" label="Vaqt" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td colSpan={7} className="p-4"><Skeleton className="h-5" /></td>
                    </tr>
                  ))
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">Yozuvlar topilmadi</td>
                  </tr>
                ) : (
                  sorted.map((log, idx) => (
                    <tr key={log.id} className="table-row-striped border-b border-border/50">
                      <td className="px-4 py-3 text-center text-muted-foreground">{(page - 1) * LIMIT + idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{log.user?.name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{ROLE_LABELS[log.user?.role || ""] || log.user?.role || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("font-medium text-xs", ACTION_COLORS[log.action])}>{ACTION_LABELS[log.action] || log.action}</span>
                      </td>
                      <td className="px-4 py-3 text-xs">{ENTITY_LABELS[log.entity] || log.entity}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-[240px] truncate">
                        {log.changes ? JSON.stringify(log.changes) : log.entityId}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Oldingi</Button>
            <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Keyingi</Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AuditLogPage;
