/**
 * @file api/user/register/route.ts
 * @description Controller untuk registrasi admin baru
 *
 * Controller hanya menangani:
 * 1. Validasi input (Zod)
 * 2. Memanggil Service
 * 3. Format response
 */

import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/app/validators/auth.schema";
import { SignUp } from "@/app/service/auth/method";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validasi input dengan Zod
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { username, password } = validationResult.data;

    // Panggil Service layer
    const result = await SignUp({ username, password });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration failed",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        data: {
          id: result.id,
          username: result.username,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
