"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-[var(--border)] bg-[var(--background-secondary)]",
        className
      )}
      {...props}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
        <span className="text-lg font-semibold text-[var(--foreground)]">
          Nexus
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {children}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-3">
        <p className="text-xs text-[var(--foreground-secondary)]">
          Prompt Refinery
        </p>
      </div>
    </aside>
  );
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

export function SidebarItem({
  className,
  active,
  icon,
  children,
  ...props
}: SidebarItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--foreground)] hover:bg-[var(--border)]",
        className
      )}
      {...props}
    >
      {icon && <span className="h-4 w-4">{icon}</span>}
      {children}
    </button>
  );
}
