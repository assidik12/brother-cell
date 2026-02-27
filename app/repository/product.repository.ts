import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "../generated/prisma/client";

/**
 * Product repository (Prisma queries)
 * Returns raw Prisma records to the service layer for further business logic.
 */

export type CreateProductInput = {
  name: string;
  description?: string | null;
  price: number;
  isActive?: boolean;
};

export async function createProductRepository(data: CreateProductInput) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      isActive: data.isActive ?? true,
    },
  });
}

export async function findProductByIdRepository(id: string) {
  return prisma.product.findUnique({
    where: { id },
  });
}

export type FindProductsOptions = {
  page?: number;
  perPage?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
};

export async function findProductsRepository(opts: FindProductsOptions = {}) {
  const { page = 1, perPage = 20, search, isActive } = opts;

  const where: Prisma.ProductWhereInput = {};
  if (typeof isActive === "boolean") where.isActive = isActive;
  if (search) {
    where.OR = [{ name: { contains: search, mode: "insensitive" } }, { description: { contains: search, mode: "insensitive" } }];
  }

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page, perPage };
}

export async function updateProductRepository(id: string, data: Partial<CreateProductInput>) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(typeof data.name === "string" ? { name: data.name } : {}),
      ...(Object.prototype.hasOwnProperty.call(data, "description") ? { description: data.description ?? null } : {}),
      ...(typeof data.price === "number" ? { price: data.price } : {}),
      ...(typeof data.isActive === "boolean" ? { isActive: data.isActive } : {}),
    },
  });
}

export async function deleteProductRepository(id: string) {
  return prisma.product.delete({ where: { id } });
}

export async function toggleProductActiveRepository(id: string) {
  // Read current value then flip it in a transaction to avoid races
  const [product] = await prisma.$transaction([prisma.product.findUnique({ where: { id } })]);
  if (!product) return null;
  return prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
}

export async function countProductsRepository(filters: Partial<Pick<CreateProductInput, "name"> & { isActive?: boolean; search?: string }> = {}) {
  const where: Prisma.ProductWhereInput = {};
  if (typeof filters.isActive === "boolean") where.isActive = filters.isActive;
  if (filters.search) where.OR = [{ name: { contains: filters.search, mode: "insensitive" } }, { description: { contains: filters.search, mode: "insensitive" } }];
  return prisma.product.count({ where });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function findProductsByCategoryRepository(_categoryId: string) {
  // Note: categoryId is reserved for future use when categories are implemented
  return prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
}
