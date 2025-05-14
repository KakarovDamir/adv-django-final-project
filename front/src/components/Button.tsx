/* eslint-disable */
"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500";

  // Size styles
  const sizeStyles = {
    sm: "text-xs py-2 px-3 rounded-lg",
    md: "text-sm py-2.5 px-4 rounded-xl",
    lg: "text-base py-3 px-6 rounded-xl",
  };

  // Variant styles
  const variantStyles = {
    primary:
      "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-sm hover:shadow",
    secondary: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    outline: "border border-violet-600 text-violet-600 hover:bg-violet-50",
    ghost: "text-violet-600 hover:bg-violet-50",
  };

  // Width style
  const widthStyle = fullWidth ? "w-full" : "";

  // Disabled style
  const disabledStyle =
    disabled || isLoading ? "opacity-70 cursor-not-allowed" : "";

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyle}
        ${disabledStyle}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      {!isLoading && icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}

      <span>{children}</span>

      {!isLoading && icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
}
