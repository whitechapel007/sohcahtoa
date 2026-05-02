'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LogoWaves,
  HomeIcon,
  CalculatorIcon,
  TransactionsIcon,
  CardsIcon,
  SupportIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LogoutIcon,
} from '@/components/core/Icons';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: HomeIcon },
  { href: '/dashboard/calculator', label: 'Calculator', icon: CalculatorIcon },
  { href: '/dashboard/transactions', label: 'Transactions', icon: TransactionsIcon },
  { href: '/dashboard/cards', label: 'Cards', icon: CardsIcon, badge: 2 },
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
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  function handleLogout() {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    });
  }

  return (
    <aside
      className={`
        relative flex flex-col bg-sidebar-bg border-r border-neutral-200
        transition-all duration-200 ease-in-out shrink-0
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
      `}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="
          absolute -right-3.5 top-8 z-10
          w-7 h-7 bg-white border border-neutral-200 rounded-full shadow-sm
          flex items-center justify-center
          text-neutral-500 hover:text-brand-orange hover:border-brand-orange
          transition-all
        "
      >
        {collapsed ? <ChevronRightIcon size={12} /> : <ChevronLeftIcon size={12} />}
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? 'px-4 justify-center' : ''}`}>
        <div className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center shrink-0">
          <LogoWaves size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-neutral-900 text-sm leading-tight whitespace-nowrap">
              SohCahToa
            </p>
            <p className="text-neutral-400 text-xs whitespace-nowrap">Payout BDC</p>
          </div>
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
                ${isActive
                  ? 'bg-brand-orange-light text-brand-orange'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
              title={collapsed ? label : undefined}
            >
              <div
                className={`
                  flex items-center justify-center shrink-0 transition-all
                  ${isActive ? 'text-brand-orange' : 'text-neutral-400 group-hover:text-neutral-600'}
                `}
              >
                <Icon size={18} />
              </div>

              {!collapsed && (
                <span className="font-medium text-sm truncate">{label}</span>
              )}

              {badge && !collapsed && (
                <span className="ml-auto shrink-0 w-5 h-5 bg-brand-orange rounded-full text-white text-[10px] font-bold flex items-center justify-center">
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
            text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700
            transition-all w-full
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Support' : undefined}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
            <SupportIcon size={16} />
          </div>
          {!collapsed && <span className="font-medium text-sm">Support</span>}
        </button>

        {/* Divider */}
        <div className="border-t border-neutral-100 my-1" />

        {/* User profile */}
        <div
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl bg-neutral-50
            ${collapsed ? 'justify-center px-2' : ''}
          `}
        >
          <div className="w-8 h-8 rounded-full bg-brand-orange-light border-2 border-brand-orange-muted flex items-center justify-center shrink-0">
            <span className="text-brand-orange text-xs font-bold">{initials}</span>
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-neutral-800 truncate">{userName}</p>
                <p className="text-[10px] text-neutral-400 truncate">{userEmail}</p>
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
