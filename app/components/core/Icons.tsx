// Re-exports from lucide-react with project-consistent aliases.
// Only truly brand-specific assets (logo waves, chip, VISA) remain as custom SVGs.

export {
  Home as HomeIcon,
  Calculator as CalculatorIcon,
  ArrowUpDown as TransactionsIcon,
  CreditCard as CardsIcon,
  HeadphonesIcon as SupportIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronDown as ChevronDownIcon,
  Search as SearchIcon,
  Bell as BellIcon,
  Eye as EyeOffIcon,
  TrendingUp as BuyFXIcon,
  TrendingDown as SellFXIcon,
  ArrowRightToLine as ReceiveMoneyIcon,
  ArrowUpRight as OutgoingArrowIcon,
  Check as IncomingCheckIcon,
  ArrowLeftRight as WalletSwapIcon,
  LogOut as LogoutIcon,
  Plus as PlusIcon,
} from 'lucide-react';

// ── Brand-specific custom SVGs ──────────────────────────────────────────────

interface IconProps {
  className?: string;
  size?: number;
}

export function LogoWaves({ className = '', size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" className={className}>
      <rect x="2" y="6" width="3" height="10" rx="1.5" fill="currentColor" />
      <rect x="7" y="3" width="3" height="16" rx="1.5" fill="currentColor" />
      <rect x="12" y="6" width="3" height="10" rx="1.5" fill="currentColor" />
      <rect x="17" y="8" width="3" height="6" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function ChipIcon({ className = '', size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="6" y="6" width="20" height="20" rx="3" fill="#D4A017" />
      <rect x="10" y="10" width="12" height="12" rx="1.5" fill="#B8860B" />
      <rect x="6" y="13" width="4" height="2" fill="#C8920E" />
      <rect x="22" y="13" width="4" height="2" fill="#C8920E" />
      <rect x="6" y="17" width="4" height="2" fill="#C8920E" />
      <rect x="22" y="17" width="4" height="2" fill="#C8920E" />
      <rect x="13" y="6" width="2" height="4" fill="#C8920E" />
      <rect x="17" y="6" width="2" height="4" fill="#C8920E" />
      <rect x="13" y="22" width="2" height="4" fill="#C8920E" />
      <rect x="17" y="22" width="2" height="4" fill="#C8920E" />
    </svg>
  );
}

export function VisaLogoIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 26" fill="none" className={`h-6 w-auto ${className}`}>
      <path
        d="M32.6 25H26.1L30.2 1H36.7L32.6 25ZM22 1L15.8 17.4L15.1 13.8L15.1 13.8L12.9 3.2C12.9 3.2 12.6 1 10.1 1H0.2L0 1.7C0 1.7 3.1 2.4 6.7 4.5L12.4 25H19.2L29.1 1H22ZM71.5 25H77.5L72.2 1H67C64.9 1 64.3 2.7 64.3 2.7L55.2 25H62L63.4 21H71.6L71.5 25ZM65.3 15.9L68.9 6L71 15.9H65.3ZM54.7 6.6L55.6 1.6C55.6 1.6 52.8 0.5 49.9 0.5C46.7 0.5 39.4 1.9 39.4 8.4C39.4 14.5 48.1 14.6 48.1 17.8C48.1 21 40.4 20.3 37.8 18.2L36.8 23.5C36.8 23.5 39.7 25 44.1 25C48.5 25 55.6 22.8 55.6 15.8C55.6 9.5 46.8 8.9 46.8 6.2C46.8 3.5 52.6 3.9 54.7 6.6Z"
        fill="white"
      />
    </svg>
  );
}
