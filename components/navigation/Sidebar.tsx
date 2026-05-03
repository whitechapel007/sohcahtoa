"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HomeIcon,
  CalculatorIcon,
  TransactionsIcon,
  CardsIcon,
  SupportIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LogoutIcon,
} from "@/components/core/Icons";
import Image from "next/image";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/dashboard/calculator", label: "Calculator", icon: CalculatorIcon },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: TransactionsIcon,
  },
  { href: "/dashboard/cards", label: "Cards", icon: CardsIcon, badge: 2 },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleLogout() {
    startTransition(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <aside
      className={`
        relative flex flex-col bg-sidebar-bg border-r border-neutral-200
        transition-all duration-200 ease-in-out shrink-0
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="
          absolute -right-3.5 top-8 z-10
          w-7 h-7 bg-white border border-neutral-200 rounded-full shadow-sm
          flex items-center justify-center
          text-neutral-500 hover:text-brand-orange hover:border-brand-orange
          transition-all
        "
      >
        {collapsed ? (
          <ChevronRightIcon size={12} />
        ) : (
          <ChevronLeftIcon size={12} />
        )}
      </button>

      {/* Logo */}
      <div
        className={`flex items-center gap-3 px-5 py-6 ${collapsed ? "px-4 justify-center" : ""}`}
      >
        {!collapsed ? (
          <Image
            src="/logo.svg"
            alt=""
            width={120}
            height={80}
            loading="eager"
          />
        ) : (
          <Image src="/logo.png" alt="" width={48} height={48} />
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-150 relative
                ${
                  isActive
                    ? "bg-brand-ash-hover text-brand-orange"
                    : "text-inactive-text hover:bg-neutral-50 hover:text-neutral-700"
                }
                ${collapsed ? "justify-center px-0" : ""}
              `}
              title={collapsed ? label : undefined}
            >
              <div
                className={`
                  flex items-center justify-center shrink-0 transition-all
                  ${isActive ? "text-brand-orange" : "text-inactive-text group-hover:text-neutral-600"}
                `}
              >
                <Icon size={18} variant={isActive ? "Bold" : "Outline"} />
              </div>

              {!collapsed && (
                <span className="font-medium  truncate">{label}</span>
              )}

              {badge && !collapsed && (
                <span className="ml-auto shrink-0 w-5 h-5 bg-brand-orange rounded-full text-white text-xs font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
              {badge && collapsed && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-orange rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        {/* Support */}
        <button
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-inactive-text hover:bg-neutral-50 hover:text-neutral-700
            transition-all w-full
            ${collapsed ? "justify-center" : ""}
          `}
          title={collapsed ? "Support" : undefined}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <SupportIcon size={24} />
          </div>
          {!collapsed && <span className="font-medium text-base">Support</span>}
        </button>

        {/* Divider */}
        <div className="border-t border-neutral-100 my-1" />

        {/* User profile */}
        <div
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-neutral-200 shadow-[0px_2px_2px_0px_#2323230D]
            ${collapsed ? "justify-center px-2" : ""}
          `}
        >
          <div className="w-11 h-11 rounded-full bg-brand-orange-light border-2 border-brand-orange-muted flex items-center justify-center shrink-0">
            <span className="text-brand-orange text-xs font-bold">
              {initials}
            </span>
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-neutral-800 truncate">
                  {userName}
                </p>
                <p className="text-sm font-normal text-neutral-400 truncate">
                  {userEmail}
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={isPending}
                title="Sign out"
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-negative hover:bg-negative-bg transition-all"
              >
                <LogoutIcon size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
