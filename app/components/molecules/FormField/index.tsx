/**
 * @file components/molecules/FormField/index.tsx
 * @description Form field wrapper with React Hook Form integration
 *
 * @example
 * <FormField
 *   control={form.control}
 *   name="email"
 *   label="Email"
 *   placeholder="Enter email"
 * />
 */

"use client";

import React from "react";
import { Controller, Control, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { Input, InputProps } from "@/app/components/atoms";

// ==========================================
// TYPES
// ==========================================

export interface FormFieldProps<T extends FieldValues> extends Omit<InputProps, "name" | "error"> {
  /** React Hook Form control */
  control: Control<T>;
  /** Field name (must match form schema) */
  name: Path<T>;
  /** Validation rules */
  rules?: RegisterOptions<T, Path<T>>;
}

// ==========================================
// COMPONENT
// ==========================================

export function FormField<T extends FieldValues>({ control, name, rules, ...inputProps }: FormFieldProps<T>) {
  return <Controller control={control} name={name} rules={rules} render={({ field, fieldState }) => <Input {...inputProps} {...field} error={fieldState.error?.message} />} />;
}
