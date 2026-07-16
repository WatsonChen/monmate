export type ApiError = {
  code: string;
  message: string;
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
  | "INVALID";
export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "EXPIRED"
  | "CANCELED"
  | "FAILED"
  | "REFUNDED";
export type PaymentProduct = "EVENT_CREDIT";
export type CreditTransactionReason = "PAYMENT_TOPUP" | "ATTENDEE_CREATE" | "ATTENDEE_IMPORT" | "MANUAL_ADJUSTMENT";

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
  attendeeLimit?: number | null;
  registrationRequired?: boolean;
  openRegistration?: boolean;
  registrationFields?: RegistrationField[];
  attendeeCount?: number;
  checkInLogCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

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
