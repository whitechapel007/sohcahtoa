import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth-tokens";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import type { PaginatedTransactions, UserRole } from "@/types";
import TransactionsTable from "@/components/dashboard/TransactionsTable";

const EMPTY_TRANSACTIONS: PaginatedTransactions = {
  data: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 8,
};

async function fetchInitialTransactions(): Promise<PaginatedTransactions> {
  const res = await fetch(
    "/api/dashboard/transactions?sort=date&order=desc&page=1",
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error(`Transactions fetch failed: ${res.status}`);
  }

  return res.json();
}

export default async function TransactionsPage() {
  const cookieStore = await cookies();

  let userRole: UserRole = "analyst";

  try {
    const token = cookieStore.get(ACCESS_COOKIE)?.value;
    if (token) {
      const payload = decodeToken(token);
      userRole = payload?.role ?? "analyst";
    }
  } catch {
    userRole = "analyst";
  }

  let initialData = EMPTY_TRANSACTIONS;

  try {
    initialData = await fetchInitialTransactions();
  } catch {
    // silently fallback
  }

  return <TransactionsTable initialData={initialData} userRole={userRole} />;
}
