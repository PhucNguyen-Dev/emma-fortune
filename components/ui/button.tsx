import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "champagne";
type Size = "sm" | "md" | "lg" | "icon";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-plum text-ivory hover:bg-plum-deep shadow-sm disabled:hover:bg-plum",
  secondary:
    "border border-plum/25 bg-white/70 text-plum hover:bg-blush/60",
  ghost: "text-plum hover:bg-blush/60",
  danger:
    "bg-rose-deep text-white hover:bg-[#8f4258] shadow-sm",
  champagne:
    "bg-champagne text-plum-deep hover:bg-[#c9a95f] shadow-sm",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-9 px-3 text-sm rounded-lg gap-1.5",
  md: "min-h-11 px-4 text-sm rounded-xl gap-2",
  lg: "min-h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-11 w-11 rounded-xl justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
