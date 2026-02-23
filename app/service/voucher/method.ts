/**
 * @file service/voucher/method.ts
 * @description Voucher service layer - business logic
 *
 * Handles:
 * - Input validation
 * - Business rules (claim once, stock check)
 * - Repository calls
 * - Error handling
 */

import {
  createVoucherRepository,
  createManyVouchersRepository,
  findVoucherByIdRepository,
  findVouchersRepository,
  updateVoucherRepository,
  deleteVoucherRepository,
  countVouchersRepository,
  claimVoucherRepository,
  reserveVoucherRepository,
  releaseVoucherRepository,
  getVoucherStatsByProductRepository,
  type CreateVoucherInput,
  type FindVouchersOptions,
} from "@/app/repository/voucher.repository";
import { findProductByIdRepository } from "@/app/repository/product.repository";
import { voucherSchema, bulkVoucherSchema, voucherFilterSchema, type VoucherInput, type BulkVoucherInput, type VoucherFilterInput } from "@/app/validators/voucher.schema";

// VoucherStatus type (matches Prisma enum)
type VoucherStatus = "available" | "sold" | "reserved";

// ==========================================
// TYPES
// ==========================================

export type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// ==========================================
// CREATE SINGLE VOUCHER
// ==========================================

export async function createVoucher(input: VoucherInput): Promise<ServiceResult<Awaited<ReturnType<typeof createVoucherRepository>>>> {
  try {
    // Validate input
    const validated = voucherSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check product exists
    const product = await findProductByIdRepository(validated.data.productId);
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    if (!product.isActive) {
      return { success: false, error: "Produk tidak aktif" };
    }

    const data: CreateVoucherInput = {
      productId: validated.data.productId,
      code: validated.data.code,
    };

    const voucher = await createVoucherRepository(data);

    return { success: true, data: voucher };
  } catch (error: unknown) {
    console.error("createVoucher error:", error);
    // Handle unique constraint violation (duplicate code)
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Kode voucher sudah ada" };
    }
    return { success: false, error: "Gagal membuat voucher" };
  }
}

// ==========================================
// BULK CREATE VOUCHERS
// ==========================================

export async function createBulkVouchers(input: BulkVoucherInput): Promise<ServiceResult<{ created: number; total: number; skipped: number }>> {
  try {
    // Validate input
    const validated = bulkVoucherSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    // Check product exists
    const product = await findProductByIdRepository(validated.data.productId);
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    if (!product.isActive) {
      return { success: false, error: "Produk tidak aktif" };
    }

    const result = await createManyVouchersRepository(validated.data.productId, validated.data.codes);
    return { success: true, data: result };
  } catch (error) {
    console.error("createBulkVouchers error:", error);
    return { success: false, error: "Gagal membuat voucher" };
  }
}

// ==========================================
// GET VOUCHER BY ID
// ==========================================

export async function getVoucherById(id: string): Promise<ServiceResult<Awaited<ReturnType<typeof findVoucherByIdRepository>>>> {
  try {
    if (!id) {
      return { success: false, error: "ID voucher wajib diisi" };
    }

    const voucher = await findVoucherByIdRepository(id);

    if (!voucher) {
      return { success: false, error: "Voucher tidak ditemukan" };
    }

    return { success: true, data: voucher };
  } catch (error) {
    console.error("getVoucherById error:", error);
    return { success: false, error: "Gagal mengambil data voucher" };
  }
}

// ==========================================
// GET VOUCHERS (LIST WITH PAGINATION)
// ==========================================

export async function getVouchers(filters: VoucherFilterInput): Promise<
  ServiceResult<{
    items: Awaited<ReturnType<typeof findVouchersRepository>>["items"];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  }>
