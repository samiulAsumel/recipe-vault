import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "border border-ink bg-ink text-parchment hover:bg-ink/85",
  secondary: "border border-clay-line text-ink hover:border-ink hover:shadow-[var(--shadow-card)]",
  ghost: "border border-transparent text-ink/70 hover:border-clay-line hover:text-ink",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1",
  md: "px-4 py-2",
};

/** Shared class builder so non-<button> triggers (e.g. a Link styled as a
 * button, like the language toggle) stay visually identical to <Button>. */
export function buttonClasses(
  variant: ButtonVariant = "secondary",
  size: ButtonSize = "md",
  className = "",
): string {
  return [
    "inline-flex shrink-0 items-center justify-center gap-2 font-meta text-xs uppercase tracking-wide transition-colors duration-150",
    "disabled:cursor-not-allowed disabled:opacity-40",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** Shared button primitive — one place to keep hover/disabled/focus behavior
 * consistent across the site instead of each caller hand-rolling
 * `border border-clay-line px-4 py-2 ...` on its own. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", className, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...props} />
  );
});
