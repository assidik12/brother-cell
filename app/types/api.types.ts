/**
 * @file types/api.types.ts
 * @description TypeScript types for API requests and responses
 */

// ==========================================
// GENERIC API RESPONSE
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// AUTH RESPONSES
// ==========================================

export interface LoginResponse {
  user: {
    id: string;
    username: string;
  };
  token?: string;
}

// ==========================================
// TRANSACTION RESPONSES
// ==========================================

export interface InitiateTransactionResponse {
  orderId: string;
  qrString: string;
  qrUrl: string;
  amount: number;
  expiryTime: string;
}

// ==========================================
// SMS GATEWAY TYPES
// ==========================================

export interface SendSmsRequest {
  phoneNumber: string;
  message: string;
}

export interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ==========================================
// MIDTRANS TYPES
// ==========================================

export interface MidtransQrisRequest {
  orderId: string;
  amount: number;
  customerName?: string;
}

export interface MidtransQrisResponse {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  actions: Array<{
    name: string;
    method: string;
    url: string;
  }>;
}

// ==========================================
// ERROR TYPES
// ==========================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ==========================================
// COMMON ERROR CODES
// ==========================================

export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Product
  PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",
  PRODUCT_INACTIVE: "PRODUCT_INACTIVE",

  // Voucher
  VOUCHER_NOT_FOUND: "VOUCHER_NOT_FOUND",
  OUT_OF_STOCK: "OUT_OF_STOCK",

  // Transaction
  TRANSACTION_NOT_FOUND: "TRANSACTION_NOT_FOUND",
  TRANSACTION_ALREADY_PROCESSED: "TRANSACTION_ALREADY_PROCESSED",
  INVALID_SIGNATURE: "INVALID_SIGNATURE",

  // SMS
  SMS_SEND_FAILED: "SMS_SEND_FAILED",

  // General
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