> {
  try {
    // Validate filters
    const validated = voucherFilterSchema.safeParse(filters);
    if (!validated.success) {
      return {
        success: false,
        error: "Filter tidak valid",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const opts: FindVouchersOptions = {
      page: validated.data.page,
      perPage: validated.data.limit,
      search: validated.data.search,
      productId: validated.data.productId,
      status: validated.data.status as VoucherStatus | undefined,
    };

    const result = await findVouchersRepository(opts);

    return {
      success: true,
      data: {
        items: result.items,
        pagination: {
          page: result.page,
          perPage: result.perPage,
          total: result.total,
          totalPages: Math.ceil(result.total / result.perPage),
        },
      },
    };
  } catch (error) {
    console.error("getVouchers error:", error);
    return { success: false, error: "Gagal mengambil daftar voucher" };
  }
}

// ==========================================
// UPDATE VOUCHER
// ==========================================

export async function updateVoucher(id: string, input: Partial<Pick<VoucherInput, "code"> & { status?: VoucherStatus }>): Promise<ServiceResult<Awaited<ReturnType<typeof updateVoucherRepository>>>> {
  try {
    if (!id) {
      return { success: false, error: "ID voucher wajib diisi" };
    }

    // Check voucher exists
    const existing = await findVoucherByIdRepository(id);
    if (!existing) {
      return { success: false, error: "Voucher tidak ditemukan" };
    }

    // Business rule: Cannot edit sold voucher
    if (existing.status === "sold") {
      return { success: false, error: "Voucher yang sudah terjual tidak dapat diedit" };
    }

    const voucher = await updateVoucherRepository(id, input);

    return { success: true, data: voucher };
  } catch (error: unknown) {
    console.error("updateVoucher error:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { success: false, error: "Kode voucher sudah ada" };
    }
    return { success: false, error: "Gagal memperbarui voucher" };
  }
}

// ==========================================
// DELETE VOUCHER
// ==========================================

export async function deleteVoucher(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
  try {
    if (!id) {
      return { success: false, error: "ID voucher wajib diisi" };
    }

    // Check voucher exists
    const existing = await findVoucherByIdRepository(id);
    if (!existing) {
      return { success: false, error: "Voucher tidak ditemukan" };
    }

    // Business rule: Cannot delete sold voucher
    if (existing.status === "sold") {
      return { success: false, error: "Voucher yang sudah terjual tidak dapat dihapus" };
    }

    await deleteVoucherRepository(id);

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("deleteVoucher error:", error);
    return { success: false, error: "Gagal menghapus voucher" };
  }
}

// ==========================================
// CLAIM VOUCHER (AFTER PAYMENT SUCCESS)
// ==========================================

/**
 * Claim a voucher after successful payment
 * - Voucher can only be claimed ONCE
 * - Uses row locking to prevent race conditions
 *
 * @param productId - Product to claim voucher from
 * @param transactionId - The successful transaction
 */
export async function claimVoucher(productId: string, transactionId: string): Promise<ServiceResult<Awaited<ReturnType<typeof claimVoucherRepository>>>> {
  try {
    if (!productId || !transactionId) {
      return { success: false, error: "Product ID dan Transaction ID wajib diisi" };
    }

    // Check product exists and active
    const product = await findProductByIdRepository(productId);
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    // Claim voucher with row locking
    const claimedVoucher = await claimVoucherRepository(productId, transactionId);

    if (!claimedVoucher) {
      return { success: false, error: "Tidak ada voucher tersedia untuk produk ini" };
    }

    return { success: true, data: claimedVoucher };
  } catch (error) {
    console.error("claimVoucher error:", error);
    return { success: false, error: "Gagal mengklaim voucher" };
  }
}

// ==========================================
// RESERVE VOUCHER (FOR PENDING PAYMENT)
// ==========================================

export async function reserveVoucher(productId: string): Promise<ServiceResult<Awaited<ReturnType<typeof reserveVoucherRepository>>>> {
  try {
    if (!productId) {
      return { success: false, error: "Product ID wajib diisi" };
    }

    const reserved = await reserveVoucherRepository(productId);

    if (!reserved) {
      return { success: false, error: "Tidak ada voucher tersedia" };
    }

    return { success: true, data: reserved };
  } catch (error) {
    console.error("reserveVoucher error:", error);
    return { success: false, error: "Gagal mereservasi voucher" };
  }
}

// ==========================================
// RELEASE VOUCHER (PAYMENT FAILED)
// ==========================================

export async function releaseVoucher(voucherId: string): Promise<ServiceResult<Awaited<ReturnType<typeof releaseVoucherRepository>>>> {
  try {
    if (!voucherId) {
      return { success: false, error: "Voucher ID wajib diisi" };
    }

    const released = await releaseVoucherRepository(voucherId);

    return { success: true, data: released };
  } catch (error) {
    console.error("releaseVoucher error:", error);
    return { success: false, error: "Gagal melepaskan reservasi voucher" };
  }
}

// ==========================================
// GET VOUCHER STATS BY PRODUCT
// ==========================================

export async function getVoucherStats(productId: string): Promise<ServiceResult<{ available: number; sold: number; reserved: number; total: number }>> {
  try {
    if (!productId) {
      return { success: false, error: "Product ID wajib diisi" };
    }

    const stats = await getVoucherStatsByProductRepository(productId);

    return { success: true, data: stats };
  } catch (error) {
    console.error("getVoucherStats error:", error);
    return { success: false, error: "Gagal mengambil statistik voucher" };
  }
}

// ==========================================
// COUNT VOUCHERS
// ==========================================

export async function countVouchers(filters: { productId?: string; status?: VoucherStatus } = {}): Promise<ServiceResult<number>> {
  try {
    const count = await countVouchersRepository(filters);
    return { success: true, data: count };
  } catch (error) {
    console.error("countVouchers error:", error);
    return { success: false, error: "Gagal menghitung jumlah voucher" };
  }
}
