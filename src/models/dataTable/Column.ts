 export type Column<T> = {
  key: keyof T;
  label: string;
  searchable?: boolean;
  filterType?: "boolean" | "multi" | "date" | "none";
  render?: (row: T) => React.ReactNode;
};