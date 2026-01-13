"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
}

export function Header({ className, title, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "flex h-14 items-center justify-between border-b border-[var(--border)] bg-white px-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-medium text-[var(--foreground)]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        {children}
      </div>
    </header>
  );
}

interface UserMenuProps {
  email?: string;
  onSettings?: () => void;
  onLogout?: () => void;
}

export function UserMenu({ email, onSettings, onLogout }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-medium text-white">
          {email?.charAt(0).toUpperCase() ?? "U"}
        </div>
        <span className="text-sm text-[var(--foreground-secondary)]">
          {email ?? "User"}
        </span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow-md)]">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {email}
            </p>
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                onSettings?.();
                setOpen(false);
              }}
              className="w-full rounded-md px-3 py-1.5 text-left text-sm text-[var(--foreground)] hover:bg-[var(--background-secondary)]"
            >
              Settings
            </button>
            <button
              onClick={() => {
                onLogout?.();
                setOpen(false);
              }}
              className="w-full rounded-md px-3 py-1.5 text-left text-sm text-[var(--error)] hover:bg-[var(--background-secondary)]"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
