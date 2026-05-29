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

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type EventDTO = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  startAt: string;
  endAt?: string | null;
  location?: string | null;
};

export type AttendeeDTO = {
  id: string;
  eventId: string;
  name: string;
  phone: string;
  checkInCode: string;
  qrToken: string;
  checkInStatus: CheckInStatus;
  checkedInAt?: string | null;
};

export type CheckInResultDTO = {
  status: CheckInLogStatus;
  attendee?: Pick<
    AttendeeDTO,
    "id" | "name" | "phone" | "checkInStatus" | "checkedInAt"
  > & {
    phoneLastThree: string;
  };
  checkedInAt?: string;
};
