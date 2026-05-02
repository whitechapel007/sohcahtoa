'use client';

import { SearchIcon, BellIcon } from '@/app/components/core/Icons';

interface TopNavProps {
  userName: string;
  notificationCount?: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return '🌤';
  if (hour < 17) return '☀️';
  return '🌙';
}

export default function TopNav({ userName, notificationCount = 9 }: TopNavProps) {
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-panel border-b border-neutral-100 shrink-0">
      {/* Left: Greeting */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-brand-orange-light border-2 border-brand-orange-muted flex items-center justify-center shrink-0">
          <span className="text-brand-orange text-xs font-bold">{initials}</span>
        </div>
        <div>
          <p className="text-xs text-neutral-500 leading-tight">
            {getGreeting()} {getGreetingEmoji()}
          </p>
          <p className="text-sm font-semibold text-neutral-900 leading-tight">{userName}</p>
        </div>
      </div>

      {/* Right: Search + Bell */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="relative flex items-center">
          <SearchIcon
            size={14}
            className="absolute left-3 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search"
            className="
              h-9 pl-8 pr-14 text-sm text-neutral-700 placeholder:text-neutral-400
              bg-neutral-50 border border-neutral-200 rounded-xl outline-none
              focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 transition-all
              w-52
            "
          />
          <kbd className="absolute right-3 text-[10px] font-medium text-neutral-400 bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-neutral-200 text-neutral-500 hover:text-brand-orange hover:border-brand-orange hover:bg-brand-orange-light transition-all">
          <BellIcon size={16} />
          {notificationCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
