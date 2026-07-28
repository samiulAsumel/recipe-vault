import type { ValidationIssue } from "./client";

/** Exact-match lookup; array/nested paths (e.g. "steps[0].title") use their own prefix lookups. */
export function fieldError(errors: ValidationIssue[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

export function fieldErrorsWithPrefix(errors: ValidationIssue[], prefix: string): ValidationIssue[] {
  return errors.filter((e) => e.field === prefix || e.field.startsWith(`${prefix}.`) || e.field.startsWith(`${prefix}[`));
}
