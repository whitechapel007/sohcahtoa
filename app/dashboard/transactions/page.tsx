import { cookies } from "next/headers";
import { decodeToken } from "@/lib/auth-tokens";
import { ACCESS_COOKIE } from "@/lib/auth-cookies";
import { getTransactions } from "@/lib/dashboard/getTransactions";
import { TRANSACTIONS } from "@/data/mock/transactions";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import type { PaginatedTransactions, UserRole } from "@/types";

const EMPTY_TRANSACTIONS: PaginatedTransactions = {
  data: [],
  total: 0,
  page: 1,
  pages: 1,
  limit: 8,
};

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

  let initialData: PaginatedTransactions = EMPTY_TRANSACTIONS;
  try {
    const data = await getTransactions({ sort: "date", order: "desc", limit: 8 });
    const total = TRANSACTIONS.length;
    initialData = {
      data,
      total,
      page: 1,
      pages: Math.ceil(total / 8),
      limit: 8,
    };
  } catch {
    // silently fallback to empty state
  }

  return <TransactionsTable initialData={initialData} userRole={userRole} />;
}
