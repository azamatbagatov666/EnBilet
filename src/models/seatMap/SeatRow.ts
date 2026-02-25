import type { SeatCell } from "@/src/models/seatMap/SeatCell";

export type rowType = "seated" | "empty";


export interface SeatRow {
  id: string;
  type: rowType;
  label: string;      // A, B, C...
  order: number;      // for drag & reorder
  cells: SeatCell[];
}
