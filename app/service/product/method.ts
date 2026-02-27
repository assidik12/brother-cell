/**
 * @file service/product/method.ts
 * @description Product service layer - business logic
 *
 * Service layer handles:
 * - Input validation
 * - Business rules
 * - Calling repository functions
 * - Error handling & response formatting
 */

import {
  createProductRepository,
  findProductByIdRepository,
  findProductsRepository,
  updateProductRepository,
  deleteProductRepository,
  toggleProductActiveRepository,
  countProductsRepository,
  findProductsByCategoryRepository,
  type CreateProductInput,
  type FindProductsOptions,
} from "@/app/repository/product.repository";
import { productSchema, productFilterSchema, type ProductInput, type ProductFilterInput } from "@/app/validators/product.schema";

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
// CREATE PRODUCT
// ==========================================

export async function createProduct(input: ProductInput): Promise<ServiceResult<Awaited<ReturnType<typeof createProductRepository>>>> {
  try {
    // Validate input
    const validated = productSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const data: CreateProductInput = {
      name: validated.data.name,
      description: validated.data.description ?? null,
      price: validated.data.price,
      isActive: validated.data.isActive,
    };

    const product = await createProductRepository(data);

    return { success: true, data: product };
  } catch (error) {
    console.error("createProduct error:", error);
    return { success: false, error: "Gagal membuat produk" };
  }
}

// ==========================================
// GET PRODUCT BY ID
// ==========================================

export async function getProductById(id: string): Promise<ServiceResult<Awaited<ReturnType<typeof findProductByIdRepository>>>> {
  try {
    if (!id) {
      return { success: false, error: "ID produk wajib diisi" };
    }

    const product = await findProductByIdRepository(id);

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("getProductById error:", error);
    return { success: false, error: "Gagal mengambil data produk" };
  }
}

// ==========================================
// GET PRODUCTS (LIST WITH PAGINATION)
// ==========================================

export async function getProducts(filters: ProductFilterInput): Promise<
  ServiceResult<{
    items: Awaited<ReturnType<typeof findProductsRepository>>["items"];
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
    const validated = productFilterSchema.safeParse(filters);
    if (!validated.success) {
      return {
        success: false,
        error: "Filter tidak valid",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const opts: FindProductsOptions = {
      page: validated.data.page,
      perPage: validated.data.limit,
      search: validated.data.search ?? undefined,
      categoryId: validated.data.categoryId ?? undefined,
      isActive: validated.data.isActive ?? undefined,
    };

    const result = await findProductsRepository(opts);

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
    console.error("getProducts error:", error);
    return { success: false, error: "Gagal mengambil daftar produk" };
  }
}

// ==========================================
// UPDATE PRODUCT
// ==========================================

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<ServiceResult<Awaited<ReturnType<typeof updateProductRepository>>>> {
  try {
    if (!id) {
      return { success: false, error: "ID produk wajib diisi" };
    }

    // Check if product exists
    const existing = await findProductByIdRepository(id);
    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    // Validate partial input (only validate provided fields)
    const partialSchema = productSchema.partial();
    const validated = partialSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const updateData: Partial<CreateProductInput> = {};
    if (validated.data.name !== undefined) updateData.name = validated.data.name;
    if (validated.data.description !== undefined) updateData.description = validated.data.description;
    if (validated.data.price !== undefined) updateData.price = validated.data.price;
    if (validated.data.isActive !== undefined) updateData.isActive = validated.data.isActive;

    const product = await updateProductRepository(id, updateData);

    return { success: true, data: product };
  } catch (error) {
    console.error("updateProduct error:", error);
    return { success: false, error: "Gagal memperbarui produk" };
  }
}

// ==========================================
// DELETE PRODUCT
// ==========================================

export async function deleteProduct(id: string): Promise<ServiceResult<{ deleted: boolean }>> {
  try {
    if (!id) {
      return { success: false, error: "ID produk wajib diisi" };
    }

    // Check if product exists
    const existing = await findProductByIdRepository(id);
    if (!existing) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    // Business rule: Check if product has active vouchers
    // TODO: Add voucher check when voucher repository is ready
    // const hasVouchers = await countVouchersRepository({ productId: id, status: 'available' });
    // if (hasVouchers > 0) {
    //   return { success: false, error: 'Produk memiliki voucher aktif, hapus voucher terlebih dahulu' };
    // }

    await deleteProductRepository(id);

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("deleteProduct error:", error);
    return { success: false, error: "Gagal menghapus produk" };
  }
}

// ==========================================
// TOGGLE PRODUCT STATUS
// ==========================================

export async function toggleProductStatus(id: string): Promise<ServiceResult<Awaited<ReturnType<typeof toggleProductActiveRepository>>>> {
  try {
    if (!id) {
      return { success: false, error: "ID produk wajib diisi" };
    }

    const product = await toggleProductActiveRepository(id);

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    return { success: true, data: product };
  } catch (error) {
    console.error("toggleProductStatus error:", error);
    return { success: false, error: "Gagal mengubah status produk" };
  }
}

// ==========================================
// GET PRODUCTS BY CATEGORY
// ==========================================

export async function getProductsByCategory(categoryId: string): Promise<ServiceResult<Awaited<ReturnType<typeof findProductsByCategoryRepository>>>> {
  try {
    if (!categoryId) {
      return { success: false, error: "ID kategori wajib diisi" };
    }

    const products = await findProductsByCategoryRepository(categoryId);

    return { success: true, data: products };
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    return { success: false, error: "Gagal mengambil produk berdasarkan kategori" };
  }
}

// ==========================================
// COUNT PRODUCTS
// ==========================================

export async function countProducts(filters: { categoryId?: string; isActive?: boolean; search?: string } = {}): Promise<ServiceResult<number>> {
  try {
    const count = await countProductsRepository(filters);
    return { success: true, data: count };
  } catch (error) {
    console.error("countProducts error:", error);
    return { success: false, error: "Gagal menghitung jumlah produk" };
  }
}
