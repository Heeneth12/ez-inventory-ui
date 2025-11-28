// 1. The Configuration Interface for the Component
export interface SearchConfig<T> {
  // Display Keys
  mainTextKey: keyof T;       // e.g., 'name' or 'productTitle'
  subTextKey?: keyof T;       // e.g., 'email' or 'sku'
  avatarColorKey?: keyof T;   // e.g., 'color'
  statusKey?: keyof T;        // e.g., 'status' - renders the pill on the right
  tagKey?: keyof T;           // e.g., 'department' - renders small text next to subtitle

  // Logic Keys
  searchableKeys: (keyof T)[]; // Which fields to search against

  // Dynamic Filters Definition
  filters?: {
    key: keyof T;
    label: string;
    type: 'select' | 'pills';
    options: string[]; // Options to populate the filter with
  }[];
}