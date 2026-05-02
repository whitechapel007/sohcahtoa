// ─── Auth ─────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'analyst';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
  name: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // ms
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionStatus = 'pending' | 'completed' | 'flagged' | 'failed';
export type SortField = 'date' | 'amount' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface Transaction {
  id: string;
  description: string; // untrusted — never use dangerouslySetInnerHTML
  amount: number;
  currency: string;
  status: TransactionStatus;
  category: 'FX' | 'PTA' | 'BTA' | 'Medicals' | 'Transfer';
  date: string; // ISO 8601
  sender: string;
  recipient: string;
  accountNumber: string; // 16-digit — MUST be masked in all UI
  note?: string;
  flaggedBy?: string;
  flaggedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export type PaginatedTransactions = PaginatedResponse<Transaction>;

export interface TransactionFilters {
  status?: TransactionStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: SortField;
  order?: SortOrder;
}

// ─── Cards / Balance (existing dashboard widgets) ────────────────────────────

export type TransactionDirection = 'incoming' | 'outgoing' | 'wallet';
export type TransactionCategory = 'FX' | 'PTA' | 'BTA' | 'Medicals';
export type CardNetwork = 'VISA' | 'Mastercard';
export type CardType = 'prepaid' | 'virtual';

export interface VirtualCard {
  id: string;
  type: CardType;
  network: CardNetwork;
  lastFour: string;
  validThru: string;
  balance: number;
  currency: string;
  holder: string;
  color: 'orange' | 'dark';
}

export interface BalanceSummary {
  total: number;
  currency: string;
  moneyIn: number;
  moneyOut: number;
}

export interface MockUser {
  id: string;
  name: string;
  firstName: string;
  email: string;
  avatar: string | null;
  role: UserRole;
}

// ─── API response envelope ────────────────────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
