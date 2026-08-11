export type ModalState =
  | "none"
  | "loading"
  | "confirm"
  | "already_entered"
  | "not_found"
  | "not_allowed"
  | "pending_response";
export type TabState = "scanner" | "directory";
export type CheckInFilterType =
  | "all"
  | "pending_entry"
  | "entered"
  | "no_access";
