import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

/**
 * Reusable Container component for layout consistency.
 * Applies standard max-width and horizontal padding across devices.
 */
export function Container({
  as: Component = "div",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn("mx-auto max-w-7xl px-6 lg:px-8 w-full", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
