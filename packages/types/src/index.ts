export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

// 點數錢包最低可用餘額：帳戶層級的臨時額度（最多可先使用 3 點），與後端一致
export const CREDIT_FLOOR = -3;

// 點數不足（402 INSUFFICIENT_ATTENDEE_CREDITS）時後端附帶的細節，供儲值視窗使用
export type InsufficientCreditsDetails = {
  required: number;
  balance: number;
  balanceAfter: number;
  floor: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type UserRole = "OWNER" | "ADMIN" | "STAFF";
export type CheckInStatus = "NOT_CHECKED_IN" | "CHECKED_IN";
export type CheckInMethod = "QR_CODE" | "MANUAL_CODE";
export type CheckInLogStatus =
  | "SUCCESS"
  | "ALREADY_CHECKED_IN"
  | "NOT_FOUND"
  | "INVALID"
  | "NOT_STARTED";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "CANCELED"
  | "FAILED"
  | "REFUNDED";
export type PaymentProduct = "EVENT_CREDIT";
export type CreditTransactionReason =
  | "PAYMENT_TOPUP"
  | "ATTENDEE_CREATE"
  | "ATTENDEE_IMPORT"
  | "MANUAL_ADJUSTMENT"
  | "FEATURE_UNLOCK";

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  attendeeCredits: number;
  assignedEventId?: string | null;
  assignedEventIds?: string[];
};

export type StaffDTO = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type RegistrationField = {
  key: string; // preset: "email" | "age" | "gender"; custom: any other string
  label?: string; // display label — required for custom fields
  type?: "text" | "number" | "select"; // defaults to "text" for custom fields
  options?: string[]; // only for type="select"
  required: boolean;
};

export type EventDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  content?: string | null;
  startAt: string;
  endAt?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  attendeeLimit?: number | null;
  allowOverCapacity?: boolean;
  registrationRequired?: boolean;
  openRegistration?: boolean;
  selfCheckInBufferMinutes?: number | null;
  registrationFields?: RegistrationField[];
  unlockedFeatures?: string[];
  /** 主辦手動暫停新增公開報名的時間；null 代表未暫停 */
  registrationPausedAt?: string | null;
  attendeeCount?: number;
  checkInLogCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

// Premium features an event can unlock once from the user's existing
// attendeeCredits pool — a flat one-time deduction, not a subscription.
export const FEATURE_UNLOCK_COSTS = {
  BRANDING: 50
} as const;

export type FeatureUnlockKey = keyof typeof FEATURE_UNLOCK_COSTS;

export type AttendeeDTO = {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  email?: string | null;
  age?: number | null;
  gender?: "M" | "F" | "OTHER" | null;
  checkInCode: string;
  qrToken: string;
  checkInStatus: CheckInStatus;
  checkedInAt?: string | null;
  customFields?: Record<string, string | number | null> | null;
  note?: string | null;
  checkInCapacity?: number;
  checkInCount?: number;
};

export type SmsResultDTO = {
  success: boolean;
  message: string;
  preview: string;
};

export type CheckInResultDTO = {
  status: CheckInLogStatus;
  isLookup?: boolean;
  attendee?: Pick<
    AttendeeDTO,
    "id" | "name" | "phone" | "checkInStatus" | "checkedInAt" | "customFields" | "note" | "checkInCapacity" | "checkInCount"
  > & {
    phoneLastThree: string;
  };
  checkedInAt?: string;
  checkInOpensAt?: string;
};

export type PaymentDTO = {
  id: string;
  status: PaymentStatus;
  product: PaymentProduct;
  quantity: number;
  creditsGranted: number;
  amountTotal?: number | null;
  currency?: string | null;
  pricingTier?: string | null;
  attendeeLimit?: number | null;
  providerOrderNo?: string | null;
  providerTradeNo?: string | null;
  consumedAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
};

export type CreditTransactionDTO = {
  id: string;
  amount: number;
  reason: CreditTransactionReason;
  balanceAfter: number;
  eventId?: string | null;
  attendeeId?: string | null;
  paymentId?: string | null;
  note?: string | null;
  createdAt: string;
};

export type BillingStatusDTO = {
  attendeeCredits: number;
  recentPayments: PaymentDTO[];
  recentTransactions: CreditTransactionDTO[];
};

export type TransactionsPageDTO = {
  total: number;
  page: number;
  pageSize: number;
  transactions: CreditTransactionDTO[];
};

export type CheckoutSessionDTO = {
  paymentId: string;
  action: string;
  method: "POST";
  fields: Record<string, string>;
};

export type PricingTierDTO = {
  id: string;
  label: string;
  attendeeRange: string;
  attendeeCredits: number;
  amount: number;
  currency: "TWD";
};

// ---------- 名單匯入（預覽 → 確認） ----------

export type ImportRowErrorDTO = { rowNumber: number; field: string; reason: string };
export type ImportDecisionDTO = { action: "UPDATE" | "NEW" | "SKIP"; targetId?: string };

export type ImportSuspectDTO = {
  rowNumber: number;
  name: string;
  phone: string;
  capacity: number;
  candidates: { id: string; name: string; phone: string }[];
  decision: ImportDecisionDTO | null;
};

export type ImportPreviewDTO = {
  sessionId: string;
  fileName: string;
  counts: {
    totalRows: number;
    errorRows: number;
    duplicateInFile: number;
    unchanged: number;
    toUpdate: number;
    toCreate: number;
    skippedByUser: number;
    suspect: number;
    suspectPending: number;
  };
  // 紀錄筆數（counts）與含攜伴的計費人數分開
  billableHeadcount: number;
  costIsFinal: boolean;
  wallet: { balance: number; balanceAfter: number; floor: number; needsTopUp: boolean; minTopUp: number };
  capacity: { blocked: boolean; limit: number | null };
  warnings: string[];
  errors: ImportRowErrorDTO[];
  errorsTruncated: boolean;
  suspects: ImportSuspectDTO[];
  previouslyImported: boolean;
};

export type ImportResultDTO = {
  fileName: string;
  created: number;
  updated: number;
  unchanged: number;
  duplicateInFile: number;
  skippedByUser: number;
  errorRows: number;
  billedHeadcount: number;
  balanceAfter: number;
};

export type ImportSessionDTO =
  | { status: "PREVIEW"; preview: ImportPreviewDTO }
  | { status: "CONFIRMED"; result: ImportResultDTO | null };

export type ImportConfirmDTO =
  | { status: "CONFIRMED"; alreadyConfirmed: boolean; result: ImportResultDTO }
  | { status: "CHANGED"; preview: ImportPreviewDTO };

export type ImportHistoryItemDTO = {
  id: string;
  fileName: string;
  confirmedAt: string | null;
  result: ImportResultDTO | null;
};

export type PaymentStatusDTO = {
  id: string;
  status: PaymentStatus;
  amountTotal: number | null;
  pricingTier: string | null;
  attendeeLimit: number | null;
  creditsGranted: number;
  createdAt: string;
  paidAt: string | null;
  stale: boolean;
  balance: number;
};
