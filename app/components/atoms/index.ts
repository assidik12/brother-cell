/**
 * @file components/atoms/index.ts
 * @description Central export file for all Atom components
 *
 * Atoms are the basic building blocks of the UI.
 * They are simple, single-purpose components that can't be broken down further.
 */

// Button
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

// Input
export { Input } from "./Input";
export type { InputProps } from "./Input";

// Badge
export { Badge } from "./Badge";
export type { BadgeProps } from "./Badge";

// Modal
export { Modal } from "./Modal";
export type { ModalProps } from "./Modal";

// Card
export { Card, CardHeader, CardContent, CardFooter } from "./Card";
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from "./Card";

// Toggle
export { Toggle } from "./Toggle";
export type { ToggleProps } from "./Toggle";
