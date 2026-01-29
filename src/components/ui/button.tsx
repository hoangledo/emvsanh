import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  variant: {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg transition-all",
    secondary:
      "glass text-foreground hover:opacity-90 border-border hover:border-accent/50 transition-all",
    ghost:
      "text-foreground hover:bg-muted/50 hover:text-accent transition-colors",
    link: "text-accent underline-offset-4 hover:underline",
  },
  size: {
    sm: "h-8 px-3 text-sm rounded-full",
    md: "h-10 px-5 text-base rounded-full",
    lg: "h-12 px-6 text-lg rounded-full",
  },
} as const;

type ButtonVariant = keyof typeof buttonVariants.variant;
type ButtonSize = keyof typeof buttonVariants.size;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
          buttonVariants.variant[variant],
          buttonVariants.size[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
