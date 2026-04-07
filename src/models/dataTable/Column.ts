export type Column<T> = {
  key: keyof T;
  id?: string;
  label: string;
  searchable?: boolean;
  filterType?: "boolean" | "multi" | "date" | "none";
  render?: (row: T) => React.ReactNode;

  reactKey?: string;
};
