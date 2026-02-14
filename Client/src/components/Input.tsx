import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border bg-card px-4 py-2.5 text-foreground placeholder:text-foreground-subtle transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && "pl-10",
              error ? "border-destructive" : "border-input",
              className,
            )}
            {...props}
          />
        </div>

        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-foreground-muted">{hint}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
