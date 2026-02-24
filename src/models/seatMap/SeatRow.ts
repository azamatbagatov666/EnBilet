import type { SeatCell } from "@/src/models/seatMap/SeatCell";


export interface SeatRow {
  id: string;
  label: string;      // A, B, C...
  order: number;      // for drag & reorder
  cells: SeatCell[];
}
