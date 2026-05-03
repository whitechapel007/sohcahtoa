"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  Inbox,
} from "lucide-react";
import type {
  Transaction,
  PaginatedTransactions,
  SortField,
  SortOrder,
  UserRole,
} from "@/types";
import { apiFetchJSON, ApiClientError } from "@/lib/api-client";
import RealtimeStream from "./RealtimeStream";
import TransactionDetailPanel from "./TransactionDetailPanel";

interface Props {
  initialData: PaginatedTransactions;
  userRole: UserRole;
}

const STATUS_OPTIONS = [
  "all",
  "pending",
  "completed",
  "flagged",
  "failed",
] as const;

const STATUS_LABEL: Record<string, string> = {
  all: "All statuses",
  pending: "Pending",
  completed: "Completed",
  flagged: "Flagged",
  failed: "Failed",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-positive-bg text-positive",
  flagged: "bg-negative-bg text-negative",
  failed: "bg-neutral-100 text-neutral-500",
};

function fmtAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount >= 0 ? "+" : "-"}$${abs}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TransactionsTable({ initialData, userRole }: Props) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortField>("date");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const fetchData = useCallback(
    (params: {
      search: string;
      status: string;
      dateFrom: string;
      dateTo: string;
      sort: SortField;
      order: SortOrder;
      page: number;
    }) => {
      const sp = new URLSearchParams();
      if (params.search) sp.set("search", params.search);
      if (params.status && params.status !== "all")
        sp.set("status", params.status);
      if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
      if (params.dateTo) sp.set("dateTo", params.dateTo);
      sp.set("sort", params.sort);
      sp.set("order", params.order);
      sp.set("page", String(params.page));

      startTransition(async () => {
        try {
          const result = await apiFetchJSON<PaginatedTransactions>(
            `/api/dashboard/transactions?${sp.toString()}`,
          );
          setData(result);
          setFetchError(null);
        } catch (err) {
          setFetchError(
            err instanceof ApiClientError
              ? err.message
              : "Failed to load transactions.",
          );
        }
      });
    },
    [],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchData({
      search: appliedSearch,
      status: statusFilter,
      dateFrom,
      dateTo,
      sort,
      order,
      page,
    });
    // appliedSearch intentionally omitted: search changes go through the debounce
    // handler which updates appliedSearch and page together in one shot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearch, statusFilter, dateFrom, dateTo, sort, order, page]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setAppliedSearch(value);
      setPage(1);
    }, 350);
  }

  function toggleSort(field: SortField) {
    if (sort === field) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSort(field);
      setOrder("desc");
    }
    setPage(1);
  }

  function handleNewTransaction(tx: Transaction) {
    if (
      page !== 1 ||
      statusFilter !== "all" ||
      appliedSearch ||
      dateFrom ||
      dateTo ||
      sort !== "date" ||
      order !== "desc"
    )
      return;

    setData((prev) => {
      if (prev.data.some((t) => t.id === tx.id)) return prev; // deduplicate
      return {
        ...prev,
        data: [tx, ...prev.data].slice(0, prev.limit),
        total: prev.total + 1,
      };
    });
  }

  function handleTransactionUpdated(tx: Transaction) {
    setData((prev) => ({
      ...prev,
      data: prev.data.map((t) => (t.id === tx.id ? tx : t)),
    }));
    setSelectedTx(tx);
  }

  function clearFilters() {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    setSearch("");
    setAppliedSearch("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  const hasActiveFilters = !!(
    appliedSearch ||
    statusFilter !== "all" ||
    dateFrom ||
    dateTo
  );

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">Transactions</h1>
      <p className="text-sm text-neutral-500 mb-5">
        All your FX and payment activity in one place.
      </p>

      <div className="bg-panel rounded-2xl p-4 mb-4 space-y-3 shadow-sm">
        <div className="flex gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by description, sender, recipient…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder:text-neutral-400"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white text-neutral-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="flex gap-3 flex-wrap items-center">
          <label className="text-xs text-neutral-500 shrink-0">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          <label className="text-xs text-neutral-500 shrink-0">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-orange hover:underline transition-opacity"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="bg-panel rounded-2xl overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          <span>Description</span>
          <SortButton
            field="amount"
            current={sort}
            order={order}
            onToggle={toggleSort}
          >
            Amount
          </SortButton>
          <SortButton
            field="status"
            current={sort}
            order={order}
            onToggle={toggleSort}
          >
            Status
          </SortButton>
          <SortButton
            field="date"
            current={sort}
            order={order}
            onToggle={toggleSort}
          >
            Date
          </SortButton>
          <span>Category</span>
        </div>

        {/* Loading */}
        {isPending && (
          <div className="flex items-center justify-center py-10 gap-2 text-neutral-400">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {/* Error */}
        {!isPending && fetchError && (
          <div className="flex items-center justify-center py-10 gap-2 text-negative">
            <AlertCircle size={18} />
            <span className="text-sm">{fetchError}</span>
          </div>
        )}

        {/* Empty */}
        {!isPending && !fetchError && data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-14 text-neutral-400">
            <Inbox size={32} className="mb-3 opacity-60" />
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs mt-1">Try adjusting your filters</p>
          </div>
        )}

        {/* Rows */}
        {!isPending &&
          !fetchError &&
          data.data.map((tx) => (
            <button
              key={tx.id}
              onClick={() =>
                setSelectedTx(selectedTx?.id === tx.id ? null : tx)
              }
              className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3.5 border-b border-neutral-50 text-left hover:bg-neutral-50 transition-colors ${
                selectedTx?.id === tx.id ? "bg-brand-orange-light" : ""
              }`}
            >
              <span className="text-sm font-medium text-neutral-800 truncate">
                {tx.description}
              </span>
              <span
                className={`text-sm font-semibold ${
                  tx.amount >= 0 ? "text-positive" : "text-neutral-800"
                }`}
              >
                {fmtAmount(tx.amount)}
              </span>
              <span
                className={`inline-flex items-center self-center px-2 py-0.5 rounded-full text-xs font-medium w-fit capitalize ${
                  STATUS_STYLES[tx.status] ?? STATUS_STYLES.failed
                }`}
              >
                {tx.status}
              </span>
              <span className="text-sm text-neutral-500">
                {fmtDate(tx.date)}
              </span>
              <span className="text-sm text-neutral-500">{tx.category}</span>
            </button>
          ))}

        {/* Pagination */}
        {!isPending && !fetchError && data.total > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100">
            <span className="text-xs text-neutral-500">
              Showing {(data.page - 1) * data.limit + 1}–
              {Math.min(data.page * data.limit, data.total)} of {data.total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-neutral-600 px-2 tabular-nums">
                {data.page} / {data.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={data.page >= data.pages}
                className="p-1.5 rounded-lg hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTx && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/5"
            onClick={() => setSelectedTx(null)}
          />
          <div className="fixed inset-y-0 right-0 z-40 w-[420px] bg-panel shadow-2xl border-l border-neutral-200 flex flex-col">
            <TransactionDetailPanel
              transaction={selectedTx}
              userRole={userRole}
              onClose={() => setSelectedTx(null)}
              onTransactionUpdated={handleTransactionUpdated}
            />
          </div>
        </>
      )}

      <RealtimeStream onNewTransaction={handleNewTransaction} />
    </div>
  );
}

// ── Sort column header button ──────────────────────────────────────────────────

interface SortButtonProps {
  field: SortField;
  current: SortField;
  order: SortOrder;
  onToggle: (field: SortField) => void;
  children: React.ReactNode;
}

function SortButton({
  field,
  current,
  order,
  onToggle,
  children,
}: SortButtonProps) {
  const isActive = current === field;
  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-0.5 hover:text-neutral-800 transition-colors ${
        isActive ? "text-neutral-800" : ""
      }`}
    >
      {children}
      {isActive ? (
        order === "asc" ? (
          <ChevronUp size={12} />
        ) : (
          <ChevronDown size={12} />
        )
      ) : (
        <ChevronDown size={12} className="opacity-30" />
      )}
    </button>
  );
}
