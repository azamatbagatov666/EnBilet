export type CellType = "seat" | "space";

export interface SeatCell {
  id: string;
  type: CellType;
  label?: string; // only for seats
}
