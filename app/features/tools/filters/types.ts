export type FilterType =
  | "normal"
  | "light"
  | "soft"
  | "flow"
  | "cool"
  | "warm"
  | "lowkey"
  | null;

export interface FilterOption {
  id: FilterType;
  name: string;
  icon?: string;
  preset?: {
    brightness?: number;
    contrast?: number;
    saturation?: number;
    temperature?: number;
  };
}
