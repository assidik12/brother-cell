/**
 * @file components/index.ts
 * @description Central export file for all components
 *
 * Atomic Design Structure:
 * - Atoms: Basic building blocks (Button, Input, Badge, etc.)
 * - Molecules: Combinations of atoms (FormField, SearchBar, etc.)
 * - Fragments: Reusable page sections (Navbar, Footer, etc.)
 * - Views: Page-specific components organized by feature
 */

// Atoms - Basic building blocks
export * from "./atoms";

// Molecules - Combinations of atoms
export * from "./molecules";

// Fragments - Reusable page sections
export * from "./fragments";

// Views - Page-specific components
export * from "./views/main";
