// Re-exports from iconsax-react with project-consistent aliases.

import type { Icon, IconProps } from "iconsax-react";
import {
  Add,
  ArrowDown2,
  ArrowLeft2,
  ArrowRight2,
  ArrowSwapHorizontal,
  Calculator,
  Cards,
  Check,
  Export,
  Eye,
  EyeSlash,
  Home,
  Logout,
  MessageQuestion,
  MoneyRecive,
  Notification,
  Repeat,
  SearchNormal,
  WalletAdd,
  WalletMinus,
} from "iconsax-react";

function withOutlineVariant(IconComponent: Icon): Icon {
  return function OutlinedIcon(props: IconProps) {
    return <IconComponent variant="Outline" {...props} />;
  };
}

export const HomeIcon = withOutlineVariant(Home);
export const CalculatorIcon = withOutlineVariant(Calculator);
export const TransactionsIcon = withOutlineVariant(Repeat);
export const CardsIcon = withOutlineVariant(Cards);
export const SupportIcon = withOutlineVariant(MessageQuestion);
export const ChevronRightIcon = withOutlineVariant(ArrowRight2);
export const ChevronLeftIcon = withOutlineVariant(ArrowLeft2);
export const ChevronDownIcon = withOutlineVariant(ArrowDown2);
export const SearchIcon = withOutlineVariant(SearchNormal);
export const BellIcon = withOutlineVariant(Notification);
export const EyeIcon = withOutlineVariant(Eye);
export const EyeOffIcon = withOutlineVariant(EyeSlash);
export const BuyFXIcon = withOutlineVariant(WalletMinus);
export const SellFXIcon = withOutlineVariant(WalletAdd);
export const ReceiveMoneyIcon = withOutlineVariant(MoneyRecive);
export const OutgoingArrowIcon = withOutlineVariant(Export);
export const IncomingCheckIcon = withOutlineVariant(Check);
export const WalletSwapIcon = withOutlineVariant(ArrowSwapHorizontal);
export const LogoutIcon = withOutlineVariant(Logout);
export const PlusIcon = withOutlineVariant(Add);
