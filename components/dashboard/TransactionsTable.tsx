"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
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

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

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
  const requestIdRef = useRef(0);
  const lastUpdatedRef = useRef<string | null>(null);

  // ── Cleanup debounce ────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, []);

  // ── Fetch logic (race-safe) ─────────────────────────────────────────────────

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
      if (params.status !== "all") sp.set("status", params.status);
      if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
      if (params.dateTo) sp.set("dateTo", params.dateTo);

      sp.set("sort", params.sort);
      sp.set("order", params.order);
      sp.set("page", String(params.page));

      startTransition(async () => {
        const requestId = ++requestIdRef.current;

        try {
          const result = await apiFetchJSON<PaginatedTransactions>(
            `/api/dashboard/transactions?${sp.toString()}`,
          );

          if (requestId === requestIdRef.current) {
            setData(result);
            setFetchError(null);
          }
        } catch (err) {
          if (requestId === requestIdRef.current) {
            setFetchError(
              err instanceof ApiClientError
                ? err.message
                : "Failed to load transactions.",
            );
          }
        }
      });
    },
    [],
  );

  // ── Trigger fetch ──────────────────────────────────────────────────────────

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
  }, [
    appliedSearch,
    statusFilter,
    dateFrom,
    dateTo,
    sort,
    order,
    page,
    fetchData,
  ]);

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  function matchesFilters(tx: Transaction) {
    if (statusFilter !== "all" && tx.status !== statusFilter) return false;
    if (
      appliedSearch &&
      !tx.description.toLowerCase().includes(appliedSearch.toLowerCase())
    )
      return false;
    if (dateFrom && new Date(tx.date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(tx.date) > new Date(dateTo)) return false;
    return true;
  }

  function handleSSETransaction(tx: Transaction) {
    // Skip self-originated updates (panel action already applied this change)
    if (tx.id === lastUpdatedRef.current) {
      lastUpdatedRef.current = null;
      return;
    }

    setData((prev) => {
      const exists = prev.data.some((t) => t.id === tx.id);

      if (exists) {
        return {
          ...prev,
          data: prev.data.map((t) => (t.id === tx.id ? tx : t)),
        };
      }

      if (!matchesFilters(tx)) return prev;

      return {
        ...prev,
        data: [tx, ...prev.data].slice(0, prev.limit),
        total: prev.total + 1,
      };
    });
  }

  function handleTransactionUpdated(tx: Transaction) {
    lastUpdatedRef.current = tx.id;
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

  const hasActiveFilters =
    appliedSearch || statusFilter !== "all" || dateFrom || dateTo;

  // ───────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-neutral-900 mb-1">Transactions</h1>
      <p className="text-sm text-neutral-500 mb-6">
        All your FX and payment activity in one place.
      </p>

      {/* Filters */}
      <div className="bg-panel rounded-2xl p-5 shadow-sm border border-neutral-100 space-y-4 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-neutral-200 rounded-lg"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg"
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-brand-orange hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-panel grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-3 text-xs font-semibold text-neutral-500">
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

        {/* Loading Skeleton */}
        {isPending && (
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-4 animate-pulse"
              >
                <div className="h-3 bg-neutral-200 rounded w-2/3" />
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
                <div className="h-3 bg-neutral-200 rounded w-1/3" />
                <div className="h-3 bg-neutral-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isPending && fetchError && (
          <div className="py-10 flex justify-center text-negative">
            <AlertCircle size={18} />
            <span className="ml-2 text-sm">{fetchError}</span>
          </div>
        )}

        {/* Empty */}
        {!isPending && !fetchError && data.data.length === 0 && (
          <div className="py-14 flex flex-col items-center text-neutral-400">
            <Inbox size={30} className="mb-2" />
            <p>No transactions found</p>
          </div>
        )}

        {/* Rows */}
        {!isPending &&
          !fetchError &&
          data.data.map((tx) => (
            <div
              key={tx.id}
              onClick={() =>
                setSelectedTx(selectedTx?.id === tx.id ? null : tx)
              }
              className="group cursor-pointer grid grid-cols-[2fr_1fr_1fr_1fr_1fr] px-6 py-4  hover:bg-neutral-50"
            >
              <span className="text-sm font-medium truncate group-hover:underline">
                {tx.description}
              </span>

              <span
                className={`text-sm font-semibold ${tx.amount >= 0 ? "text-positive" : ""}`}
              >
                {fmtAmount(tx.amount)}
              </span>

              <span
                className={`px-2 py-0.5 text-xs rounded-full w-fit ${STATUS_STYLES[tx.status]}`}
              >
                {tx.status}
              </span>

              <span className="text-sm text-neutral-500">
                {fmtDate(tx.date)}
              </span>

              <span className="text-sm text-neutral-500">{tx.category}</span>
            </div>
          ))}

        {/* Pagination */}
        {!isPending && !fetchError && data.total > 0 && (
          <div className="flex justify-between px-6 py-3  text-xs text-neutral-500">
            <span>
              {(data.page - 1) * data.limit + 1}–
              {Math.min(data.page * data.limit, data.total)} of {data.total}
            </span>

            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.page <= 1}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-2">
                {data.page} / {data.pages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={data.page >= data.pages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      {selectedTx && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-10"
            onClick={() => setSelectedTx(null)}
          />
          <div className="fixed right-0 top-0 h-full w-105 bg-panel  shadow-xl z-20">
            <TransactionDetailPanel
              transaction={selectedTx}
              userRole={userRole}
              onClose={() => setSelectedTx(null)}
              onTransactionUpdated={handleTransactionUpdated}
            />
          </div>
        </>
      )}

      <RealtimeStream onTransaction={handleSSETransaction} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function SortButton({ field, current, order, onToggle, children }: any) {
  const isActive = current === field;

  return (
    <button
      onClick={() => onToggle(field)}
      className={`flex items-center gap-1 ${
        isActive ? "text-neutral-800" : "text-neutral-500"
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
