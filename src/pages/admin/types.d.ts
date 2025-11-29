export type FilterType = "all" | "confirmed" | "pending" | "rejected";

export interface FilterCounts {
  all: number;
  confirmed: number;
  rejected: number;
  pending: number;
}

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  isDanger: boolean;
  isLoading: boolean;
  action: (() => Promise<void>) | null;
}
